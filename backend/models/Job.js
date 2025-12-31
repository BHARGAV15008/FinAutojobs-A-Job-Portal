import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    // ===== CONSOLIDATED FIELDS - No Duplicates =====

    // Unique job identifier
    jobId: {
      type: String,
      unique: true,
      required: true,
    },

    // Fields from the old schema that might be useful
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    vacancy: {
      type: Number,
      required: [true, "Number of vacancies is required"],
      default: 1,
      min: [1, "There must be at least one vacancy."],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      enum: {
        values: ["Finance & Banking", "Automobile & Manufacturing"],
        message:
          "Industry must be either Finance & Banking or Automobile & Manufacturing",
      },
    },
    jobCategory: {
      type: String,
      required: [true, "Job category is required"],
      enum: {
        values: [
          "Banking & Financial Services",
          "Investment Banking",
          "Insurance",
          "Mutual Funds",
          "Credit & Lending",
          "Financial Planning",
          "Risk Management",
          "Compliance",
          "Fintech",
          "Accounting & Auditing",
          "Tax Advisory",
          "Treasury Management",
          // Automotive categories
          "Automotive Engineering",
          "Manufacturing Operations",
          "Quality Assurance",
          "Supply Chain Management",
          "Research & Development",
          "Sales & Marketing",
          "After Sales Service",
        ],
        message: "Please select a valid job category",
      },
    },
    workArrangement: {
      type: String,
      required: [true, "Work arrangement is required"],
      enum: {
        values: ["On-site", "Remote", "Hybrid"],
        message: "Please select a valid work arrangement",
      },
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: {
        values: ["Full Time", "Part Time", "Internship", "Contract", "Freelance"],
        message: "Please select a valid job type",
      },
    },
    experience: {
      minimum: {
        type: Number,
        required: [true, "Minimum experience is required"],
        min: [0, "Minimum experience cannot be negative"],
        max: [50, "Minimum experience cannot exceed 50 years"],
      },
      maximum: {
        type: Number,
        required: [true, "Maximum experience is required"],
        min: [0, "Maximum experience cannot be negative"],
        max: [50, "Maximum experience cannot exceed 50 years"],
        validate: {
          validator: function (value) {
            // Handle both document creation and updates
            const minExperience =
              this.experience?.minimum || this.get?.("experience.minimum") || 0;
            return value >= minExperience;
          },
          message:
            "Maximum experience must be greater than or equal to minimum experience",
        },
      },
    },
    requiredSkills: [
      {
        type: String,
        enum: {
          values: [
            // Finance Skills
            "Financial Analysis",
            "Risk Assessment",
            "Regulatory Compliance",
            "Financial Modeling",
            "Investment Analysis",
            "Credit Analysis",
            "Portfolio Management",
            "Financial Reporting",
            "KYC/AML",
            "IFRS/GAAP",
            "Excel Advanced",
            "Bloomberg Terminal",
            "SAP Finance",
            "Tally",
            "QuickBooks",
            "Python for Finance",
            "SQL",
            "Tableau",
            "Power BI",
            // Automotive Skills
            "CAD Design",
            "Manufacturing Processes",
            "Quality Control",
            "Lean Manufacturing",
            "Six Sigma",
            "Project Management",
            "Supply Chain",
            "Automotive Electronics",
            "Engine Technology",
            "Safety Standards",
            "ISO/TS 16949",
            "APQP",
            "FMEA",
            "SPC",
            "Kaizen",
          ],
          message: "Please select valid skills from the available options",
        },
      },
    ],
    salary: {
      type: {
        type: String,
        required: [true, "Salary type is required"],
        enum: {
          values: ["Range", "Fixed", "Negotiable"],
          message: "Salary type must be Range, Fixed, or Negotiable",
        },
      },
      minimum: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
      },
      maximum: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
        validate: {
          validator: function (value) {
            // Handle case where salary might be undefined during updates
            if (
              this.salary &&
              this.salary.type === "Range" &&
              this.salary.minimum
            ) {
              return value >= this.salary.minimum;
            }
            return true;
          },
          message:
            "Maximum salary must be greater than or equal to minimum salary",
        },
      },
      period: {
        type: String,
        required: [true, "Salary period is required"],
        enum: {
          values: ["Monthly", "Yearly"],
          message: "Salary period must be Monthly or Yearly",
        },
      },
      currency: {
        type: String,
        default: "INR",
        enum: ["INR", "USD", "EUR", "GBP"],
      },
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
      minlength: [50, "Job description must be at least 50 characters"],
      maxlength: [5000, "Job description cannot exceed 5000 characters"],
    },
    keyResponsibilities: [
      {
        type: String,
        maxlength: [500, "Each responsibility cannot exceed 500 characters"],
      },
    ],
    requirements: [
      {
        type: String,
        maxlength: [500, "Each requirement cannot exceed 500 characters"],
      },
    ],
    aiKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    isAiEnhanced: {
      type: Boolean,
      default: false,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    jobUrgency: {
      type: String,
      required: [true, "Job urgency is required"],
      enum: {
        values: ["Normal Priority", "Urgent", "High Priority"],
        message:
          "Job urgency must be Normal Priority, Urgent, or High Priority",
      },
      default: "Normal Priority",
    },
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Application deadline must be in the future",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "active", "closed", "paused"],
        message: "Status must be draft, active, closed, or paused",
      },
      default: "draft",
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseUser",
      required: true,
      index: true,
    },
    recruiterInfo: {
      recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BaseUser",
        required: [true, "Recruiter information is required"],
      },
      companyInfo: {
        companyName: String,
        department: String,
        designation: String,
      },
    },
    autoStatusManagement: {
      type: Boolean,
      default: true,
    },

    // Tracking & Metadata
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    positionsAvailable: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    slug: { type: String, unique: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    publishedAt: { type: Date },

    // Admin & Moderation
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "BaseUser" },
    approvalReason: { type: String },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "BaseUser" },
    rejectionReason: { type: String },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "BaseUser" },
    isDeleted: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    collection: "jobs",
  }
);

