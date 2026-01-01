import mongoose from "mongoose";
import dotenv from "dotenv";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";
import { BaseUser } from "../models/UserModels.js";
import Job from "../models/Job.js";

dotenv.config({ path: "./.env.development" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Find Naru Modu's application
  const naruApplication = await Application.findOne({
    applicantId: new mongoose.Types.ObjectId("694d5cb4a65e240dad9d8b43"),
  }).populate("applicantId");

  if (naruApplication) {
    console.log("📋 Found application for Naru:", {
      id: naruApplication._id,
      hasApplicationInfo: !!naruApplication.applicationInfo,
      jobId: naruApplication.jobId,
      applicantId: naruApplication.applicantId._id,
    });

    if (!naruApplication.applicationInfo) {
      console.log("🔄 Creating ApplicationInformation for Naru...");

      const applicant = naruApplication.applicantId;

      const applicationInfo = new ApplicationInformation({
        applicationId: naruApplication._id,
        applicantId: applicant._id,
        jobId: naruApplication.jobId,

        basicInfo: {
          firstName: applicant.firstName || "",
          lastName: applicant.lastName || "",
          email: applicant.email || "",
          phone:
            applicant.phone || naruApplication.applicationData?.phone || "",
          bio: applicant.bio || "",
          profileImage: applicant.profileImage || "",
        },

        expectedSalary: {
          rawSalaryText: naruApplication.applicationData?.expectedSalary || "",
          displayText: naruApplication.applicationData?.expectedSalary || "",
        },

        experience: {
          totalYears: applicant.yearsOfExperience || 0,
          rawExperienceText: `${applicant.yearsOfExperience || 0} years`,
          currentJob: {
            jobTitle: applicant.careerInfo?.currentJobTitle || "",
            companyName: applicant.careerInfo?.currentCompany || "",
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
            naruApplication.applicationData?.willingToRelocate || false,
          remoteWorkPreference:
            naruApplication.applicationData?.remoteWorkPreference || false,
        },

        documents: {
          resumeUrl: naruApplication.applicationData?.resumeUrl || "",
          coverLetterUrl: naruApplication.applicationData?.coverLetterUrl || "",
          portfolioUrl:
            naruApplication.applicationData?.portfolioUrl ||
            applicant.portfolio_url ||
            "",
        },

        socialLinks: {
          linkedinUrl:
            naruApplication.applicationData?.linkedinUrl ||
            applicant.socialLinks?.linkedinUrl ||
            applicant.linkedin_url ||
            "",
          githubUrl:
            applicant.socialLinks?.githubUrl || applicant.github_url || "",
          portfolioUrl:
            naruApplication.applicationData?.portfolioUrl ||
            applicant.socialLinks?.portfolioUrl ||
            applicant.portfolio_url ||
            "",
        },

        applicationSpecific: {
          coverLetter: naruApplication.applicationData?.coverLetter || "",
          additionalInfo: naruApplication.applicationData?.additionalInfo || "",
          referralSource: naruApplication.applicationData?.referralSource || "",
          noticePeriod: naruApplication.applicationData?.noticePeriod || "",
        },
      });

      const savedAppInfo = await applicationInfo.save();
      console.log(`✅ ApplicationInformation created: ${savedAppInfo._id}`);

      // Link to application
      naruApplication.applicationInfo = savedAppInfo._id;
      await naruApplication.save();
      console.log(`✅ Linked to Application: ${naruApplication._id}`);
    } else {
      console.log("✅ Application already has ApplicationInformation");
    }
  } else {
    console.log("❌ No application found for Naru Modu");
  }

  await mongoose.connection.close();
  console.log("🎉 Done!");
})();
