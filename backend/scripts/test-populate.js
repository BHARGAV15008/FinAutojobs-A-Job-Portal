import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function testPopulate() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const applicationId = "695648752a8904854dbe150a";

    const Application = mongoose.model(
      "Application",
      new mongoose.Schema({}, { strict: false })
    );

    console.log("\n🔍 Testing populate...");

    // Test 1: Find without populate
    const appWithoutPopulate = await Application.findById(applicationId).lean();
    console.log("\n1️⃣ Without populate:");
    console.log(
      "  applicationInfo type:",
      typeof appWithoutPopulate.applicationInfo
    );
    console.log("  applicationInfo value:", appWithoutPopulate.applicationInfo);
    console.log(
      "  Is ObjectId?:",
      appWithoutPopulate.applicationInfo instanceof mongoose.Types.ObjectId
    );

    // Test 2: Find with populate
    const appWithPopulate = await Application.findById(applicationId)
      .populate("applicationInfo")
      .lean();
    console.log("\n2️⃣ With populate:");
    console.log(
      "  applicationInfo type:",
      typeof appWithPopulate.applicationInfo
    );
    console.log(
      "  applicationInfo value:",
      appWithPopulate.applicationInfo ? "POPULATED" : "NULL/UNDEFINED"
    );
    if (appWithPopulate.applicationInfo) {
      console.log(
        "  applicationInfo keys:",
        Object.keys(appWithPopulate.applicationInfo)
      );
    }

    // Test 3: Check if it's a string
    if (typeof appWithoutPopulate.applicationInfo === "string") {
      console.log(
        "\n⚠️  WARNING: applicationInfo is stored as string, not ObjectId!"
      );
      console.log("  Trying to convert...");
      const converted = new mongoose.Types.ObjectId(
        appWithoutPopulate.applicationInfo
      );
      console.log("  Converted:", converted);

      // Update to ObjectId
      await Application.findByIdAndUpdate(applicationId, {
        applicationInfo: converted,
      });
      console.log("  ✅ Converted and updated!");

      // Try populate again
      const appAfterFix = await Application.findById(applicationId)
        .populate("applicationInfo")
        .lean();
      console.log("\n3️⃣ After fix:");
      console.log(
        "  applicationInfo populated?:",
        !!appAfterFix.applicationInfo
      );
      if (appAfterFix.applicationInfo) {
        console.log("  ✅ Populate works now!");
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testPopulate();