// Pre-save middleware for automatic status management
JobSchema.pre("save", function (next) {
  if (this.autoStatusManagement && this.applicationDeadline) {
    const now = new Date();
    const deadline = new Date(this.applicationDeadline);

    // If deadline has passed and job is active, mark as closed
    if (deadline < now && this.status === "active") {
      this.status = "closed";
    }
    // If deadline is in past and user tries to make it active, keep as closed
    else if (
      deadline < now &&
      this.isModified("status") &&
      this.status === "active"
    ) {
      this.status = "closed";
    }
  }
  next();
});

// Indexes for performance
JobSchema.index({ location: 1 });
JobSchema.index({ jobType: 1, workArrangement: 1 });
JobSchema.index({ "salary.minimum": 1, "salary.maximum": 1 });
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ postedBy: 1, status: 1 });
JobSchema.index({ applicationDeadline: 1 });
JobSchema.index({ slug: 1 });

// Virtual for formatted salary
JobSchema.virtual("formattedSalary").get(function () {
  if (this.salary.type === "Negotiable") {
    return "Negotiable";
  }

  const currency = this.salary.currency || "INR";
  const period = this.salary.period;

  if (this.salary.type === "Fixed") {
    return `${currency} ${this.salary.minimum?.toLocaleString()} ${period}`;
  }

  if (this.salary.type === "Range") {
    return `${currency} ${this.salary.minimum?.toLocaleString()} - ${this.salary.maximum?.toLocaleString()} ${period}`;
  }

  return "Not specified";
});

// Virtual for days since posted
JobSchema.virtual("daysSincePosted").get(function () {
  const now = new Date();
  const posted = this.createdAt;
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days until deadline
JobSchema.virtual("daysUntilDeadline").get(function () {
  const now = new Date();
  const deadline = this.applicationDeadline;
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to generate slug
JobSchema.pre("save", function (next) {
  if (this.isModified("jobTitle") || this.isModified("companyName")) {
    this.slug = `${this.jobTitle}-${this.companyName}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Set expiration date to application deadline + 7 days
  if (this.applicationDeadline) {
    this.expiresAt = new Date(
      this.applicationDeadline.getTime() + 7 * 24 * 60 * 60 * 1000
    );
  }

  // Update timestamp
  this.updatedAt = new Date();

  next();
});

// Static methods for job queries
JobSchema.statics.findActiveJobs = function (filters = {}) {
  return this.find({
    status: "active",
    applicationDeadline: { $gt: new Date() },
    ...filters,
  }).sort({ createdAt: -1 });
};

JobSchema.statics.findJobsByRecruiter = function (recruiterId) {
  return this.find({ "recruiterInfo.recruiterId": recruiterId }).sort({
    createdAt: -1,
  });
};

JobSchema.statics.searchJobs = function (searchTerm, filters = {}) {
  return this.find({
    $and: [
      {
        $or: [
          { jobTitle: { $regex: searchTerm, $options: "i" } },
          { jobDescription: { $regex: searchTerm, $options: "i" } },
          { companyName: { $regex: searchTerm, $options: "i" } },
          { requiredSkills: { $in: [new RegExp(searchTerm, "i")] } },
        ],
      },
      { status: "active" },
      { applicationDeadline: { $gt: new Date() } },
      filters,
    ],
  }).sort({ createdAt: -1 });
};

// Instance methods
JobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

JobSchema.methods.incrementApplications = function () {
  this.applicationsCount += 1;
  return this.save();
};

JobSchema.methods.isExpired = function () {
  return this.applicationDeadline < new Date();
};

JobSchema.methods.canApply = function () {
  return this.status === "active" && !this.isExpired();
};

// Method to check if job should be automatically closed
JobSchema.methods.checkDeadlineStatus = function () {
  if (this.autoStatusManagement && this.applicationDeadline) {
    const now = new Date();
    const deadline = new Date(this.applicationDeadline);

    if (deadline < now && this.status === "active") {
      this.status = "closed";
      return true; // Status changed
    }
  }
  return false; // No status change
};

// Static method to update expired jobs
JobSchema.statics.updateExpiredJobs = async function () {
  const now = new Date();
  const result = await this.updateMany(
    {
      status: "active",
      applicationDeadline: { $lt: now },
      autoStatusManagement: true,
    },
    {
      status: "closed",
      updatedAt: new Date(),
    }
  );
  return result;
};

const Job = mongoose.model("Job", JobSchema);

export default Job;
