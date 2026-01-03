import emailService from "./services/emailService.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.development" });

async function testCompanyEmails() {
  console.log("🧪 Testing Company Email Templates...\n");

  const testData = {
    recruiterEmail: "test@example.com",
    recruiterName: "John Doe",
    companyName: "TechCorp Solutions",
    industry: "Technology",
    location: "Bangalore, India",
    verificationDate: new Date(),
    adminNotes: "All documents verified successfully",
    submissionDate: new Date(),
    referenceId: "123456789",
    rejectionReason: "Missing company registration documents",
    suspensionDate: new Date(),
    suspensionReason: "Violation of terms of service",
    reviewDate: new Date(),
  };

  try {
    // Test 1: Company Submission Email
    console.log("1️⃣ Testing Company Submission Email...");
    const submissionTemplate = emailService.renderTemplate(
      "companySubmittedForReview",
      {
        ...testData,
        submissionDate: new Date().toLocaleDateString(),
        companyProfileUrl: "http://localhost:3000/recruiter-dashboard/company",
        supportEmail: "support@finautojobs.com",
        supportUrl: "http://localhost:3000/support",
        baseUrl: "http://localhost:3000",
      }
    );
    console.log("✅ Company Submission template rendered successfully");
    console.log("Preview length:", submissionTemplate.length, "characters\n");

    // Test 2: Company Verification Email
    console.log("2️⃣ Testing Company Verification Email...");
    const verificationTemplate = emailService.renderTemplate(
      "companyVerified",
      {
        ...testData,
        verificationDate: new Date().toLocaleDateString(),
        companyDashboardUrl: "http://localhost:3000/recruiter-dashboard",
        supportEmail: "support@finautojobs.com",
        supportUrl: "http://localhost:3000/support",
        baseUrl: "http://localhost:3000",
      }
    );
    console.log("✅ Company Verification template rendered successfully");
    console.log("Preview length:", verificationTemplate.length, "characters\n");

    // Test 3: Company Rejection Email
    console.log("3️⃣ Testing Company Rejection Email...");
    const rejectionTemplate = emailService.renderTemplate("companyRejected", {
      ...testData,
      submissionDate: new Date().toLocaleDateString(),
      reviewDate: new Date().toLocaleDateString(),
      companyProfileUrl: "http://localhost:3000/recruiter-dashboard/company",
      supportEmail: "support@finautojobs.com",
      supportUrl: "http://localhost:3000/support",
      baseUrl: "http://localhost:3000",
    });
    console.log("✅ Company Rejection template rendered successfully");
    console.log("Preview length:", rejectionTemplate.length, "characters\n");

    // Test 4: Company Suspension Email
    console.log("4️⃣ Testing Company Suspension Email...");
    const suspensionTemplate = emailService.renderTemplate("companySuspended", {
      ...testData,
      suspensionDate: new Date().toLocaleDateString(),
      appealUrl: "http://localhost:3000/support/appeal",
      supportEmail: "support@finautojobs.com",
      supportPhone: "+1-800-123-4567",
      supportUrl: "http://localhost:3000/support",
      baseUrl: "http://localhost:3000",
    });
    console.log("✅ Company Suspension template rendered successfully");
    console.log("Preview length:", suspensionTemplate.length, "characters\n");

    console.log("🎉 All email templates are working correctly!\n");
    console.log("📧 Email Service Configuration:");
    console.log("  - Email Service:", process.env.EMAIL_SERVICE || "smtp");
    console.log("  - Email User:", process.env.EMAIL_USER || "Not configured");
    console.log("  - Email From:", emailService.fromEmail);
    console.log("  - Base URL:", emailService.baseUrl);

    console.log("\n💡 To test actual email sending:");
    console.log("  1. Configure EMAIL_USER and EMAIL_PASS in .env.development");
    console.log("  2. Run: node test-company-email-send.js");
  } catch (error) {
    console.error("❌ Error testing email templates:", error);
    console.error("Stack:", error.stack);
  }

  process.exit(0);
}

testCompanyEmails();
