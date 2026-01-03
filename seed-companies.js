/**
 * Seed script to add sample companies to the database
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "backend", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

// Define Company schema (simplified version)
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  logo: { type: String },
  description: { type: String },
  industry: { type: String },
  size: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "500+"] },
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
  },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isVerified: { type: Boolean, default: false },
  socialLinks: {
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);

// Sample companies data
const sampleCompanies = [
  {
    name: "TechCorp Solutions",
    email: "hr@techcorp.com",
    website: "https://techcorp.com",
    logo: "https://via.placeholder.com/100?text=TC",
    description:
      "Leading technology solutions provider specializing in enterprise software and cloud services.",
    industry: "IT Services & Consulting",
    size: "500+",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
    },
  },
  {
    name: "InnovateLabs",
    email: "careers@innovatelabs.com",
    website: "https://innovatelabs.com",
    logo: "https://via.placeholder.com/100?text=IL",
    description:
      "Innovative startup building next-generation AI and ML solutions.",
    industry: "Software Product",
    size: "51-200",
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/innovatelabs",
    },
  },
  {
    name: "FinanceHub",
    email: "jobs@financehub.com",
    website: "https://financehub.com",
    logo: "https://via.placeholder.com/100?text=FH",
    description:
      "Digital banking and financial services platform serving millions of customers.",
    industry: "Banking & Financial Services",
    size: "201-500",
    location: {
      city: "Delhi NCR",
      state: "Delhi",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/financehub",
    },
  },
  {
    name: "EcomGiant",
    email: "hiring@ecomgiant.com",
    website: "https://ecomgiant.com",
    logo: "https://via.placeholder.com/100?text=EG",
    description: "Leading e-commerce platform with presence across Asia.",
    industry: "Internet & E-commerce",
    size: "500+",
    location: {
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/ecomgiant",
      twitter: "https://twitter.com/ecomgiant",
    },
  },
  {
    name: "HealthTech Plus",
    email: "careers@healthtechplus.com",
    website: "https://healthtechplus.com",
    logo: "https://via.placeholder.com/100?text=HT",
    description:
      "Healthcare technology company revolutionizing patient care with digital solutions.",
    industry: "Healthcare & Pharmaceuticals",
    size: "51-200",
    location: {
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
    },
    isVerified: false,
    socialLinks: {
      linkedin: "https://linkedin.com/company/healthtechplus",
    },
  },
  {
    name: "ManufacturePro",
    email: "hr@manufacturepro.com",
    website: "https://manufacturepro.com",
    logo: "https://via.placeholder.com/100?text=MP",
    description: "Industrial manufacturing and automation solutions provider.",
    industry: "Manufacturing",
    size: "500+",
    location: {
      city: "Pune",
      state: "Maharashtra",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/manufacturepro",
    },
  },
  {
    name: "RetailNext",
    email: "jobs@retailnext.com",
    website: "https://retailnext.com",
    logo: "https://via.placeholder.com/100?text=RN",
    description: "Modern retail chain with 200+ stores across the country.",
    industry: "Retail",
    size: "500+",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
    },
    isVerified: false,
    socialLinks: {
      linkedin: "https://linkedin.com/company/retailnext",
    },
  },
  {
    name: "EduLearn",
    email: "careers@edulearn.com",
    website: "https://edulearn.com",
    logo: "https://via.placeholder.com/100?text=EL",
    description:
      "Online education platform offering courses in technology and business.",
    industry: "Education & Training",
    size: "11-50",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/edulearn",
    },
  },
  {
    name: "CloudScale Systems",
    email: "hiring@cloudscale.com",
    website: "https://cloudscale.com",
    logo: "https://via.placeholder.com/100?text=CS",
    description: "Cloud infrastructure and DevOps solutions for enterprises.",
    industry: "IT Services & Consulting",
    size: "201-500",
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/cloudscale",
      twitter: "https://twitter.com/cloudscale",
    },
  },
  {
    name: "DataInsights AI",
    email: "jobs@datainsights.com",
    website: "https://datainsights.com",
    logo: "https://via.placeholder.com/100?text=DI",
    description:
      "AI-powered data analytics and business intelligence platform.",
    industry: "Software Product",
    size: "51-200",
    location: {
      city: "Delhi NCR",
      state: "Delhi",
      country: "India",
    },
    isVerified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/company/datainsights",
    },
  },
];

async function seedCompanies() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check existing companies
    const existingCount = await Company.countDocuments();
    console.log(`📊 Existing companies: ${existingCount}`);

    if (existingCount > 0) {
      const answer = await new Promise((resolve) => {
        const readline = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        readline.question(
          "Companies already exist. Clear all and reseed? (yes/no): ",
          (answer) => {
            readline.close();
            resolve(answer.toLowerCase());
          }
        );
      });

      if (answer === "yes" || answer === "y") {
        console.log("\n🗑️  Clearing existing companies...");
        await Company.deleteMany({});
        console.log("✅ Cleared");
      } else {
        console.log("\n⏭️  Skipping clear. Adding to existing companies...");
      }
    }

    // Insert sample companies
    console.log("\n📝 Inserting sample companies...");
    const result = await Company.insertMany(sampleCompanies);
    console.log(`✅ Successfully added ${result.length} companies\n`);

    // Display summary
    console.log("📋 Companies added:");
    result.forEach((company, index) => {
      console.log(
        `${index + 1}. ${company.name} - ${company.industry} (${
          company.size
        }) - ${company.location.city}`
      );
    });

    // Final count
    const totalCount = await Company.countDocuments();
    console.log(`\n📊 Total companies in database: ${totalCount}`);
  } catch (error) {
    console.error("❌ Error seeding companies:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

// Run the seed
seedCompanies();
