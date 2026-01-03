import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Company from "./models/Company.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, ".env.development");
dotenv.config({ path: envPath });

// Sample companies data
const sampleCompanies = [
  {
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    website: "https://techcorp.com",
    tagline: "Building the future of technology",
    logo: "https://via.placeholder.com/150/0000FF/FFFFFF?text=TechCorp",
    coverImage:
      "https://via.placeholder.com/1200x400/0000FF/FFFFFF?text=TechCorp+Cover",
    description:
      "TechCorp Solutions is a leading technology company specializing in innovative software solutions. We help businesses transform digitally with cutting-edge products and services.",
    foundedYear: 2015,
    industry: "Technology",
    subIndustry: ["Software Development"],
    companyType: "Private",
    size: "201-500",
    headquarters: {
      address: "123 Tech Street",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      zipCode: "560001",
    },
    contactInfo: {
      phone: "+91-80-12345678",
      hrEmail: "hr@techcorp.com",
      email: "contact@techcorp.com",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
    },
    culture: {
      workEnvironment: "Hybrid - 3 days office, 2 days remote",
      values: ["Innovation", "Collaboration", "Excellence", "Integrity"],
      mission: "To empower businesses through innovative technology solutions",
      vision: "To be the most trusted technology partner globally",
    },
    benefits: [
      {
        type: "Health Insurance",
        description: "Comprehensive health insurance for employees and family",
      },
      {
        type: "Flexible Hours",
        description: "Flexible working hours and remote work options",
      },
      {
        type: "Learning & Development",
        description: "Annual learning budget and training programs",
      },
    ],
    perks: ["Free lunch", "Gym membership", "Team outings", "Stock options"],
    hiringInfo: {
      activelyHiring: true,
      jobOpenings: 15,
      averageResponseTime: "2-3 days",
      hiringProcess: [
        "Application Review",
        "Technical Assessment",
        "Cultural Fit Interview",
      ],
    },
    stats: {
      totalEmployees: 350,
      femaleEmployees: 140,
      maleEmployees: 210,
      totalJobsPosted: 50,
      totalApplications: 1200,
      averageRating: 4.5,
      totalReviews: 85,
    },
    leadership: [
      {
        name: "John Doe",
        position: "CEO & Founder",
        bio: "15+ years in tech industry",
        linkedinUrl: "https://linkedin.com/in/johndoe",
      },
    ],
    technologies: ["React", "Node.js", "Python", "AWS", "Docker", "Kubernetes"],
    awards: [
      {
        title: "Best Tech Startup 2020",
        year: 2020,
        description: "Awarded by Tech India Awards",
      },
    ],
    verificationStatus: {
      isVerified: true,
      verifiedAt: new Date(),
      verificationNotes: "All documents verified",
    },
    status: "active",
    featured: true,
    premium: true,
  },
  {
    name: "FinanceHub India",
    email: "contact@financehub.in",
    website: "https://financehub.in",
    tagline: "Your trusted financial partner",
    logo: "https://via.placeholder.com/150/008000/FFFFFF?text=FinanceHub",
    coverImage:
      "https://via.placeholder.com/1200x400/008000/FFFFFF?text=FinanceHub+Cover",
    description:
      "FinanceHub India is a leading financial services company providing banking, investment, and insurance solutions to millions of customers across India.",
    foundedYear: 2010,
    industry: "Finance",
    subIndustry: ["Banking & Financial Services"],
    companyType: "Public",
    size: "1001-5000",
    headquarters: {
      address: "456 Finance Tower",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400001",
    },
    contactInfo: {
      phone: "+91-22-98765432",
      hrEmail: "careers@financehub.in",
      email: "contact@financehub.in",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/company/financehub",
      twitter: "https://twitter.com/financehub",
    },
    culture: {
      workEnvironment: "Office-based with occasional remote work",
      values: ["Trust", "Transparency", "Customer First", "Excellence"],
      mission: "To provide accessible financial services to everyone",
      vision: "To be India's most trusted financial institution",
    },
    benefits: [
      {
        type: "Health Insurance",
        description: "Premium health coverage for entire family",
      },
      {
        type: "Retirement Plans",
        description: "Competitive pension and retirement benefits",
      },
      {
        type: "Learning & Development",
        description: "Financial support for certifications and courses",
      },
    ],
    perks: [
      "Performance bonuses",
      "Transport allowance",
      "Cafeteria",
      "Annual trips",
    ],
    hiringInfo: {
      activelyHiring: true,
      jobOpenings: 25,
      averageResponseTime: "5-7 days",
      hiringProcess: ["Aptitude Test", "Technical Interview", "HR Round"],
    },
    stats: {
      totalEmployees: 2500,
      femaleEmployees: 900,
      maleEmployees: 1600,
      totalJobsPosted: 100,
      totalApplications: 5000,
      averageRating: 4.2,
      totalReviews: 200,
    },
    technologies: ["Java", "Spring Boot", "Oracle", "AWS", "Microservices"],
    verificationStatus: {
      isVerified: true,
      verifiedAt: new Date(),
      verificationNotes: "Verified financial institution",
    },
    status: "active",
    featured: true,
  },
  {
    name: "HealthCare Plus",
    email: "info@healthcareplus.com",
    website: "https://healthcareplus.com",
    tagline: "Your health, our priority",
    logo: "https://via.placeholder.com/150/FF0000/FFFFFF?text=HealthCarePlus",
    coverImage:
      "https://via.placeholder.com/1200x400/FF0000/FFFFFF?text=HealthCarePlus+Cover",
    description:
      "HealthCare Plus is a multi-specialty hospital chain committed to providing world-class healthcare services with compassion and care.",
    foundedYear: 2005,
    industry: "Healthcare",
    subIndustry: ["Hospitals & Clinics"],
    companyType: "Private",
    size: "501-1000",
    headquarters: {
      address: "789 Medical Road",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110001",
    },
    contactInfo: {
      phone: "+91-11-55556666",
      hrEmail: "hr@healthcareplus.com",
      email: "info@healthcareplus.com",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/company/healthcareplus",
      facebook: "https://facebook.com/healthcareplus",
    },
    culture: {
      workEnvironment: "Hospital-based with shift rotations",
      values: ["Compassion", "Excellence", "Integrity", "Innovation"],
      mission: "To provide accessible quality healthcare to all",
      vision: "To be the most preferred healthcare provider in India",
    },
    benefits: [
      {
        type: "Health Insurance",
        description: "Free medical care for employees and dependents",
      },
      {
        type: "Relocation Assistance",
        description: "Subsidized housing for outstation employees",
      },
      {
        type: "Learning & Development",
        description: "Support for medical certifications and training",
      },
    ],
    perks: [
      "24/7 cafeteria",
      "Transport facility",
      "Day care",
      "Wellness programs",
    ],
    hiringInfo: {
      activelyHiring: true,
      jobOpenings: 40,
      averageResponseTime: "3-4 days",
      hiringProcess: [
        "Credential Verification",
        "Interview",
        "Practical Assessment",
      ],
    },
    stats: {
      totalEmployees: 800,
      femaleEmployees: 450,
      maleEmployees: 350,
      totalJobsPosted: 75,
      totalApplications: 2000,
      averageRating: 4.3,
      totalReviews: 120,
    },
    technologies: [
      "EMR Systems",
      "Hospital Management Software",
      "Telemedicine",
    ],
    verificationStatus: {
      isVerified: true,
      verifiedAt: new Date(),
      verificationNotes: "Healthcare facility verified",
    },
    status: "active",
  },
  {
    name: "EduTech Academy",
    email: "contact@edutech.ac",
    website: "https://edutech.ac",
    tagline: "Learning reimagined",
    logo: "https://via.placeholder.com/150/FF8C00/FFFFFF?text=EduTech",
    coverImage:
      "https://via.placeholder.com/1200x400/FF8C00/FFFFFF?text=EduTech+Cover",
    description:
      "EduTech Academy is revolutionizing education through technology-enabled learning solutions for students and professionals.",
    foundedYear: 2018,
    industry: "Education",
    subIndustry: ["EdTech"],
    companyType: "Startup",
    size: "51-200",
    headquarters: {
      address: "321 Education Hub",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      zipCode: "411001",
    },
    contactInfo: {
      phone: "+91-20-44445555",
      hrEmail: "careers@edutech.ac",
      email: "contact@edutech.ac",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/company/edutech",
      youtube: "https://youtube.com/edutech",
    },
    culture: {
      workEnvironment: "Fully remote with occasional meetups",
      values: ["Innovation", "Impact", "Accessibility", "Quality"],
      mission: "To make quality education accessible to everyone",
      vision: "To be the global leader in online education",
    },
    benefits: [
      { type: "Health Insurance", description: "Health and wellness benefits" },
      { type: "Remote Work", description: "100% remote work flexibility" },
      {
        type: "Learning & Development",
        description: "Annual budget for courses and books",
      },
    ],
    perks: [
      "Free courses",
      "Home office setup",
      "Flexible hours",
      "International exposure",
    ],
    hiringInfo: {
      activelyHiring: true,
      jobOpenings: 12,
      averageResponseTime: "2-3 days",
      hiringProcess: [
        "Skills Assessment",
        "Virtual Interview",
        "Trial Project",
      ],
    },
    stats: {
      totalEmployees: 120,
      femaleEmployees: 55,
      maleEmployees: 65,
      totalJobsPosted: 30,
      totalApplications: 800,
      averageRating: 4.6,
      totalReviews: 45,
    },
    technologies: ["React", "Django", "MongoDB", "AWS", "Machine Learning"],
    verificationStatus: {
      isVerified: true,
      verifiedAt: new Date(),
      verificationNotes: "Educational institution verified",
    },
    status: "active",
    premium: true,
  },
  {
    name: "RetailMart India",
    email: "contact@retailmart.in",
    website: "https://retailmart.in",
    tagline: "Shop smart, live better",
    logo: "https://via.placeholder.com/150/FFD700/000000?text=RetailMart",
    coverImage:
      "https://via.placeholder.com/1200x400/FFD700/000000?text=RetailMart+Cover",
    description:
      "RetailMart India is the country's largest retail chain with stores across all major cities, offering everything from groceries to electronics.",
    foundedYear: 2000,
    industry: "Retail",
    subIndustry: ["E-commerce & Retail"],
    companyType: "Public",
    size: "5000+",
    headquarters: {
      address: "555 Retail Plaza",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      zipCode: "500001",
    },
    contactInfo: {
      phone: "+91-40-66667777",
      hrEmail: "jobs@retailmart.in",
      email: "contact@retailmart.in",
    },
    socialLinks: {
      linkedin: "https://linkedin.com/company/retailmart",
      instagram: "https://instagram.com/retailmart",
    },
    culture: {
      workEnvironment: "Mix of store and office roles",
      values: ["Customer First", "Teamwork", "Innovation", "Sustainability"],
      mission: "To provide quality products at affordable prices",
      vision: "To be India's most loved retail brand",
    },
    benefits: [
      {
        type: "Health Insurance",
        description: "Medical coverage for employees",
      },
      { type: "Other", description: "30% discount on all products" },
      {
        type: "Learning & Development",
        description: "Fast-track career progression programs",
      },
    ],
    perks: [
      "Employee discounts",
      "Performance incentives",
      "Transport",
      "Meals",
    ],
    hiringInfo: {
      activelyHiring: true,
      jobOpenings: 100,
      averageResponseTime: "5-7 days",
      hiringProcess: ["Walk-in Interview", "Documentation", "Rapid Onboarding"],
    },
    stats: {
      totalEmployees: 15000,
      femaleEmployees: 6000,
      maleEmployees: 9000,
      totalJobsPosted: 300,
      totalApplications: 20000,
      averageRating: 4.0,
      totalReviews: 500,
    },
    technologies: [
      "POS Systems",
      "Inventory Management",
      "E-commerce Platform",
    ],
    verificationStatus: {
      isVerified: true,
      verifiedAt: new Date(),
      verificationNotes: "Major retail chain verified",
    },
    status: "active",
    featured: true,
  },
];

