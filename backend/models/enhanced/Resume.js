import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  
  // File information
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  
  // Resume metadata
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Parsed content (extracted from file)
  extractedText: {
    type: String
  },
  parsedData: {
    skills: [{
      type: String,
      trim: true
    }],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
      grade: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date
    }],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }]
  },
  
  // Status and settings
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'processing'],
    default: 'active'
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastViewed: Date,
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    fileName: String,
    fileUrl: String,
    createdAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
resumeSchema.index({ userId: 1, isDefault: 1 });
resumeSchema.index({ userId: 1, status: 1 });
resumeSchema.index({ createdAt: -1 });

// Ensure only one default resume per user
resumeSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for file extension
resumeSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop().toLowerCase();
});

export default mongoose.model('Resume', resumeSchema);
