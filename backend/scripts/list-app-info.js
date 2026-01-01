import dotenv from "dotenv";
import mongoose from "mongoose";
import ApplicationInformation from "../models/ApplicationInformation.js";

dotenv.config();

async function checkAppInfo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected");

    // Find all ApplicationInformation docs
    const docs = await ApplicationInformation.find().select(
      "_id applicationId basicInfo.firstName basicInfo.email experience.totalYears"
    );
    console.log(`\n📊 Found ${docs.length} ApplicationInformation documents:`);
    docs.forEach((doc) => {
      console.log(`   ID: ${doc._id}`);
      console.log(`   App ID: ${doc.applicationId}`);
      console.log(`   Name: ${doc.basicInfo?.firstName}`);
      console.log(`   Email: ${doc.basicInfo?.email}`);
      console.log(`   Experience: ${doc.experience?.totalYears} years`);
      console.log("   ---");
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAppInfo();
