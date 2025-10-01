import mongoose from 'mongoose';

const skillAssessmentSchema = new mongoose.Schema({
  // Assessment details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'soft-skills', 'language', 'industry-specific', 'cognitive'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Skill information
  skillName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  
  // Assessment configuration
  duration: {
    type: Number, // in minutes
    required: true,
    min: 5,
    max: 180
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Questions
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'coding', 'essay', 'practical'],
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    points: {
      type: Number,
      default: 1
    },
    explanation: String,
    codeTemplate: String, // For coding questions
    testCases: [{
      input: String,
      expectedOutput: String
    }]
  }],
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  passRate: {
    type: Number,
    default: 0
  },
  
  // Creator information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  },
  
  // Certification info
  certificateTemplate: String,
  validityPeriod: {
    type: Number, // in months
    default: 12
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Assessment attempt schema
const assessmentAttemptSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillAssessment',
    required: true,
    index: true
  },
  
  // Attempt details
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // actual time taken in minutes
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'expired'],
    default: 'in-progress'
  },
  
  // Answers
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    timeSpent: Number, // in seconds
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  
  // Results
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  totalPoints: Number,
  maxPoints: Number,
  passed: Boolean,
  
  // Performance metrics
  accuracy: Number,
  averageTimePerQuestion: Number,
  
  // Feedback
  feedback: String,
  recommendations: [String],
  
  // Certificate
  certificateId: String,
  certificateUrl: String,
  certificateIssued: Date,
  certificateExpiry: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
skillAssessmentSchema.index({ skillName: 1, difficulty: 1 });
skillAssessmentSchema.index({ category: 1, isActive: 1 });
skillAssessmentSchema.index({ tags: 1 });

assessmentAttemptSchema.index({ userId: 1, assessmentId: 1 });
assessmentAttemptSchema.index({ userId: 1, status: 1 });
assessmentAttemptSchema.index({ score: -1 });

// Virtual for total possible points
skillAssessmentSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, q) => total + (q.points || 1), 0);
});

// Method to calculate score
assessmentAttemptSchema.methods.calculateScore = function() {
  if (!this.answers || this.answers.length === 0) return 0;
  
  const totalEarned = this.answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
  this.totalPoints = totalEarned;
  this.score = (totalEarned / this.maxPoints) * 100;
  this.passed = this.score >= this.assessment.passingScore;
  
  return this.score;
};

// Method to generate certificate
assessmentAttemptSchema.methods.generateCertificate = async function() {
  if (!this.passed) return null;
  
  this.certificateId = `CERT-${this.assessmentId}-${this.userId}-${Date.now()}`;
  this.certificateIssued = new Date();
  
  const assessment = await mongoose.model('SkillAssessment').findById(this.assessmentId);
  if (assessment.validityPeriod) {
    this.certificateExpiry = new Date();
    this.certificateExpiry.setMonth(this.certificateExpiry.getMonth() + assessment.validityPeriod);
  }
  
  // Generate certificate URL (implement certificate generation service)
  this.certificateUrl = `/certificates/${this.certificateId}.pdf`;
  
  await this.save();
  return this.certificateId;
};

export const SkillAssessment = mongoose.model('SkillAssessment', skillAssessmentSchema);
export const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
