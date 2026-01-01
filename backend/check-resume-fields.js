import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, ".env") });

// Import models
import Application from "./models/Application.js";
import ApplicationInformation from "./models/ApplicationInformation.js";
import User from "./models/User.js";

const checkResumeFields = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully\n");

    // Search for applications by specific applicants
    const searchNames = ["Naru Modu", "vijay maliya", "naru", "vijay"];

    console.log(
      'Searching for applications by "Naru Modu" or "vijay maliya"...\n'
    );

    // First, find users with matching names
    const users = await User.find({
      $or: [
        { firstName: { $regex: /naru/i } },
        { lastName: { $regex: /modu/i } },
        { firstName: { $regex: /vijay/i } },
        { lastName: { $regex: /maliya/i } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: /naru modu|vijay maliya/i,
            },
          },
        },
      ],
    }).select("_id firstName lastName email");

    console.log(`Found ${users.length} matching users:`);
    users.forEach((user) => {
      console.log(
        `  - ${user.firstName} ${user.lastName} (${user.email}) [ID: ${user._id}]`
      );
    });

    if (users.length === 0) {
      console.log("\nNo matching users found. Fetching any application...");
      // Get any application if specific users not found
      const anyApplication = await Application.findOne()
        .populate("applicant", "firstName lastName email")
        .populate("applicationInfo")
        .lean();

      if (anyApplication) {
        console.log("\n=== SAMPLE APPLICATION FOUND ===");
        printApplicationDetails(anyApplication);
      } else {
        console.log("No applications found in database.");
      }
    } else {
      // Find applications for these users
      const userIds = users.map((u) => u._id);
      const applications = await Application.find({
        applicant: { $in: userIds },
      })
        .populate("applicant", "firstName lastName email")
        .populate("applicationInfo")
        .lean();

      console.log(
        `\nFound ${applications.length} applications for these users\n`
      );

      if (applications.length > 0) {
        applications.forEach((app, index) => {
          console.log(`\n${"=".repeat(80)}`);
          console.log(`APPLICATION #${index + 1}`);
          console.log("=".repeat(80));
          printApplicationDetails(app);
        });
      }
    }

    // Also check for applicantSnapshot in any applications
    console.log("\n\n" + "=".repeat(80));
    console.log("CHECKING FOR APPLICANT SNAPSHOTS IN DATABASE");
    console.log("=".repeat(80));

    const appsWithSnapshot = await mongoose.connection.db
      .collection("applications")
      .find({ applicantSnapshot: { $exists: true } })
      .limit(3)
      .toArray();

    console.log(
      `\nFound ${appsWithSnapshot.length} applications with applicantSnapshot field`
    );

    if (appsWithSnapshot.length > 0) {
      appsWithSnapshot.forEach((app, index) => {
        console.log(`\n--- Application with Snapshot #${index + 1} ---`);
        console.log("Application ID:", app._id);
        console.log("\napplicantSnapshot structure:");
        console.log(JSON.stringify(app.applicantSnapshot, null, 2));

        if (app.documents) {
          console.log("\ndocuments field:");
          console.log(JSON.stringify(app.documents, null, 2));
        }

        if (app.resumeUrl) {
          console.log("\nresumeUrl field:", app.resumeUrl);
        }

        if (app.resume) {
          console.log("resume field:", app.resume);
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n\nDisconnected from MongoDB");
  }
};

function printApplicationDetails(app) {
  console.log("\n--- BASIC APPLICATION INFO ---");
  console.log("Application ID:", app._id);
  console.log(
    "Applicant:",
    app.applicant
      ? `${app.applicant.firstName} ${app.applicant.lastName}`
      : "N/A"
  );
  console.log("Email:", app.applicant?.email || "N/A");
  console.log("Status:", app.status);
  console.log("Applied At:", app.appliedAt);

  console.log("\n--- RESUME RELATED FIELDS ---");
  console.log("resume field:", app.resume || "NOT SET");
  console.log("resumeUrl field:", app.resumeUrl || "NOT SET");

  if (app.documents) {
    console.log("\ndocuments field:");
    console.log(JSON.stringify(app.documents, null, 2));
  } else {
    console.log("\ndocuments field: NOT SET");
  }

  if (app.applicantSnapshot) {
    console.log("\n--- APPLICANT SNAPSHOT STRUCTURE ---");
    console.log("Has applicantSnapshot: YES");
    console.log(
      "\nSnapshot Keys:",
      Object.keys(app.applicantSnapshot).join(", ")
    );

    // Show resume-related fields in snapshot
    console.log("\nResume fields in snapshot:");
    if (app.applicantSnapshot.resume) {
      console.log("  - snapshot.resume:", app.applicantSnapshot.resume);
    }
    if (app.applicantSnapshot.resumeUrl) {
      console.log("  - snapshot.resumeUrl:", app.applicantSnapshot.resumeUrl);
    }
    if (app.applicantSnapshot.documents) {
      console.log(
        "  - snapshot.documents:",
        JSON.stringify(app.applicantSnapshot.documents, null, 2)
      );
    }

    console.log("\nFull applicantSnapshot:");
    console.log(JSON.stringify(app.applicantSnapshot, null, 2));
  } else {
    console.log("\napplicantSnapshot field: NOT SET");
  }

  if (app.applicationInfo) {
    console.log("\n--- APPLICATION INFORMATION (REFERENCE) ---");
    console.log("Has applicationInfo reference: YES");
    console.log(
      "ApplicationInfo ID:",
      app.applicationInfo._id || app.applicationInfo
    );

    if (app.applicationInfo.basicInfo) {
      console.log("\nBasic Info:");
      console.log(JSON.stringify(app.applicationInfo.basicInfo, null, 2));
    }

    // Check for documents in applicationInfo
    if (app.applicationInfo.documents) {
      console.log("\nDocuments in applicationInfo:");
      console.log(JSON.stringify(app.applicationInfo.documents, null, 2));
    }
  } else {
    console.log("\n--- APPLICATION INFORMATION (REFERENCE) ---");
    console.log("Has applicationInfo reference: NO");
  }
}

checkResumeFields();
