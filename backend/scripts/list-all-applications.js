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

  // Find all applications
  const allApps = await Application.find({}).select(
    "_id applicantId jobId applicationStatus applicationInfo"
  );
  console.log(`📊 Total applications: ${allApps.length}\n`);

  for (const app of allApps) {
    console.log(`Application: ${app._id}`);
    console.log(`  Applicant ID: ${app.applicantId}`);
    console.log(`  Job ID: ${app.jobId}`);
    console.log(`  Status: ${app.applicationStatus}`);
    console.log(`  Has ApplicationInfo: ${!!app.applicationInfo}`);
    console.log("");
  }

  await mongoose.connection.close();
})();
