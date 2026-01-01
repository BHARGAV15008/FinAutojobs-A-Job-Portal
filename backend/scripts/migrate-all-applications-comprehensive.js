import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import models with all schemas
const ApplicationInformationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Application",
      unique: true,
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
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      bio: { type: String },
      profileImage: { type: String },
    },
    expectedSalary: {
      salaryRange: {
        min: Number,
        max: Number,
        isNegotiable: Boolean,
        currency: { type: String, default: "INR" },
        period: { type: String, default: "yearly" },
      },
      rawSalaryText: String,
      displayText: String,
    },
    experience: {
      totalYears: { type: Number, default: 0 },
      experienceRange: {
        min: { type: Number, default: 0 },
        max: Number,
        isPlus: Boolean,
      },
      rawExperienceText: String,
      currentJob: {
        jobTitle: String,
        companyName: String,
        isCurrentlyWorking: Boolean,
        startDate: Date,
        endDate: Date,
      },
    },
    education: [
      {
        educationId: mongoose.Schema.Types.ObjectId,
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        grade: String,
        percentage: Number,
        cgpa: Number,
        isCurrentlyStudying: Boolean,
        achievements: [String],
        relevantCoursework: [String],
      },
    ],
    socialLinks: {
      linkedin: {
        url: String,
        isVerified: Boolean,
      },
      github: {
        url: String,
        isVerified: Boolean,
      },
      portfolio: {
        url: String,
        isVerified: Boolean,
      },
      twitter: String,
      behance: String,
      dribbble: String,
      stackoverflow: String,
      personalWebsite: String,
    },
    skills: {
      primary: [
        {
          skill: { type: String, required: true },
          proficiency: String,
          yearsOfExperience: Number,
        },
      ],
      technical: [
        {
          skill: { type: String, required: true },
          proficiency: String,
          yearsOfExperience: Number,
          category: String,
        },
      ],
      soft: [
        {
          skill: { type: String, required: true },
          proficiency: String,
        },
      ],
      languages: [
        {
          language: { type: String, required: true },
          proficiency: String,
          canRead: Boolean,
          canWrite: Boolean,
          canSpeak: Boolean,
        },
      ],
    },
    workExperience: [
      {
        experienceId: mongoose.Schema.Types.ObjectId,
        companyName: { type: String, required: true },
        jobTitle: { type: String, required: true },
        employmentType: String,
        startDate: { type: Date, required: true },
        endDate: Date,
        isCurrentJob: Boolean,
        location: {
          city: String,
          state: String,
          country: String,
          isRemote: Boolean,
        },
        description: String,
        keyResponsibilities: [String],
        achievements: [String],
        skillsUsed: [String],
        salary: {
          amount: Number,
          currency: String,
          period: String,
        },
      },
    ],
    location: {
      current: {
        city: String,
        state: String,
        country: { type: String, default: "India" },
        address: String,
        pincode: String,
      },
      preferences: {
        preferredLocations: [String],
        willingToRelocate: Boolean,
        remoteWorkPreference: String,
        maxCommuteDistance: Number,
      },
    },
    jobPreferences: {
      preferredJobTypes: [String],
      preferredIndustries: [String],
      preferredCompanySizes: [String],
      preferredWorkEnvironments: [String],
      willingToRelocate: Boolean,
      remoteWorkPreference: String,
      expectedSalaryRange: {
        min: Number,
        max: Number,
        currency: String,
      },
      noticePeriod: String,
      availableStartDate: Date,
      currentlyEmployed: Boolean,
    },
    documents: {
      resumeUrl: String,
      coverLetterUrl: String,
      portfolioUrl: String,
      certifications: [String],
      transcripts: [String],
      references: [
        {
          name: String,
          designation: String,
          company: String,
          email: String,
          phone: String,
          relationship: String,
        },
      ],
    },
    applicationSpecific: {
      coverLetter: String,
      whyInterested: String,
      additionalInfo: String,
      referralSource: String,
      howDidYouHear: String,
      questionsForEmployer: [String],
      availabilityForInterview: String,
      noticePeriod: String,
      expectedJoiningDate: Date,
      salaryExpectation: String,
      questionsAndAnswers: [
        {
          question: String,
          answer: String,
          questionType: String,
        },
      ],
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
    skills: mongoose.Schema.Types.Mixed,
    education: Array,
    workExperience: Array,
    socialLinks: mongoose.Schema.Types.Mixed,
    portfolioLinks: [String],
    documents: mongoose.Schema.Types.Mixed,
    experience: String,
    careerInfo: mongoose.Schema.Types.Mixed,
    jobPreferences: mongoose.Schema.Types.Mixed,
    yearsOfExperience: Number,
    portfolio_url: String,
    linkedin_url: String,
    github_url: String,
    currentLocation: mongoose.Schema.Types.Mixed,
    address: mongoose.Schema.Types.Mixed,
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

async function migrateAllApplications() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all applications without ApplicationInformation
    console.log("🔍 Finding applications without ApplicationInformation...");
    const applications = await Application.find({
      $or: [{ applicationInfo: null }, { applicationInfo: { $exists: false } }],
    })
      .populate("jobId")
      .lean();

    console.log(
      `📊 Found ${applications.length} applications without ApplicationInformation`
    );

    if (applications.length === 0) {
      console.log("✅ All applications already have ApplicationInformation");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const application of applications) {
      try {
        console.log(`\n🔍 Processing application ${application._id}...`);

        // Find the user
        const user = await BaseUser.findById(application.applicantId).lean();
        if (!user) {
          console.log(`❌ User not found for application ${application._id}`);
          errorCount++;
          errors.push({
            applicationId: application._id,
            error: "User not found",
          });
          continue;
        }

        // Check if ApplicationInformation already exists
        const existingAppInfo = await ApplicationInformation.findOne({
          applicationId: application._id,
        });

        if (existingAppInfo) {
          console.log(
            `ℹ️  ApplicationInformation already exists for ${application._id}`
          );
          // Just link it if not already linked
          if (!application.applicationInfo) {
            await Application.findByIdAndUpdate(application._id, {
              applicationInfo: existingAppInfo._id,
            });
            console.log(
              `✅ Linked existing ApplicationInformation to Application`
            );
          }
          successCount++;
          continue;
        }

        // Parse experience
        const experienceText =
          application.applicantSnapshot?.experience ||
          user.experience ||
          "Not specified";
        let experienceYears = 0;
        if (experienceText.includes("1-3")) experienceYears = 2;
        else if (experienceText.includes("3-5")) experienceYears = 4;
        else if (experienceText.includes("5-10")) experienceYears = 7;
        else if (experienceText.includes("10+")) experienceYears = 10;

        // Parse skills
        let userSkills = user.skills || [];
        if (typeof userSkills === "string") {
          try {
            userSkills = JSON.parse(userSkills);
          } catch (e) {
            userSkills = [];
          }
        }
        if (
          Array.isArray(userSkills) &&
          userSkills.length > 0 &&
          typeof userSkills[0] === "string"
        ) {
          try {
            const parsed = JSON.parse(userSkills[0]);
            if (parsed) userSkills = parsed;
          } catch (e) {
            // Keep as is
          }
        }

        // Convert skills to proper format
        const convertToSkillObjects = (skills) => {
          if (!skills) return [];
          if (Array.isArray(skills)) {
            return skills
              .map((skill) => {
                if (typeof skill === "string") {
                  return { skill: skill, proficiency: "intermediate" };
                }
                return skill;
              })
              .filter((s) => s && s.skill);
          }
          return [];
        };

        // Create ApplicationInformation
        const appInfoData = {
          applicationId: application._id,
          applicantId: application.applicantId,
          jobId: application.jobId._id,
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
                  jobTitle: user.workExperience[0].jobTitle || "",
                  companyName: user.workExperience[0].companyName || "",
                  isCurrentlyWorking:
                    user.workExperience[0].isCurrentJob || false,
                }
              : {},
          },
          education:
            user.education || application.applicantSnapshot?.education || [],
          workExperience: (
            user.workExperience ||
            application.applicantSnapshot?.workExperience ||
            []
          ).filter((we) => we.jobTitle && we.companyName && we.startDate),
          skills: {
            technical: convertToSkillObjects(
              userSkills.technical || userSkills
            ),
            soft: convertToSkillObjects(userSkills.soft || []),
            languages: (userSkills.languages || []).map((lang) => ({
              language: typeof lang === "string" ? lang : lang.language,
              proficiency: "intermediate",
            })),
          },
          location: {
            current: {
              city: user.currentLocation?.city || user.address?.city || "",
              state: user.currentLocation?.state || user.address?.state || "",
              country:
                user.currentLocation?.country ||
                user.address?.country ||
                "India",
              address: user.address?.address || "",
              pincode: user.address?.pincode || "",
            },
            preferences: {
              willingToRelocate:
                application.applicationData?.willingToRelocate || false,
              remoteWorkPreference: application.applicationData
                ?.remoteWorkPreference
                ? "fully-remote"
                : "no",
            },
          },
          jobPreferences: {
            willingToRelocate:
              application.applicationData?.willingToRelocate ||
              user.jobPreferences?.willingToRelocate ||
              false,
            remoteWorkPreference: application.applicationData
              ?.remoteWorkPreference
              ? "fully-remote"
              : user.jobPreferences?.remoteWorkPreference || "no",
            noticePeriod:
              application.applicationData?.noticePeriod ||
              user.jobPreferences?.noticePeriod ||
              "",
            availableStartDate: user.jobPreferences?.availableStartDate || null,
          },
          documents: {
            resumeUrl:
              application.applicationData?.resumeUrl ||
              user.documents?.resume ||
              "",
            coverLetterUrl: application.applicationData?.coverLetter || "",
            portfolioUrl: user.documents?.portfolio || user.portfolio_url || "",
            certifications: user.documents?.certificates || [],
          },
          socialLinks: {
            linkedin: {
              url: user.socialLinks?.linkedin || user.linkedin_url || "",
            },
            github: {
              url: user.socialLinks?.github || user.github_url || "",
            },
            portfolio: {
              url:
                user.socialLinks?.portfolio ||
                user.portfolioLinks?.[0] ||
                user.portfolio_url ||
                "",
            },
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

        // Link to application
        await Application.findByIdAndUpdate(application._id, {
          applicationInfo: applicationInfo._id,
        });

        console.log(
          `✅ Created ApplicationInformation for application ${application._id}`
        );
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error processing application ${application._id}:`,
          error.message
        );
        errorCount++;
        errors.push({ applicationId: application._id, error: error.message });
      }
    }

    console.log("\n\n📊 Migration Summary:");
    console.log(`  Total applications processed: ${applications.length}`);
    console.log(`  ✅ Successfully migrated: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\n❌ Errors:");
      errors.forEach((err) => {
        console.log(`  - Application ${err.applicationId}: ${err.error}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

migrateAllApplications();
