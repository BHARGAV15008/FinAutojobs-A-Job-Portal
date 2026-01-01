// Quick script to fix the Application document to point to correct ApplicationInformation
import("dotenv").then((d) => d.default.config());
import("mongoose").then(async (mongoose) => {
  try {
    await mongoose.default.connect(process.env.MONGODB_URI);
    console.log("✅ Connected\n");

    const db = mongoose.default.connection.db;

    // Get Application document
    const application = await db.collection("applications").findOne({
      _id: new mongoose.ObjectId("695648752a8904854dbe150a"),
    });
    console.log("Application.applicationInfo:", application?.applicationInfo);

    // Find the correct ApplicationInformation
    const appInfos = await db
      .collection("applicationinformations")
      .find({
        applicationId: new mongoose.ObjectId("695648752a8904854dbe150a"),
      })
      .toArray();

    console.log("\nApplicationInformation documents found:", appInfos.length);
    appInfos.forEach((doc) => {
      console.log("  - ID:", doc._id);
      console.log("    Name:", doc.basicInfo?.firstName);
    });

    // Update Application to point to the latest one
    if (appInfos.length > 0) {
      const latestAppInfo = appInfos[appInfos.length - 1];
      console.log("\n🔄 Updating Application to point to:", latestAppInfo._id);

      await db
        .collection("applications")
        .updateOne(
          { _id: new mongoose.ObjectId("695648752a8904854dbe150a") },
          { $set: { applicationInfo: latestAppInfo._id } }
        );

      console.log("✅ Updated!");
    }

    await mongoose.default.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
});
