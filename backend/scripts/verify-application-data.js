import dotenv from "dotenv";
import mongoose from "mongoose";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";

dotenv.config();

async function verifyData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected\n");

    const applicationId = "695648752a8904854dbe150a";

    console.log("📊 Fetching application with populate (as API does)...");
    const app = await Application.findById(applicationId)
      .populate("applicationInfo")
      .populate("applicantId", "firstName lastName email phone");

    console.log("\n✅ Application Data:");
    console.log("   Application ID:", app._id);
    console.log("   Status:", app.status);
    console.log(
      "   ApplicationInfo populated:",
      app.applicationInfo ? "YES ✅" : "NO ❌"
    );

    if (app.applicationInfo) {
      console.log("\n📋 ApplicationInfo Details:");
      console.log("   ID:", app.applicationInfo._id);
      console.log("   First Name:", app.applicationInfo.basicInfo?.firstName);
      console.log("   Last Name:", app.applicationInfo.basicInfo?.lastName);
      console.log("   Email:", app.applicationInfo.basicInfo?.email);
      console.log("   Phone:", app.applicationInfo.basicInfo?.phone);
      console.log(
        "   Total Years:",
        app.applicationInfo.experience?.totalYears
      );
      console.log(
        "   Raw Experience:",
        app.applicationInfo.experience?.rawExperienceText
      );
      console.log(
        "   Current Job:",
        app.applicationInfo.experience?.currentJob?.jobTitle
      );
      console.log("   Location:", app.applicationInfo.location?.current?.city);
    } else {
      console.log("\n❌ ApplicationInfo is NULL - checking reference...");
      console.log("   Reference ID:", app.applicationInfo);

      // Try manual lookup
      const manualLookup = await ApplicationInformation.findOne({
        applicationId: app._id,
      });
      console.log("   Manual lookup:", manualLookup ? "FOUND" : "NOT FOUND");
      if (manualLookup) {
        console.log("   Manual ID:", manualLookup._id);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verifyData();
