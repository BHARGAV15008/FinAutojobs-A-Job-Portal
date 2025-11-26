import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://technogenius1500_db_user:ZnqBQD8wc4M6c1Fm@cluster0.slmyrux.mongodb.net/?appName=Cluster0';

async function checkUserUrls() {
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
      console.log('🔍 User found:');
      console.log('  - linkedin_url:', user.linkedin_url);
      console.log('  - github_url:', user.github_url);
      console.log('  - portfolio_url:', user.portfolio_url);
      console.log('  - resume_url:', user.resume_url);
      console.log('  - socialLinks:', user.socialLinks);
      console.log('  - professionalLinks:', user.professionalLinks);
      console.log('  - documents:', user.documents);
      
      // Show all URL-related fields
      const urlFields = {};
      Object.keys(user).forEach(key => {
        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
          urlFields[key] = user[key];
        }
      });
      console.log('🔍 All URL-related fields:', urlFields);
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

checkUserUrls();
