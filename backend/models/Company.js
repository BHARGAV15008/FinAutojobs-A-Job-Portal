import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    website: { type: String, trim: true },
    logo: { type: String },
    coverImage: { type: String },
    description: { type: String },
    foundedYear: { type: Number },

    // Company Details
    industry: { type: String, required: true },
    subIndustry: [{ type: String }],
    companyType: {
      type: String,
      enum: ["Private", "Public", "Government", "Startup", "MNC", "Non-Profit"],
      default: "Private",
    },
    size: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1001-5000",
        "5000+",
      ],
      required: true,
    },

    // Location Information
    headquarters: {
      address: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true },
      zipCode: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // Additional Locations/Branches
    branches: [
      {
        name: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String },
      },
    ],

    // Contact Information
    contactInfo: {
      phone: { type: String },
      alternatePhone: { type: String },
      email: { type: String },
      hrEmail: { type: String },
      supportEmail: { type: String },
    },

    // Social Links
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      github: { type: String },
    },

    // Company Culture & Benefits
    culture: {
      workEnvironment: { type: String },
      values: [{ type: String }],
      mission: { type: String },
      vision: { type: String },
    },

    benefits: [
      {
        type: {
          type: String,
          enum: [
            "Health Insurance",
            "Life Insurance",
            "Retirement Plans",
            "Paid Time Off",
            "Remote Work",
            "Flexible Hours",
            "Learning & Development",
            "Gym Membership",
            "Free Meals",
            "Transportation",
            "Relocation Assistance",
            "Stock Options",
            "Performance Bonus",
            "Parental Leave",
            "Child Care",
            "Other",
          ],
        },
        description: { type: String },
      },
    ],

    perks: [{ type: String }],

    // Hiring Information
    hiringInfo: {
      activelyHiring: { type: Boolean, default: true },
      jobOpenings: { type: Number, default: 0 },
      averageResponseTime: { type: String }, // e.g., "2 days"
      hiringProcess: [{ type: String }], // e.g., ["Application", "Phone Screen", "Technical", "Interview"]
    },

    // Company Stats
    stats: {
      totalEmployees: { type: Number },
      femaleEmployees: { type: Number },
      maleEmployees: { type: Number },
      totalJobsPosted: { type: Number, default: 0 },
      totalApplications: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },

    // Financial Information (Optional)
    financialInfo: {
      revenue: { type: String },
      funding: { type: String },
      fundingRounds: [
        {
          round: { type: String },
          amount: { type: String },
          date: { type: Date },
          investors: [{ type: String }],
        },
      ],
    },

    // Key People
    leadership: [
      {
        name: { type: String },
        position: { type: String },
        bio: { type: String },
        linkedinUrl: { type: String },
        image: { type: String },
      },
    ],

    // Products/Services
    products: [
      {
        name: { type: String },
        description: { type: String },
        url: { type: String },
      },
    ],

    // Technologies Used
    technologies: [{ type: String }],

    // Awards & Recognition
    awards: [
      {
        title: { type: String },
        issuedBy: { type: String },
        year: { type: Number },
        description: { type: String },
      },
    ],

    // Media & Gallery
    gallery: [
      {
        type: { type: String, enum: ["image", "video"] },
        url: { type: String },
        caption: { type: String },
      },
    ],

    // Verification & Status
    verificationStatus: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verificationNotes: { type: String },
      documentsSubmitted: [
        {
          type: { type: String },
          url: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended", "rejected"],
      default: "pending",
    },

    // Recruiter/Owner Information
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recruiters: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["admin", "recruiter", "viewer"],
          default: "recruiter",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // SEO & Analytics
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },

    analytics: {
      pageViews: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      jobPageViews: { type: Number, default: 0 },
      applicationRate: { type: Number, default: 0 },
    },

    // Featured & Premium
    featured: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date },

    // Reviews & Ratings
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        title: { type: String },
        review: { type: String },
        pros: [{ type: String }],
        cons: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
        helpful: { type: Number, default: 0 },
      },
    ],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
companySchema.index({ name: "text", description: "text", industry: "text" });
companySchema.index({ "verificationStatus.isVerified": 1, status: 1 });
companySchema.index({ industry: 1, "headquarters.city": 1 });
companySchema.index({ recruiter: 1 });
companySchema.index({ "stats.totalJobsPosted": -1 });
companySchema.index({ featured: 1, premium: 1 });

// Pre-save middleware
companySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full address
companySchema.virtual("fullAddress").get(function () {
  const hq = this.headquarters;
  return `${hq.address}, ${hq.city}, ${hq.state}, ${hq.country} ${hq.zipCode}`.trim();
});

// Method to calculate average rating
companySchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
};

export default mongoose.model("Company", companySchema);
