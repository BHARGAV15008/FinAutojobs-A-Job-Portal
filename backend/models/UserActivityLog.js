import mongoose from 'mongoose';

const userActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

userActivityLogSchema.index({ userId: 1 });

const UserActivityLog = mongoose.model('UserActivityLog', userActivityLogSchema);

export default UserActivityLog;
