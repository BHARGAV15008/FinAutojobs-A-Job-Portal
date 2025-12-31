import mongoose from 'mongoose';

const companyAnalyticSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  jobsPosted: {
    type: Number,
    default: 0
  },
  applicationsReceived: {
    type: Number,
    default: 0
  },
  profileViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

companyAnalyticSchema.index({ companyId: 1, date: 1 });

const CompanyAnalytic = mongoose.model('CompanyAnalytic', companyAnalyticSchema);

export default CompanyAnalytic;
