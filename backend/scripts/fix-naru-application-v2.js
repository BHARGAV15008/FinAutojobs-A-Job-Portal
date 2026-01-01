import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import models
const ApplicationInformationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Application",
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "BaseUser",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Job",
    },
    basicInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      bio: String,
      profileImage: String,
    },
    expectedSalary: {
      rawSalaryText: String,
      displayText: String,
    },
    experience: {
      totalYears: Number,
      rawExperienceText: String,
      currentJob: {
        title: String,
        company: String,
      },
    },
    education: [
      {
        degree: String,
        institution: String,
        graduationYear: Number,
        fieldOfStudy: String,
      },
    ],
    workExperience: [
      {
        jobTitle: String,
        companyName: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        description: String,
      },
    ],
    skills: {
      technical: [String],
      soft: [String],
      languages: [String],
      certifications: [String],
    },
    location: {
      city: String,
      state: String,
      country: String,
      address: String,
      postalCode: String,
    },
    jobPreferences: {
      preferredLocations: [String],
      willingToRelocate: Boolean,
      remoteWorkPreference: String,
      expectedSalaryRange: {
        min: Number,
        max: Number,
        currency: String,
      },
      noticePeriod: String,
      availableStartDate: Date,
    },
    documents: {
      resume: String,
      coverLetter: String,
      certificates: [String],
      portfolio: String,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
      website: String,
    },
    applicationSpecific: {
      coverLetter: String,
      additionalInfo: String,
      referralSource: String,
      noticePeriod: String,
    },
    snapshotDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ApplicationInformation =
  mongoose.models.ApplicationInformation ||
  mongoose.model("ApplicationInformation", ApplicationInformationSchema);

const ApplicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseUser",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicationStatus: {
      type: String,
      enum: [
        "pending",
        "reviewed",
        "shortlisted",
        "interview",
        "rejected",
        "accepted",
        "withdrawn",
      ],
      default: "pending",
    },
    applicationInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplicationInformation",
    },
    applicationData: mongoose.Schema.Types.Mixed,
    applicantSnapshot: mongoose.Schema.Types.Mixed,
    jobSnapshot: mongoose.Schema.Types.Mixed,
    appliedDate: Date,
    createdAt: Date,
    updatedAt: Date,
  },
  { strict: false }
);

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);

const BaseUserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    bio: String,
    profileImage: String,
    skills: [String],
    education: Array,
    workExperience: Array,
    socialLinks: mongoose.Schema.Types.Mixed,
    portfolioLinks: [String],
    documents: mongoose.Schema.Types.Mixed,
    experience: String,
    careerInfo: mongoose.Schema.Types.Mixed,
    jobPreferences: mongoose.Schema.Types.Mixed,
  },
  { strict: false, discriminatorKey: "role" }
);

const BaseUser =
  mongoose.models.BaseUser || mongoose.model("BaseUser", BaseUserSchema);

const JobSchema = new mongoose.Schema(
  {
    title: String,
    jobTitle: String,
    company: String,
    companyName: String,
    location: String,
    type: String,
    jobType: String,
  },
  { strict: false }
);

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

