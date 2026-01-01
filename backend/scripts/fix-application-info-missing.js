import dotenv from "dotenv";
import mongoose from "mongoose";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";
import BaseUser from "../models/unified/BaseUser.js";

dotenv.config();

async function fixMissingApplicationInfo() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas\n");

    const applicationId = "695648752a8904854dbe150a";
    const appInfoId = "695649ce18bb36f76851e1ae";

    // Check if application exists
    console.log("1️⃣ Checking Application...");
    const application = await Application.findById(applicationId);
    if (!application) {
      console.log("❌ Application not found");
      process.exit(1);
    }
    console.log("✅ Application found");
    console.log("   applicationInfo:", application.applicationInfo);
    console.log("   applicantId:", application.applicantId);

    // Check if ApplicationInformation exists
    console.log("\n2️⃣ Checking ApplicationInformation...");
    const existingAppInfo = await ApplicationInformation.findById(appInfoId);
    if (existingAppInfo) {
      console.log("✅ ApplicationInformation exists:", appInfoId);
      console.log("   basicInfo:", existingAppInfo.basicInfo);
      console.log("   experience:", existingAppInfo.experience);
      return;
    }
    console.log("❌ ApplicationInformation NOT found - will create");

    // Get applicant data
    console.log("\n3️⃣ Fetching applicant data...");
    const applicant = await BaseUser.findById(application.applicantId);
    if (!applicant) {
      console.log("❌ Applicant not found");
      process.exit(1);
    }
    console.log("✅ Applicant found:", applicant.email);

    // Create ApplicationInformation
    console.log("\n4️⃣ Creating ApplicationInformation...");

    // Parse skills if needed
    let technicalSkills = [];
    if (Array.isArray(applicant.skills)) {
      technicalSkills = applicant.skills
        .map((skill) => {
          if (typeof skill === "string") {
            try {
              const parsed = JSON.parse(skill);
              return Array.isArray(parsed) ? parsed : [skill];
            } catch {
              return [skill];
            }
          }
          return skill;
        })
        .flat();
    }
    console.log("   Parsed skills:", technicalSkills);

    const applicationInfo = new ApplicationInformation({
      applicationId: application._id,
      applicantId: application.applicantId,
      jobId: application.jobId, // Required field

      basicInfo: {
        firstName: applicant.firstName || "",
        lastName: applicant.lastName || "",
        email: applicant.email || "",
        phone: applicant.phone || "",
      },

      experience: {
        totalYears: applicant.experience || 0,
        rawExperienceText: applicant.experience
          ? `${applicant.experience} years`
          : "0-1",
        currentJob:
          applicant.workExperience?.length > 0
            ? {
                jobTitle: applicant.workExperience[0].jobTitle || "",
                companyName: applicant.workExperience[0].companyName || "",
                startDate: applicant.workExperience[0].startDate,
                isCurrent: applicant.workExperience[0].isCurrent || false,
              }
            : undefined,
      },

      location: {
        current: {
          city:
            applicant.location?.city ||
            applicant.location?.currentLocation ||
            "",
          state: applicant.location?.state || "",
          country: applicant.location?.country || "India",
        },
        willingToRelocate: applicant.willingToRelocate || false,
      },

      skills: {
        technical: technicalSkills.map((skill) => ({
          skill,
          proficiency: "intermediate",
        })),
      },

      education: applicant.education || [],
      workExperience: applicant.workExperience || [],

      socialLinks: {
        linkedin: applicant.socialLinks?.linkedin
          ? {
              url: applicant.socialLinks.linkedin,
              visibility: "public",
            }
          : undefined,
        portfolio: applicant.socialLinks?.portfolio
          ? {
              url: applicant.socialLinks.portfolio,
              visibility: "public",
            }
          : undefined,
      },

      applicationSpecific: {
        noticePeriod: application.noticePeriod || "30 days",
        expectedSalary: application.expectedSalary || null,
        coverLetter: application.coverLetter || "",
      },
    });

    await applicationInfo.save();
    console.log("✅ ApplicationInformation created:", applicationInfo._id);

    // Update Application to link to ApplicationInformation
    console.log("\n5️⃣ Linking ApplicationInformation to Application...");
    application.applicationInfo = applicationInfo._id;
    await application.save();
    console.log("✅ Application updated with applicationInfo reference");

    // Verify
    console.log("\n6️⃣ Verifying...");
    const verifyApp = await Application.findById(applicationId).populate(
      "applicationInfo"
    );
    console.log(
      "   Application.applicationInfo:",
      verifyApp.applicationInfo ? "POPULATED" : "NULL"
    );
    if (verifyApp.applicationInfo) {
      console.log(
        "   ✅ firstName:",
        verifyApp.applicationInfo.basicInfo?.firstName
      );
      console.log(
        "   ✅ experience:",
        verifyApp.applicationInfo.experience?.totalYears
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

fixMissingApplicationInfo();
