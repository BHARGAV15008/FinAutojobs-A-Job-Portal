import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const UserSession = mongoose.model('UserSession', userSessionSchema);

export default UserSession;
