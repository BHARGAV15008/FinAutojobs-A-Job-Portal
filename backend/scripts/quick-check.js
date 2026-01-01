import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function quickCheck() {
  try {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("Connected!\n");

    const Application = mongoose.model("Application");
    const ApplicationInformation = mongoose.model("ApplicationInformation");

    const app = await Application.findById("695648752a8904854dbe150a")
      .select("applicationInfo")
      .lean();
    console.log(
      "Application.applicationInfo:",
      app?.applicationInfo?.toString()
    );

    const appInfo = await ApplicationInformation.findById(
      app.applicationInfo
    ).lean();
    console.log("ApplicationInformation exists:", !!appInfo);
    if (appInfo) {
      console.log("  Name:", appInfo.basicInfo?.firstName);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

quickCheck();
