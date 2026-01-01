import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { BaseUser } from '../models/UserModels.js';

const router = express.Router();

// Get linked social accounts for authenticated user
router.get('/linked-accounts', authenticateToken, async (req, res) => {
  try {
    const user = await BaseUser.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return sanitized linked accounts info
    const linkedAccounts = (user.oauthProviders || []).map(provider => ({
      provider: provider.provider,
      email: provider.email,
      name: provider.name,
      linkedAt: provider.linkedAt || provider.createdAt,
      verified: provider.verified || true
    }));

    res.json({
      success: true,
      linkedAccounts
    });
  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch linked accounts'
    });
  }
});

// Link a new social account to existing user
router.post('/link-account', authenticateToken, async (req, res) => {
  try {
    const { provider, providerId, email, name, profileImage, accessToken, refreshToken } = req.body;
    
    const user = await BaseUser.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if this provider is already linked
    const existingProvider = user.oauthProviders?.find(p => p.provider === provider);
    
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: `${provider} account is already linked`
      });
    }

    // Check if another user has this OAuth account
    const existingUser = await BaseUser.findOne({
      'oauthProviders.provider': provider,
      'oauthProviders.providerId': providerId,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `This ${provider} account is already linked to another user`
      });
    }

    // Add the new OAuth provider
    user.oauthProviders = user.oauthProviders || [];
    user.oauthProviders.push({
      provider,
      providerId,
      email,
      name,
      profileImage,
      accessToken,
      refreshToken,
      linkedAt: new Date(),
      verified: true
    });

    // Update profile image if not set and provider has one
    if (!user.profileImage && profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
      linkedAccount: {
        provider,
        email,
        name,
        linkedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error linking account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link account'
    });
  }
});

// Unlink a social account from user
router.post('/unlink-account', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: 'Provider is required'
      });
    }

    const user = await BaseUser.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (can't unlink all OAuth if no password)
    const hasPassword = user.password && user.password.length > 0;
    const oauthProviders = user.oauthProviders || [];
    
    if (!hasPassword && oauthProviders.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink the last authentication method. Please set a password first.'
      });
    }

    // Find and remove the provider
    const providerIndex = oauthProviders.findIndex(p => p.provider === provider);
    
    if (providerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `${provider} account is not linked`
      });
    }

    user.oauthProviders.splice(providerIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: `${provider} account unlinked successfully`
    });
  } catch (error) {
    console.error('Error unlinking account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink account'
    });
  }
});

// Get available OAuth providers and their status
router.get('/providers', async (req, res) => {
  try {
    const providers = {
      google: {
        enabled: !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id',
        name: 'Google',
        description: 'Sign in with your Google account'
      },
      microsoft: {
        enabled: !!process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_ID !== 'your-microsoft-client-id',
        name: 'Microsoft',
        description: 'Sign in with your Microsoft account'
      },
      apple: {
        enabled: !!process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_ID !== 'your-apple-client-id',
        name: 'Apple',
        description: 'Sign in with your Apple ID'
      },
      linkedin: {
        enabled: !!process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id',
        name: 'LinkedIn',
        description: 'Connect with your LinkedIn profile'
      }
    };

    res.json({
      success: true,
      providers
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers'
    });
  }
});

// Merge accounts endpoint (for when user tries to OAuth with existing email)
router.post('/merge-accounts', authenticateToken, async (req, res) => {
  try {
    const { oauthData, confirmMerge } = req.body;
    
    if (!confirmMerge) {
      return res.status(400).json({
        success: false,
        message: 'Account merge confirmation required'
      });
    }

    const user = await BaseUser.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add OAuth provider to existing account
    user.oauthProviders = user.oauthProviders || [];
    
    // Check if provider already exists
    const existingProvider = user.oauthProviders.find(p => p.provider === oauthData.provider);
    
    if (!existingProvider) {
      user.oauthProviders.push({
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        email: oauthData.email,
        name: oauthData.name,
        profileImage: oauthData.profileImage,
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken,
        linkedAt: new Date(),
        verified: true
      });

      await user.save();
    }

    res.json({
      success: true,
      message: 'Accounts merged successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error merging accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge accounts'
    });
  }
});

export default router;
