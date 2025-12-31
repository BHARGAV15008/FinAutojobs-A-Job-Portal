import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import jwt from "jsonwebtoken";
import {
  BaseUser,
  Applicant,
  Recruiter,
  Admin,
  findUserByIdAndRole,
  createUserByRole,
  authenticateUser
} from '../models/UserModels.js';
import networkConfig from "../utils/networkConfig.js";

const router = express.Router();

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "your-jwt-secret-key-change-this-in-production";

// Generate OAuth callback URL dynamically
const getCallbackURL = (provider) => {
  // If explicitly set in env, use that
  const envKey = `${provider.toUpperCase()}_CALLBACK_URL`;
  if (process.env[envKey]) {
    return process.env[envKey];
  }

  // Otherwise, generate dynamically
  const backendURL = networkConfig.getBackendURL(process.env.PORT || 5000);
  return `${backendURL}/api/oauth/${provider}/callback`;
};

// OAuth Configuration - Lazy loaded to ensure env vars are available
const getOAuthConfig = () => {
  console.log(
    "🔍 Loading OAuth config - Google Client ID:",
    process.env.GOOGLE_CLIENT_ID ? "Found" : "Not found"
  );
  console.log(
    "🔍 Loading OAuth config - Google Client Secret:",
    process.env.GOOGLE_CLIENT_SECRET ? "Found" : "Not found"
  );

  const googleCallbackURL = getCallbackURL("google");
  const linkedinCallbackURL = getCallbackURL("linkedin");

  console.log("🔗 Google Callback URL:", googleCallbackURL);
  console.log("🔗 LinkedIn Callback URL:", linkedinCallbackURL);

  return {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
      callbackURL: googleCallbackURL,
    },
    linkedin: {
      clientID: process.env.LINKEDIN_CLIENT_ID || "your-linkedin-client-id",
      clientSecret:
        process.env.LINKEDIN_CLIENT_SECRET || "your-linkedin-client-secret",
      callbackURL: linkedinCallbackURL,
      scope: ["r_liteprofile", "r_emailaddress"],
    },
  };
};

// Configure Google OAuth Strategy - Lazy initialization
const initializeGoogleStrategy = () => {
  const OAUTH_CONFIG = getOAuthConfig();
  passport.use(
    new GoogleStrategy(
      {
        clientID: OAUTH_CONFIG.google.clientID,
        clientSecret: OAUTH_CONFIG.google.clientSecret,
        callbackURL: OAUTH_CONFIG.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(
            "🔍 Google OAuth Profile:",
            JSON.stringify(profile, null, 2)
          );

          // Extract user information
          const userInfo = {
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName:
              profile.name?.givenName ||
              profile.displayName?.split(" ")[0] ||
              "",
            lastName:
              profile.name?.familyName ||
              profile.displayName?.split(" ").slice(1).join(" ") ||
              "",
            profileImage: profile.photos?.[0]?.value,
            verified: profile.emails?.[0]?.verified || false,
            accessToken,
            refreshToken,
          };

          return done(null, userInfo);
        } catch (error) {
          console.error("Google OAuth Error:", error);
          return done(error, null);
        }
      }
    )
  );
};

// Configure LinkedIn OAuth Strategy - Lazy initialization
const initializeLinkedInStrategy = () => {
  const OAUTH_CONFIG = getOAuthConfig();
  passport.use(
    new LinkedInStrategy(
      {
        clientID: OAUTH_CONFIG.linkedin.clientID,
        clientSecret: OAUTH_CONFIG.linkedin.clientSecret,
        callbackURL: OAUTH_CONFIG.linkedin.callbackURL,
        scope: OAUTH_CONFIG.linkedin.scope,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(
            "🔍 LinkedIn OAuth Profile:",
            JSON.stringify(profile, null, 2)
          );

          // Extract user information
          const userInfo = {
            provider: "linkedin",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            firstName:
              profile.name?.givenName ||
              profile.displayName?.split(" ")[0] ||
              "",
            lastName:
              profile.name?.familyName ||
              profile.displayName?.split(" ").slice(1).join(" ") ||
              "",
            profileImage: profile.photos?.[0]?.value,
            verified: true, // LinkedIn accounts are generally verified
            accessToken,
            refreshToken,
            headline: profile._json?.headline,
            industry: profile._json?.industry,
            location: profile._json?.location?.name,
          };

          return done(null, userInfo);
        } catch (error) {
          console.error("LinkedIn OAuth Error:", error);
          return done(error, null);
        }
      }
    )
  );
};

