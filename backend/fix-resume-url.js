import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

async function fixResumeUrl() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('baseusers');

    // Find the specific user
    const user = await collection.findOne({
      email: 'technogenius1500@gmail.com'
    });

    if (user) {
      console.log('🔍 Current resume URL:', user.documents?.resumeUrl);
      
      // Check what files actually exist in uploads/documents
      const uploadsDir = './uploads/documents';
      const files = fs.readdirSync(uploadsDir);
      console.log('📁 Available files:', files);
      
      // Find the most recent resume file for this user
      const userIdFromUrl = user.documents?.resumeUrl?.match(/resume-([a-f0-9]+)-/)?.[1];
      const actualUserId = user.userId || user._id.toString();
      
      console.log('🔍 User ID from URL:', userIdFromUrl);
      console.log('🔍 Actual user ID:', actualUserId);
      
      // Find any resume file that might belong to this user
      const resumeFiles = files.filter(file => 
        file.startsWith('resume-') && file.endsWith('.pdf')
      );
      
      if (resumeFiles.length > 0) {
        // Use the most recent file (assuming filename contains timestamp)
        const latestResume = resumeFiles.sort().pop();
        const newResumeUrl = `/uploads/documents/${latestResume}`;
        
        console.log('📄 Found resume file:', latestResume);
        console.log('🔄 Updating resume URL to:', newResumeUrl);
        
        // Update the database
        const result = await collection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              'documents.resumeUrl': newResumeUrl,
              resume_url: newResumeUrl // Also update the flat field if it exists
            } 
          }
        );
        
        console.log('✅ Update result:', result);
        console.log('✅ Resume URL updated successfully');
      } else {
        console.log('❌ No resume files found in uploads directory');
      }
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixResumeUrl();
