// Direct database check for applicantSnapshot
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from './models/unified/Application.js';
import fs from 'fs';

dotenv.config({ path: './.env.development' });

async function checkSnapshot() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');
    
    // Find ALL applications first
    const allApps = await Application.find({}).limit(5);
    console.log(`\n📋 Found ${allApps.length} applications in database`);
    if (allApps.length > 0) {
      console.log('First application jobId:', allApps[0].jobId);
      console.log('First application _id:', allApps[0]._id);
    }
    
    // Find the specific application
    const app = await Application.findOne({ jobId: '690605d784d1a8bd3d4c2843' });
    
    if (!app) {
      console.log('\n❌ No application found for jobId: 690605d784d1a8bd3d4c2843');
      console.log('Trying with ObjectId...');
      const appById = await Application.findOne({ jobId: mongoose.Types.ObjectId('690605d784d1a8bd3d4c2843') });
      if (!appById) {
        console.log('❌ Still not found with ObjectId');
        return;
      }
      console.log('✅ Found with ObjectId!');
      return;
    }
    
    console.log('\n📊 Application found:');
    console.log('Application ID:', app._id);
    console.log('Applicant ID:', app.applicantId);
    console.log('Has applicantSnapshot?', !!app.applicantSnapshot);
    
    if (app.applicantSnapshot) {
      console.log('\n✅ applicantSnapshot EXISTS!');
      console.log('Total fields:', Object.keys(app.applicantSnapshot).length);
      console.log('First 10 keys:', Object.keys(app.applicantSnapshot).slice(0, 10));
      console.log('\nEducation:', app.applicantSnapshot.education?.length || 0, 'entries');
      console.log('Work Experience:', app.applicantSnapshot.workExperience?.length || 0, 'entries');
      console.log('Bio:', app.applicantSnapshot.bio ? 'Present' : 'Missing');
      
      // Save to file
      fs.writeFileSync(
        'database-snapshot-check.json',
        JSON.stringify(app.applicantSnapshot, null, 2),
        'utf8'
      );
      console.log('\n📝 Full snapshot saved to: database-snapshot-check.json');
    } else {
      console.log('\n❌ applicantSnapshot is EMPTY/NULL in database!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkSnapshot();
