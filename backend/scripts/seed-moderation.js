import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Moderation from '../models/Moderation.js';
import Job from '../models/Job.js';
import { BaseUser } from '../models/UserModels.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

async function seedModerationData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing moderation data
    await Moderation.deleteMany({});
    console.log('🗑️ Cleared existing moderation data');

    // Get some existing jobs and users for reference
    const jobs = await Job.find().limit(5);
    const users = await BaseUser.find().limit(3);

    if (jobs.length === 0) {
      console.log('⚠️ No jobs found. Please create some jobs first.');
      return;
    }

    // Create sample moderation items
    const moderationItems = [
      {
        contentId: jobs[0]._id,
        contentType: 'Job',
        status: 'pending',
        priority: 'high',
        flagReason: 'Suspicious keywords detected',
        flagDetails: 'Job posting contains urgent/immediate keywords that may indicate spam',
        flaggedBy: users[0]?._id,
        contentSnapshot: {
          title: jobs[0].jobTitle,
          company: jobs[0].companyName,
          description: jobs[0].jobDescription?.substring(0, 200)
        }
      },
      {
        contentId: jobs[1]?._id || jobs[0]._id,
        contentType: 'Job',
        status: 'under_review',
        priority: 'medium',
        flagReason: 'Duplicate content',
        flagDetails: 'Similar job posting found from same company',
        flaggedBy: users[1]?._id || users[0]?._id,
        contentSnapshot: {
          title: jobs[1]?.jobTitle || jobs[0].jobTitle,
          company: jobs[1]?.companyName || jobs[0].companyName,
          description: jobs[1]?.jobDescription?.substring(0, 200) || jobs[0].jobDescription?.substring(0, 200)
        }
      },
      {
        contentId: jobs[2]?._id || jobs[0]._id,
        contentType: 'Job',
        status: 'pending',
        priority: 'low',
        flagReason: 'Incomplete information',
        flagDetails: 'Job posting lacks essential details like salary range or job requirements',
        autoFlags: [{
          type: 'policy_violation',
          confidence: 0.7,
          details: 'Missing required fields'
        }],
        contentSnapshot: {
          title: jobs[2]?.jobTitle || jobs[0].jobTitle,
          company: jobs[2]?.companyName || jobs[0].companyName,
          description: jobs[2]?.jobDescription?.substring(0, 200) || jobs[0].jobDescription?.substring(0, 200)
        }
      }
    ];

    // Add user moderation items if we have users
    if (users.length > 0) {
      moderationItems.push({
        contentId: users[0]._id,
        contentType: 'BaseUser',
        status: 'pending',
        priority: 'high',
        flagReason: 'Suspicious activity',
        flagDetails: 'User has been applying to multiple jobs rapidly',
        userReports: [{
          reportedBy: users[1]?._id || users[0]._id,
          reason: 'Spam behavior',
          details: 'This user sent identical messages to multiple recruiters'
        }],
        contentSnapshot: {
          name: `${users[0].firstName} ${users[0].lastName}`,
          email: users[0].email,
          role: users[0].role
        }
      });
    }

    // Insert moderation items
    const insertedItems = await Moderation.insertMany(moderationItems);
    console.log(`✅ Created ${insertedItems.length} moderation items`);

    // Display created items
    console.log('\n📋 Created Moderation Items:');
    insertedItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.contentType} - ${item.flagReason} (${item.status}, ${item.priority})`);
    });

    console.log('\n🎉 Moderation data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding moderation data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedModerationData();
