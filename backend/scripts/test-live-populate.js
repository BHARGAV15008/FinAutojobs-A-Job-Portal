import dotenv from "dotenv";
import mongoose from "mongoose";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";

dotenv.config();

async function testPopulate() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas\n");

    const applicationId = "695648752a8904854dbe150a";

    console.log("🔍 Testing different populate approaches...\n");

    // Test 1: Basic find without populate
    console.log("1️⃣ Without populate:");
    const app1 = await Application.findById(applicationId);
    console.log("   applicationInfo type:", typeof app1.applicationInfo);
    console.log("   applicationInfo value:", app1.applicationInfo);
    console.log("   hasApplicationInfo:", app1.hasApplicationInfo);

    // Test 2: With populate (query-level strictPopulate)
    console.log("\n2️⃣ With populate (query-level strictPopulate: false):");
    try {
      const app2 = await Application.findById(applicationId).populate({
        path: "applicationInfo",
        strictPopulate: false,
      });
      console.log("   ✅ Populate succeeded!");
      console.log(
        "   applicationInfo:",
        app2.applicationInfo ? "POPULATED" : "NULL"
      );
      if (app2.applicationInfo) {
        console.log(
          "   - firstName:",
          app2.applicationInfo.basicInfo?.firstName
        );
        console.log(
          "   - totalYears:",
          app2.applicationInfo.experience?.totalYears
        );
        console.log(
          "   - rawExperienceText:",
          app2.applicationInfo.experience?.rawExperienceText
        );
      }
    } catch (error) {
      console.log("   ❌ Populate failed:", error.message);
    }

    // Test 3: Manual lookup
    console.log("\n3️⃣ Manual ApplicationInformation lookup:");
    const appInfo = await ApplicationInformation.findById(app1.applicationInfo);
    console.log("   Found:", appInfo ? "YES" : "NO");
    if (appInfo) {
      console.log("   - firstName:", appInfo.basicInfo?.firstName);
      console.log("   - totalYears:", appInfo.experience?.totalYears);
      console.log(
        "   - rawExperienceText:",
        appInfo.experience?.rawExperienceText
      );
    }

    // Test 4: Check schema options
    console.log("\n4️⃣ Schema configuration:");
    console.log(
      "   strictPopulate:",
      Application.schema.options.strictPopulate
    );
    console.log("   strict:", Application.schema.options.strict);
    console.log("   timestamps:", Application.schema.options.timestamps);

    // Test 5: Check if field exists in schema
    console.log("\n5️⃣ Schema paths check:");
    console.log(
      "   applicationInfo in schema:",
      Application.schema.paths.applicationInfo ? "YES" : "NO"
    );
    if (Application.schema.paths.applicationInfo) {
      console.log(
        "   applicationInfo type:",
        Application.schema.paths.applicationInfo.instance
      );
      console.log(
        "   applicationInfo ref:",
        Application.schema.paths.applicationInfo.options.ref
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

testPopulate();