// Initialize OAuth strategies when environment is ready
const initializeOAuth = () => {
  console.log("🔧 Initializing OAuth strategies...");
  initializeGoogleStrategy();
  initializeLinkedInStrategy();
  console.log("✅ OAuth strategies initialized (Google and LinkedIn only)");
};

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Helper function to find or create OAuth user
const findOrCreateOAuthUser = async (userInfo, role = "applicant") => {
  try {
    console.log("🔍 Finding or creating OAuth user:", {
      email: userInfo.email,
      provider: userInfo.provider,
      role,
    });

    // First, check if email exists with ANY role
    let existingUserAnyRole = await BaseUser.findOne({
      email: userInfo.email,
    });

    if (existingUserAnyRole) {
      // If user exists with same role, update OAuth info and return
      if (existingUserAnyRole.role === role) {
        console.log(
          "✅ Found existing user with same role:",
          existingUserAnyRole._id
        );

        // Update OAuth information if not already set
        if (
          !existingUserAnyRole.oauthProviders?.find(
            (p) => p.provider === userInfo.provider
          )
        ) {
          existingUserAnyRole.oauthProviders =
            existingUserAnyRole.oauthProviders || [];
          existingUserAnyRole.oauthProviders.push({
            provider: userInfo.provider,
            providerId: userInfo.providerId,
            accessToken: userInfo.accessToken,
            refreshToken: userInfo.refreshToken,
          });

          // Update profile image if not set
          if (!existingUserAnyRole.profileImage && userInfo.profileImage) {
            existingUserAnyRole.profileImage = userInfo.profileImage;
          }

          await existingUserAnyRole.save();
        }

        return { user: existingUserAnyRole, isNewUser: false };
      } else {
        // Email exists with different role - throw error
        console.log(
          "❌ Email exists with different role:",
          existingUserAnyRole.role,
          "vs requested:",
          role
        );
        const error = new Error(
          `Email ${userInfo.email} is already registered as ${existingUserAnyRole.role}. Please use a different email or login with the correct role.`
        );
        error.code = "EMAIL_ROLE_CONFLICT";
        error.existingRole = existingUserAnyRole.role;
        error.requestedRole = role;
        throw error;
      }
    }

    // Create new user with OAuth information
    console.log("🔍 Creating new OAuth user");

    const userData = {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      role: role,
      emailVerified: userInfo.verified,
      profileImage: userInfo.profileImage,
      oauthProviders: [
        {
          provider: userInfo.provider,
          providerId: userInfo.providerId,
          accessToken: userInfo.accessToken,
          refreshToken: userInfo.refreshToken,
        },
      ],
      // Generate a random password for OAuth users (they won't use it)
      password: Math.random().toString(36).slice(-12) + "Aa1!",
      // Role-specific data
      ...(role === "recruiter" && {
        companyInfo: {
          companyName: userInfo.organization || "Not specified",
          department: "Not specified",
          jobTitle: userInfo.headline || "Not specified",
        },
      }),
      ...(role === "applicant" && {
        skills: { primary: [], technical: [], soft: [] },
        careerInfo: {
          headline: userInfo.headline || "",
          industry: userInfo.industry || "",
          location: userInfo.location || "",
        },
        documents: {},
      }),
    };

    const newUser = await createUserByRole(userData);
    console.log("✅ Created new OAuth user:", newUser._id);

    return { user: newUser, isNewUser: true };
  } catch (error) {
    console.error("❌ Error in findOrCreateOAuthUser:", error);
    throw error;
  }
};

