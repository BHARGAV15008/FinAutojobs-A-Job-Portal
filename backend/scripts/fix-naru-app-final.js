import mongoose from "mongoose";
import dotenv from "dotenv";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";
import { BaseUser } from "../models/UserModels.js";

dotenv.config({ path: "./.env.development" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Find Naru's specific application
  const appId = "69560bc0a4670cff8a7c0e7b";
  const application = await Application.findById(appId);

  if (!application) {
    console.log("❌ Application not found");
    await mongoose.connection.close();
    return;
  }

  console.log("📋 Found application:", {
    id: application._id,
    applicantId: application.applicantId,
    jobId: application.jobId,
    hasApplicationInfo: !!application.applicationInfo,
  });

  // Get applicant details
  const applicant = await BaseUser.findById(application.applicantId);
  console.log("👤 Applicant:", applicant?.firstName, applicant?.lastName);

  if (!application.applicationInfo && applicant) {
    console.log("🔄 Creating ApplicationInformation...");

    const applicationInfo = new ApplicationInformation({
      applicationId: application._id,
      applicantId: applicant._id,
      jobId: application.jobId,

      basicInfo: {
        firstName: applicant.firstName || "",
        lastName: applicant.lastName || "",
        email: applicant.email || "",
        phone: applicant.phone || application.applicantSnapshot?.phone || "",
        bio: applicant.bio || "",
        profileImage: applicant.profileImage || "",
      },

      expectedSalary: {
        rawSalaryText: application.applicationData?.expectedSalary || "",
        displayText: application.applicationData?.expectedSalary || "",
      },

      experience: {
        totalYears: applicant.yearsOfExperience || 0,
        rawExperienceText:
          application.applicantSnapshot?.experience ||
          `${applicant.yearsOfExperience || 0} years`,
        currentJob: {
          jobTitle:
            application.applicantSnapshot?.currentJobTitle ||
            applicant.careerInfo?.currentJobTitle ||
            "",
          companyName:
            application.applicantSnapshot?.currentCompany ||
            applicant.careerInfo?.currentCompany ||
            "",
          isCurrentlyWorking: !!(
            application.applicantSnapshot?.currentCompany ||
            applicant.careerInfo?.currentCompany
          ),
        },
      },

      education:
        Array.isArray(applicant.education) && applicant.education.length > 0
          ? applicant.education
          : [],

      workExperience:
        Array.isArray(applicant.workExperience) &&
        applicant.workExperience.length > 0
          ? applicant.workExperience.filter(
              (exp) => exp.jobTitle && exp.companyName && exp.startDate
            )
          : [],

      skills: {
        technical:
          applicant.skills?.technical || applicant.skills?.primary || [],
        soft: applicant.skills?.soft || [],
        languages: applicant.skills?.languages || [],
      },

      location: {
        currentLocation: {
          country:
            applicant.currentLocation?.country ||
            applicant.address?.country ||
            application.applicantSnapshot?.location?.split(", ")[1] ||
            "",
          state:
            applicant.currentLocation?.state || applicant.address?.state || "",
          city:
            applicant.currentLocation?.city ||
            applicant.address?.city ||
            application.applicantSnapshot?.location?.split(", ")[0] ||
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
          applicant.socialLinks?.portfolioUrl ||
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

    // Display what was saved
    console.log("📊 Saved data:", {
      phone: savedAppInfo.basicInfo?.phone,
      experience: savedAppInfo.experience?.rawExperienceText,
      currentJob: savedAppInfo.experience?.currentJob?.jobTitle,
      skills: savedAppInfo.skills?.technical?.length || 0,
      education: savedAppInfo.education?.length || 0,
      location: savedAppInfo.location?.currentLocation?.city,
    });

    // Link to application
    application.applicationInfo = savedAppInfo._id;
    await application.save();
    console.log(`✅ Linked to Application: ${application._id}`);
  } else if (application.applicationInfo) {
    console.log(
      "✅ Application already has ApplicationInformation:",
      application.applicationInfo
    );
  } else {
    console.log("❌ Applicant not found");
  }

  await mongoose.connection.close();
  console.log("🎉 Done!");
})();
