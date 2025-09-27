import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/UserMongoose.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Reset password for specific users
const resetPasswords = async () => {
  try {
    await connectDB();
    
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update passwords for the users that frontend is trying to use
    const users = [
      'bhargavjani008@gmail.com',
      'technogenius1500@gmail.com'
    ];
    
    for (const email of users) {
      const result = await User.updateOne(
        { email: email.toLowerCase() },
        { $set: { password: hashedPassword } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Password reset for ${email} - New password: ${newPassword}`);
      } else {
        console.log(`❌ User not found: ${email}`);
      }
    }
    
    console.log('\n🎉 Password reset complete!');
    console.log('You can now login with:');
    console.log('Email: bhargavjani008@gmail.com or technogenius1500@gmail.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

resetPasswords();