// Google OAuth Routes
router.get("/google", (req, res, next) => {
  const { role, action } = req.query;

  // Store role and action in session for callback
  req.session = req.session || {};
  req.session.oauthRole = role || "applicant";
  req.session.oauthAction = action || "login"; // 'login' or 'link'

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const userInfo = req.user;
      const role = req.session?.oauthRole || "applicant";
      const action = req.session?.oauthAction || "login";

      console.log("🔍 Google OAuth Callback - Role:", role, "Action:", action);

      const frontendUrl =
        process.env.FRONTEND_URL || "http://192.168.41.134:3000";

      if (action === "link") {
        // Handle account linking
        const linkingToken = req.query.state; // You might need to pass this differently

        // Redirect to frontend with OAuth data for linking
        const linkingData = encodeURIComponent(
          JSON.stringify({
            provider: "google",
            providerId: userInfo.providerId,
            email: userInfo.email,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            profileImage: userInfo.profileImage,
            accessToken: userInfo.accessToken,
            refreshToken: userInfo.refreshToken,
          })
        );

        res.redirect(
          `${frontendUrl}/oauth/link-callback?data=${linkingData}&provider=google`
        );
        return;
      }

      // Regular login flow
      const { user, isNewUser } = await findOrCreateOAuthUser(userInfo, role);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          userId: user._id,
          email: user.email,
          role: user.role,
          provider: "google",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Redirect to frontend with token - Fixed URL path
      const redirectUrl = `${frontendUrl}/auth/oauth-callback?token=${token}&provider=google&role=${user.role}&isNewUser=${isNewUser}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Google OAuth Callback Error:", error);
      const frontendUrl =
        process.env.FRONTEND_URL || "http://192.168.41.134:3000";

      // Handle specific error types
      if (error.code === "EMAIL_ROLE_CONFLICT") {
        res.redirect(
          `${frontendUrl}/auth/oauth-error?error=email_role_conflict&message=${encodeURIComponent(
            error.message
          )}&existingRole=${error.existingRole}&requestedRole=${
            error.requestedRole
          }&provider=google`
        );
      } else {
        res.redirect(
          `${frontendUrl}/auth/oauth-error?error=oauth_failed&message=${encodeURIComponent(
            error.message
          )}&provider=google`
        );
      }
    }
  }
);

// LinkedIn OAuth Routes
router.get("/linkedin", (req, res, next) => {
  const { role } = req.query;

  // Store role in session for callback
  req.session = req.session || {};
  req.session.oauthRole = role || "applicant";

  passport.authenticate("linkedin", {
    scope: ["r_liteprofile", "r_emailaddress"],
  })(req, res, next);
});

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { session: false }),
  async (req, res) => {
    try {
      const userInfo = req.user;
      const role = req.session?.oauthRole || "applicant";

      console.log("🔍 LinkedIn OAuth Callback - Role:", role);

      // Find or create user
      const { user, isNewUser } = await findOrCreateOAuthUser(userInfo, role);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          userId: user._id,
          email: user.email,
          role: user.role,
          provider: "linkedin",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Redirect to frontend with token - Fixed URL path
      const frontendUrl =
        process.env.FRONTEND_URL || "http://192.168.41.134:3000";
      const redirectUrl = `${frontendUrl}/auth/oauth-callback?token=${token}&provider=linkedin&role=${user.role}&isNewUser=${isNewUser}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ LinkedIn OAuth Callback Error:", error);
      const frontendUrl =
        process.env.FRONTEND_URL || "http://192.168.41.134:3000";

      // Handle specific error types
      if (error.code === "EMAIL_ROLE_CONFLICT") {
        res.redirect(
          `${frontendUrl}/auth/oauth-error?error=email_role_conflict&message=${encodeURIComponent(
            error.message
          )}&existingRole=${error.existingRole}&requestedRole=${
            error.requestedRole
          }&provider=linkedin`
        );
      } else {
        res.redirect(
          `${frontendUrl}/auth/oauth-error?error=oauth_failed&message=${encodeURIComponent(
            error.message
          )}&provider=linkedin`
        );
      }
    }
  }
);

// OAuth status endpoint
router.get("/status", (req, res) => {
  const OAUTH_CONFIG = getOAuthConfig();
  res.json({
    success: true,
    message: "OAuth service is running (Google and LinkedIn only)",
    providers: {
      google: {
        enabled:
          !!OAUTH_CONFIG.google.clientID &&
          OAUTH_CONFIG.google.clientID !== "your-google-client-id",
        authUrl: "/api/oauth/google",
      },
      linkedin: {
        enabled:
          !!OAUTH_CONFIG.linkedin.clientID &&
          OAUTH_CONFIG.linkedin.clientID !== "your-linkedin-client-id",
        authUrl: "/api/oauth/linkedin",
      },
    },
  });
});

// OAuth config endpoint (for frontend compatibility)
router.get("/config", (req, res) => {
  const OAUTH_CONFIG = getOAuthConfig();
  res.json({
    success: true,
    google: {
      enabled:
        !!OAUTH_CONFIG.google.clientID &&
        OAUTH_CONFIG.google.clientID !== "your-google-client-id",
      clientId:
        OAUTH_CONFIG.google.clientID !== "your-google-client-id"
          ? OAUTH_CONFIG.google.clientID
          : null,
    },
    linkedin: {
      enabled:
        !!OAUTH_CONFIG.linkedin.clientID &&
        OAUTH_CONFIG.linkedin.clientID !== "your-linkedin-client-id",
      clientId:
        OAUTH_CONFIG.linkedin.clientID !== "your-linkedin-client-id"
          ? OAUTH_CONFIG.linkedin.clientID
          : null,
    },
  });
});

// Debug endpoint to check OAuth configuration
router.get("/debug", (req, res) => {
  const OAUTH_CONFIG = getOAuthConfig();
  res.json({
    success: true,
    debug: {
      googleClientId: OAUTH_CONFIG.google.clientID,
      googleCallbackUrl: OAUTH_CONFIG.google.callbackURL,
      environment: process.env.NODE_ENV,
      serverUrl: `http://192.168.41.134:${process.env.PORT || 5000}`,
      expectedRedirectUri: OAUTH_CONFIG.google.callbackURL,
    },
    instructions: {
      message: "Add this EXACT redirect URI to your Google Cloud Console:",
      redirectUri: OAUTH_CONFIG.google.callbackURL,
      googleConsoleUrl: "https://console.cloud.google.com/apis/credentials",
    },
  });
});

// Export initialization function to be called after env vars are loaded
export { initializeOAuth };

export default router;
