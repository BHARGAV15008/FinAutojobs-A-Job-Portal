import mongoose from 'mongoose';
import User from './User.js';

const adminSchema = new mongoose.Schema({
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageJobs: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false }
  },
  adminLevel: { 
    type: String, 
    enum: ['super-admin', 'admin', 'moderator'], 
    default: 'admin' 
  }
});

const Admin = User.discriminator('admin', adminSchema);

export default Admin;