async function fixNaruApplication() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const applicationId = "69560bc0a4670cff8a7c0e7b";
    const applicantId = "694d5cb4a65e240dad9d8b43";

    // Find the application
    console.log("🔍 Finding application...");
    const application = await Application.findById(applicationId)
      .populate("jobId")
      .lean();

    if (!application) {
      console.log("❌ Application not found");
      process.exit(1);
    }

    console.log("✅ Found application:", {
      _id: application._id,
      applicantId: application.applicantId,
      jobId: application.jobId?._id,
      status: application.applicationStatus,
      hasApplicationInfo: !!application.applicationInfo,
    });

    // Find the user
    console.log("🔍 Finding user...");
    const user = await BaseUser.findById(applicantId).lean();

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("✅ Found user:", {
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      experience: user.experience,
      hasSkills: !!user.skills?.length,
      hasEducation: !!user.education?.length,
      hasWorkExperience: !!user.workExperience?.length,
    });

    // Check if ApplicationInformation already exists
    const existingAppInfo = await ApplicationInformation.findOne({
      applicationId: new mongoose.Types.ObjectId(applicationId),
    });

    if (existingAppInfo) {
      console.log(
        "ℹ️ ApplicationInformation already exists:",
        existingAppInfo._id
      );

      // Update the application to link to it
      if (!application.applicationInfo) {
        await Application.findByIdAndUpdate(applicationId, {
          applicationInfo: existingAppInfo._id,
        });
        console.log("✅ Linked existing ApplicationInformation to Application");
      }

      process.exit(0);
    }

    // Create ApplicationInformation
    console.log("📝 Creating ApplicationInformation...");

    // Parse experience text
    const experienceText =
      application.applicantSnapshot?.experience ||
      user.experience ||
      "Not specified";
    let experienceYears = 0;
    if (experienceText.includes("1-3")) experienceYears = 2;
    else if (experienceText.includes("3-5")) experienceYears = 4;
    else if (experienceText.includes("5-10")) experienceYears = 7;
    else if (experienceText.includes("10+")) experienceYears = 10;

    // Parse skills - handle both string and array formats
    let technicalSkills = [];
    try {
      if (typeof user.skills === "string") {
        const parsed = JSON.parse(user.skills);
        if (Array.isArray(parsed)) {
          technicalSkills = parsed[0]?.technical || parsed[0]?.primary || [];
        } else if (parsed.technical) {
          technicalSkills = parsed.technical;
        }
      } else if (Array.isArray(user.skills)) {
        technicalSkills = user.skills;
      }
    } catch (e) {
      console.log("⚠️ Could not parse skills:", user.skills);
      technicalSkills = [];
    }

    const appInfoData = {
      applicationId: new mongoose.Types.ObjectId(applicationId),
      applicantId: new mongoose.Types.ObjectId(applicantId),
      jobId: new mongoose.Types.ObjectId(application.jobId._id),
      basicInfo: {
        firstName:
          user.firstName ||
          application.applicantSnapshot?.fullName?.split(" ")[0] ||
          "",
        lastName:
          user.lastName ||
          application.applicantSnapshot?.fullName
            ?.split(" ")
            .slice(1)
            .join(" ") ||
          "",
        email: user.email || application.applicantSnapshot?.email || "",
        phone: user.phone || application.applicantSnapshot?.phone || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      },
      expectedSalary: {
        rawSalaryText: application.applicationData?.expectedSalary || "",
        displayText:
          application.applicationData?.expectedSalary || "Not specified",
      },
      experience: {
        totalYears: experienceYears,
        rawExperienceText: experienceText,
        currentJob: user.workExperience?.[0]
          ? {
              title: user.workExperience[0].jobTitle || "",
              company: user.workExperience[0].companyName || "",
            }
          : {},
      },
      education:
        user.education || application.applicantSnapshot?.education || [],
      workExperience:
        user.workExperience ||
        application.applicantSnapshot?.workExperience ||
        [],
      skills: {
        technical: technicalSkills,
        soft: [],
        languages: [],
        certifications: user.documents?.certificates || [],
      },
      location: {
        city: user.careerInfo?.location?.city || "",
        state: user.careerInfo?.location?.state || "",
        country: user.careerInfo?.location?.country || "",
        address: user.careerInfo?.location?.address || "",
        postalCode: user.careerInfo?.location?.postalCode || "",
      },
      jobPreferences: {
        preferredLocations: user.jobPreferences?.preferredLocations || [],
        willingToRelocate:
          application.applicationData?.willingToRelocate ||
          user.jobPreferences?.willingToRelocate ||
          false,
        remoteWorkPreference:
          application.applicationData?.remoteWorkPreference ||
          user.jobPreferences?.remoteWorkPreference ||
          "No preference",
        expectedSalaryRange: user.jobPreferences?.expectedSalaryRange || {},
        noticePeriod:
          application.applicationData?.noticePeriod ||
          user.jobPreferences?.noticePeriod ||
          "",
        availableStartDate: user.jobPreferences?.availableStartDate || null,
      },
      documents: {
        resume: user.documents?.resume || "",
        coverLetter: application.applicationData?.coverLetter || "",
        certificates: user.documents?.certificates || [],
        portfolio: user.documents?.portfolio || "",
      },
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || "",
        github: user.socialLinks?.github || "",
        portfolio:
          user.socialLinks?.portfolio || user.portfolioLinks?.[0] || "",
        twitter: user.socialLinks?.twitter || "",
        website: user.socialLinks?.website || "",
      },
      applicationSpecific: {
        coverLetter: application.applicationData?.coverLetter || "",
        additionalInfo: application.applicationData?.additionalInfo || "",
        referralSource: application.applicationData?.referralSource || "",
        noticePeriod: application.applicationData?.noticePeriod || "",
      },
      snapshotDate:
        application.appliedDate || application.createdAt || new Date(),
    };

    const applicationInfo = new ApplicationInformation(appInfoData);
    await applicationInfo.save();

    console.log("✅ Created ApplicationInformation:", applicationInfo._id);

    // Update the application to link to the ApplicationInformation
    await Application.findByIdAndUpdate(applicationId, {
      applicationInfo: applicationInfo._id,
    });

    console.log("✅ Linked ApplicationInformation to Application");

    console.log("\n📊 Summary:");
    console.log("  Application ID:", applicationId);
    console.log("  ApplicationInformation ID:", applicationInfo._id);
    console.log("  Applicant:", `${user.firstName} ${user.lastName}`);
    console.log("  Experience:", experienceText);
    console.log("  Skills:", (user.skills || []).length);
    console.log("  Education:", (user.education || []).length);
    console.log("  Work Experience:", (user.workExperience || []).length);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixNaruApplication();
