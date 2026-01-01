import mongoose from "mongoose";

// Unified Application Schema with consistent naming and linking
const applicationSchema = new mongoose.Schema(
  {
    // Application ID (consistent with naming convention)
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },

    // References (consistent ID linking)
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseUser",
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseUser",
      required: true,
    },

    // Reference to detailed application information
    applicationInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplicationInformation",
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },

    // Application Status
    applicationStatus: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "under_review", // Legacy support
        "shortlisted",
        "interviewed",
        "selected",
        "accepted", // Legacy support
        "rejected",
        "withdrawn",
      ],
      default: "pending",
    },

    // Application Data
    applicationData: {
      resumeUrl: { type: String }, // Made optional since users might not always upload
      coverLetter: { type: String }, // Added for cover letter text
      coverLetterUrl: { type: String }, // For uploaded cover letter files
      portfolioUrl: { type: String },
      linkedinUrl: { type: String },
      expectedSalary: { type: String },
      noticePeriod: { type: String },
      willingToRelocate: { type: Boolean, default: false },
      remoteWorkPreference: { type: Boolean, default: false },
      additionalInfo: { type: String },
      referralSource: { type: String },
      customAnswers: [
        {
          question: { type: String },
          answer: { type: String },
        },
      ],
    },

    // Applicant Snapshot (for historical data)
    applicantSnapshot: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      location: { type: String },
      currentJobTitle: { type: String },
      currentCompany: { type: String },
      experience: { type: String },
      skills: [{ type: String }],
      education: [
        {
          degree: { type: String },
          institution: { type: String },
          fieldOfStudy: { type: String },
        },
      ],
      workExperience: [
        {
          jobTitle: { type: String },
          companyName: { type: String },
          description: { type: String },
        },
      ],
    },

    // Job Snapshot (for historical data)
    jobSnapshot: {
      jobTitle: { type: String, required: true },
      companyName: { type: String, required: true },
      location: { type: String },
      jobType: { type: String },
    },

    // Application Timeline
    timeline: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    // Recruiter Actions
    recruiterActions: {
      viewedAt: { type: Date },
      shortlistedAt: { type: Date },
      rejectedAt: { type: Date },
      notes: { type: String },
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String },
    },

    // Interview Information
    interviewInfo: {
      isScheduled: { type: Boolean, default: false },
      interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
      scheduledDate: { type: Date },
      interviewType: {
        type: String,
        enum: ["phone", "video", "in-person", "technical"],
      },
      interviewStatus: {
        type: String,
        enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      },
    },

    // Communication
    messages: [
      {
        messageId: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderRole: { type: String, enum: ["applicant", "recruiter"] },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      },
    ],

    // Metadata
    source: { type: String, default: "web" }, // web, mobile, api
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    strictPopulate: false,
    strict: false,
  }
);

// Indexes for performance (removed duplicate unique indexes)
applicationSchema.index({ applicantId: 1, jobId: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ jobId: 1, applicationStatus: 1 });
applicationSchema.index({ recruiterId: 1, applicationStatus: 1 });
applicationSchema.index({ createdAt: -1 });

// Pre-save middleware to update timeline
applicationSchema.pre("save", function (next) {
  if (this.isModified("applicationStatus")) {
    this.timeline.push({
      status: this.applicationStatus,
      timestamp: new Date(),
    });
  }
  next();
});

export default mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
