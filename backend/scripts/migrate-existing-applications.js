import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";
import { BaseUser } from "../models/UserModels.js";
import Job from "../models/Job.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.development") });

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateExistingApplications() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all applications that don't have applicationInfo linked
    const applicationsWithoutInfo = await Application.find({
      $or: [{ applicationInfo: { $exists: false } }, { applicationInfo: null }],
    })
      .populate("applicantId")
      .lean();

    console.log(
      `📊 Found ${applicationsWithoutInfo.length} applications without ApplicationInformation`
    );

    for (const application of applicationsWithoutInfo) {
      try {
        console.log(`\n🔍 Processing application: ${application._id}`);
        console.log(`📋 Application data:`, {
          jobId: application.jobId,
          applicantId: application.applicantId?._id,
          hasJobSnapshot: !!application.jobSnapshot,
        });

        if (!application.applicantId) {
          console.log(`⚠️ Skipping - no applicant data`);
          continue;
        }

        const applicant = application.applicantId;
        console.log(
          `👤 Applicant: ${applicant?.firstName} ${applicant?.lastName}`
        );

        // Skip if no jobId - use jobId from application directly or from jobSnapshot
        const jobId =
          application.jobId ||
          (application.jobSnapshot ? application.jobId : null);
        if (!jobId) {
          console.log(`⚠️ Skipping - no job reference found`);
          continue;
        }

        console.log(`✅ Using jobId: ${jobId}`);

        // Create ApplicationInformation
        const applicationInfo = new ApplicationInformation({
          applicationId: application._id,
          applicantId: applicant._id,
          jobId: jobId,

          basicInfo: {
            firstName:
              applicant.firstName ||
              application.applicantSnapshot?.fullName?.split(" ")[0] ||
              "",
            lastName:
              applicant.lastName ||
              application.applicantSnapshot?.fullName?.split(" ")[1] ||
              "",
            email:
              applicant.email || application.applicantSnapshot?.email || "",
            phone:
              applicant.phone ||
              application.applicantSnapshot?.phone ||
              application.applicationData?.phone ||
              "",
            bio: applicant.bio || "",
            profileImage: applicant.profileImage || "",
          },

          expectedSalary: {
            rawSalaryText: application.applicationData?.expectedSalary || "",
            displayText: application.applicationData?.expectedSalary || "",
          },

          experience: {
            totalYears: applicant.yearsOfExperience || 0,
            rawExperienceText: `${applicant.yearsOfExperience || 0} years`,
            currentJob: {
              jobTitle:
                applicant.careerInfo?.currentJobTitle ||
                application.applicantSnapshot?.currentJobTitle ||
                "",
              companyName:
                applicant.careerInfo?.currentCompany ||
                application.applicantSnapshot?.currentCompany ||
                "",
              isCurrentlyWorking: !!applicant.careerInfo?.currentCompany,
            },
          },

          education: Array.isArray(applicant.education)
            ? applicant.education
            : [],

          workExperience: Array.isArray(applicant.workExperience)
            ? applicant.workExperience.filter(
                (exp) => exp.jobTitle && exp.companyName && exp.startDate
              )
            : [],

          skills: {
            technical: applicant.skills?.technical || [],
            soft: applicant.skills?.soft || [],
            languages: applicant.skills?.languages || [],
          },

          location: {
            currentLocation: {
              country:
                applicant.currentLocation?.country ||
                applicant.address?.country ||
                "",
              state:
                applicant.currentLocation?.state ||
                applicant.address?.state ||
                "",
              city:
                applicant.currentLocation?.city ||
                applicant.address?.city ||
                applicant.location ||
                "",
            },
          },

          jobPreferences: {
            willingToRelocate:
              application.applicationData?.willingToRelocate || false,
            remoteWorkPreference:
              application.applicationData?.remoteWorkPreference || false,
          },

          documents: {
            resumeUrl:
              application.applicationData?.resumeUrl ||
              applicant.documents?.resumeUrl ||
              "",
            coverLetterUrl: application.applicationData?.coverLetterUrl || "",
            portfolioUrl:
              application.applicationData?.portfolioUrl ||
              applicant.portfolio_url ||
              "",
          },

          socialLinks: {
            linkedinUrl:
              application.applicationData?.linkedinUrl ||
              applicant.socialLinks?.linkedinUrl ||
              applicant.linkedin_url ||
              "",
            githubUrl:
              applicant.socialLinks?.githubUrl || applicant.github_url || "",
            portfolioUrl:
              application.applicationData?.portfolioUrl ||
              applicant.socialLinks?.portfolioUrl ||
              applicant.portfolio_url ||
              "",
          },

          applicationSpecific: {
            coverLetter: application.applicationData?.coverLetter || "",
            additionalInfo: application.applicationData?.additionalInfo || "",
            referralSource: application.applicationData?.referralSource || "",
            noticePeriod: application.applicationData?.noticePeriod || "",
          },
        });

        const savedAppInfo = await applicationInfo.save();
        console.log(`✅ ApplicationInformation created: ${savedAppInfo._id}`);

        // Link ApplicationInformation to Application - use findByIdAndUpdate instead of save
        await Application.findByIdAndUpdate(application._id, {
          applicationInfo: savedAppInfo._id,
        });
        console.log(`✅ Linked to Application: ${application._id}`);
      } catch (error) {
        console.error(
          `❌ Error processing application ${application._id}:`,
          error.message
        );
        console.error("Error stack:", error.stack);
      }
    }

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📴 Database connection closed");
  }
}

// Run migration
migrateExistingApplications();
