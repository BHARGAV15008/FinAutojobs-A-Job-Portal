import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function checkApplication() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const applicationId = "695648752a8904854dbe150a";

    const Application = mongoose.model(
      "Application",
      new mongoose.Schema({}, { strict: false })
    );
    const ApplicationInformation = mongoose.model(
      "ApplicationInformation",
      new mongoose.Schema({}, { strict: false })
    );

    console.log("\n🔍 Checking application:", applicationId);
    const app = await Application.findById(applicationId).lean();

    if (app) {
      console.log("\n✅ Application found:");
      console.log("  _id:", app._id);
      console.log("  applicantId:", app.applicantId);
      console.log("  jobId:", app.jobId);
      console.log("  applicationInfo:", app.applicationInfo);
      console.log("  applicationStatus:", app.applicationStatus);
      console.log("  createdAt:", app.createdAt);

      if (app.applicationInfo) {
        console.log("\n🔍 Checking ApplicationInformation...");
        const appInfo = await ApplicationInformation.findById(
          app.applicationInfo
        ).lean();
        if (appInfo) {
          console.log("✅ ApplicationInformation found:");
          console.log("  _id:", appInfo._id);
          console.log("  basicInfo:", appInfo.basicInfo);
          console.log("  experience:", appInfo.experience);
        } else {
          console.log(
            "❌ ApplicationInformation not found for ID:",
            app.applicationInfo
          );
        }
      } else {
        console.log("\n❌ Application has no applicationInfo reference");

        // Check if there's an ApplicationInformation for this application
        const orphanedAppInfo = await ApplicationInformation.findOne({
          applicationId: new mongoose.Types.ObjectId(applicationId),
        }).lean();
        if (orphanedAppInfo) {
          console.log("\n⚠️  Found orphaned ApplicationInformation:");
          console.log("  _id:", orphanedAppInfo._id);
          console.log("  Linking it to the application...");

          await Application.findByIdAndUpdate(applicationId, {
            applicationInfo: orphanedAppInfo._id,
          });

          console.log(
            "✅ Successfully linked ApplicationInformation to Application"
          );
        } else {
          console.log(
            "\n❌ No ApplicationInformation found for this application"
          );
        }
      }
    } else {
      console.log("❌ Application not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkApplication();