async function createSampleCompanies() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find or create a system admin user for sample companies
    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      role: String,
    });
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("⚠️  No admin user found, creating system user...");
      adminUser = await User.create({
        firstName: "System",
        lastName: "Admin",
        email: "system@finautojobs.com",
        role: "admin",
      });
      console.log("✅ System user created");
    } else {
      console.log("✅ Using existing admin user:", adminUser.email);
    }

    // Add recruiter field to all sample companies
    const companiesWithRecruiter = sampleCompanies.map((company) => ({
      ...company,
      recruiter: adminUser._id,
    }));

    console.log("🗑️  Clearing existing companies...");
    await Company.deleteMany({});
    console.log("✅ Cleared existing companies");

    console.log("📝 Creating sample companies...");
    const createdCompanies = await Company.insertMany(companiesWithRecruiter);
    console.log(`✅ Created ${createdCompanies.length} sample companies`);

    console.log("\n📊 Sample Companies Created:");
    createdCompanies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   Industry: ${company.industry}`);
      console.log(
        `   Location: ${company.headquarters.city}, ${company.headquarters.country}`
      );
      console.log(`   Employees: ${company.stats.totalEmployees}`);
      console.log(`   Job Openings: ${company.hiringInfo.jobOpenings}`);
      console.log(
        `   Verified: ${company.verificationStatus.isVerified ? "✅" : "❌"}`
      );
      console.log(`   Status: ${company.status}`);
      console.log(`   Featured: ${company.featured ? "⭐" : "-"}`);
    });

    console.log("\n✅ All sample companies created successfully!");
    console.log("🌐 You can now view them at http://localhost:3000/companies");
  } catch (error) {
    console.error("❌ Error creating sample companies:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
}

createSampleCompanies();
