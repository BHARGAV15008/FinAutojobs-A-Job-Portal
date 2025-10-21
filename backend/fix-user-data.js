import mongoose from 'mongoose';
import { BaseUser } from './models/UserModels.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.development' });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.DATABASE_URL || 
                   process.env.MONGO_URL ||
                   'mongodb://localhost:27017/finautojobs';

async function fixUserData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use direct MongoDB operations to avoid Mongoose validation issues
    const db = mongoose.connection.db;
    
    // Check all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    const collection = db.collection('users');

    // First, let's see what users exist
    const users = await collection.find({}).toArray();
    console.log('Total users found:', users.length);
    
    if (users.length > 0) {
      console.log('Available users:', users.map(u => ({ 
        email: u.email, 
        _id: u._id, 
        skillsType: typeof u.skills,
        languagesType: typeof u.languages 
      })));
    }

    // Also check other possible user collections
    const applicants = await db.collection('applicants').find({}).toArray();
    const recruiters = await db.collection('recruiters').find({}).toArray();
    const baseusers = await db.collection('baseusers').find({}).toArray();
    const cleanusers = await db.collection('cleanusers').find({}).toArray();
    
    console.log('Applicants found:', applicants.length);
    console.log('Recruiters found:', recruiters.length);
    console.log('BaseUsers found:', baseusers.length);
    console.log('CleanUsers found:', cleanusers.length);

    if (baseusers.length > 0) {
      console.log('BaseUsers data:', baseusers.map(u => ({ 
        email: u.email, 
        _id: u._id, 
        skillsType: typeof u.skills,
        languagesType: typeof u.languages 
      })));
    }

    if (users.length === 0 && applicants.length === 0 && recruiters.length === 0 && baseusers.length === 0) {
      console.log('No users found in any collection');
      return;
    }

    // Combine all users for processing
    const allUsers = [...users, ...applicants, ...recruiters, ...baseusers];

    // Fix all users with corrupted data
    let totalFixed = 0;
    
    for (const user of allUsers) {
      console.log(`\n🔍 Processing user: ${user.email}`);
      console.log('Current user skills:', user.skills);
      console.log('Skills type:', typeof user.skills);
      console.log('Current user languages:', user.languages);
      console.log('Languages type:', typeof user.languages);

      let updateFields = {};

      // Fix the skills field if it's a string
      if (typeof user.skills === 'string') {
        console.log('Fixing corrupted skills data...');
        
        let skillsArray;
        try {
          skillsArray = JSON.parse(user.skills);
        } catch (e) {
          console.log('Failed to parse skills as JSON, treating as comma-separated');
          skillsArray = user.skills.split(',').map(s => s.trim());
        }

        updateFields.skills = {
          primary: Array.isArray(skillsArray) ? skillsArray : [],
          technical: [],
          soft: [],
          languages: []
        };

        console.log('✅ Skills data prepared for fix');
      }

      // Also check and fix languages field
      if (typeof user.languages === 'string') {
        console.log('Fixing corrupted languages data...');
        
        let languagesArray;
        try {
          languagesArray = JSON.parse(user.languages);
        } catch (e) {
          languagesArray = user.languages.split(',').map(s => s.trim());
        }

        updateFields.languages = Array.isArray(languagesArray) ? languagesArray : [];
        console.log('✅ Languages data prepared for fix');
      }

      // Apply the fixes using raw MongoDB update
      if (Object.keys(updateFields).length > 0) {
        // Determine which collection this user belongs to
        let targetCollection = 'users';
        if (baseusers.find(u => u._id.equals(user._id))) {
          targetCollection = 'baseusers';
        } else if (applicants.find(u => u._id.equals(user._id))) {
          targetCollection = 'applicants';
        } else if (recruiters.find(u => u._id.equals(user._id))) {
          targetCollection = 'recruiters';
        }

        const result = await db.collection(targetCollection).updateOne(
          { _id: user._id },
          { $set: updateFields }
        );

        console.log(`✅ Update result for ${targetCollection}:`, result);
        console.log('✅ User data fixed successfully');
        totalFixed++;
      } else {
        console.log('No corrupted data found for this user');
      }
    }

    console.log(`\n🎉 Data fix completed! Fixed ${totalFixed} users.`);
    
  } catch (error) {
    console.error('Error fixing user data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixUserData();
