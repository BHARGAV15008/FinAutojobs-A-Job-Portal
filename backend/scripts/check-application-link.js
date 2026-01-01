import dotenv from "dotenv";
import mongoose from "mongoose";
import Application from "../models/unified/Application.js";
import ApplicationInformation from "../models/ApplicationInformation.js";

dotenv.config();

async function checkLink() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected\n");

    const appId = "695648752a8904854dbe150a";

    // Check Application
    console.log("1️⃣ Application document:");
    const app = await Application.findById(appId).lean();
    console.log("   applicationInfo field:", app.applicationInfo);
    console.log("   Type:", typeof app.applicationInfo);
    console.log(
      "   Is ObjectId:",
      app.applicationInfo instanceof mongoose.Types.ObjectId
    );

    // Check if that ApplicationInformation exists
    console.log("\n2️⃣ Looking for ApplicationInformation:");
    const appInfoById = await ApplicationInformation.findById(
      app.applicationInfo
    );
    console.log("   Found by ID:", appInfoById ? "YES ✅" : "NO ❌");
    if (appInfoById) {
      console.log("   Document ID:", appInfoById._id);
      console.log("   First Name:", appInfoById.basicInfo?.firstName);
    }

    // Check all ApplicationInformation docs for this application
    console.log("\n3️⃣ All ApplicationInformation for this applicationId:");
    const allAppInfos = await ApplicationInformation.find({
      applicationId: appId,
    });
    console.log("   Found:", allAppInfos.length, "documents");
    allAppInfos.forEach((doc) => {
      console.log("   - ID:", doc._id);
      console.log("     Name:", doc.basicInfo?.firstName);
      console.log(
        "     Match:",
        doc._id.toString() === app.applicationInfo?.toString()
          ? "✅ MATCHES"
          : "❌ NO MATCH"
      );
    });

    // Try populate
    console.log("\n4️⃣ Testing populate:");
    const appWithPopulate = await Application.findById(appId).populate(
      "applicationInfo"
    );
    console.log(
      "   Populated:",
      appWithPopulate.applicationInfo ? "YES ✅" : "NO ❌"
    );
    if (appWithPopulate.applicationInfo) {
      console.log(
        "   First Name:",
        appWithPopulate.applicationInfo.basicInfo?.firstName
      );
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkLink();
