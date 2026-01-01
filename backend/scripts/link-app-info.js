import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.development" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const Application = mongoose.model(
    "Application",
    new mongoose.Schema({}, { strict: false }),
    "applications"
  );
  const ApplicationInfo = mongoose.model(
    "ApplicationInformation",
    new mongoose.Schema({}, { strict: false }),
    "applicationinformation"
  );

  const appInfos = await ApplicationInfo.find({}).select("_id applicationId");
  console.log(`📊 Found ${appInfos.length} ApplicationInformation documents`);

  for (const appInfo of appInfos) {
    const result = await Application.updateOne(
      { _id: appInfo.applicationId },
      { $set: { applicationInfo: appInfo._id } }
    );
    if (result.modifiedCount > 0) {
      console.log(
        `✅ Linked ApplicationInfo ${appInfo._id} to Application ${appInfo.applicationId}`
      );
    }
  }

  await mongoose.connection.close();
  console.log("🎉 Done!");
})();
