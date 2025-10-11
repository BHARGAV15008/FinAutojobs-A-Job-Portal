#!/usr/bin/env node

/**
 * Analyze Database Structure
 * Analyzes the MongoDB database to understand where user information is stored
 */

import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function analyzeDatabaseStructure() {
  try {
    console.log('🔍 Analyzing Database Structure...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // List all collections in the database
    console.log('\n📋 All Collections in Database:');
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   ❌ No collections found in database');
      return;
    }

    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      console.log(`   ${i + 1}. Collection: "${collection.name}"`);
      console.log(`      Type: ${collection.type || 'collection'}`);
      
      // Get document count for each collection
      const count = await db.collection(collection.name).countDocuments();
      console.log(`      Document Count: ${count}`);
      
      // Get a sample document to understand structure
      if (count > 0) {
        const sampleDoc = await db.collection(collection.name).findOne();
        console.log(`      Sample Document Keys:`, Object.keys(sampleDoc || {}));
        
        // Check if this looks like a users collection
        const docKeys = Object.keys(sampleDoc || {});
        const userIndicators = ['email', 'password', 'role', 'username', 'firstName', 'lastName'];
        const hasUserFields = userIndicators.some(field => docKeys.includes(field));
        
        if (hasUserFields) {
          console.log(`      🎯 POTENTIAL USER COLLECTION - Contains user-like fields`);
          
          // Show more details for potential user collections
          console.log(`      📊 Sample Document Structure:`);
          if (sampleDoc) {
            Object.keys(sampleDoc).forEach(key => {
              const value = sampleDoc[key];
              const type = typeof value;
              const preview = type === 'string' && value.length > 50 
                ? value.substring(0, 50) + '...' 
                : value;
              console.log(`         ${key}: ${type} = ${preview}`);
            });
          }
          
          // Check for different roles if this is a user collection
          if (docKeys.includes('role')) {
            console.log(`      🔑 Roles found in this collection:`);
            const roles = await db.collection(collection.name).distinct('role');
            roles.forEach(role => {
              console.log(`         - ${role}`);
            });
            
            // Count users by role
            for (const role of roles) {
              const roleCount = await db.collection(collection.name).countDocuments({ role: role });
              console.log(`         ${role}: ${roleCount} users`);
            }
          }
        }
      }
      console.log(''); // Empty line between collections
    }

    // Look for specific user-related collections
    console.log('🔍 Searching for User-Related Collections:');
    const userCollectionNames = ['users', 'user', 'accounts', 'profiles', 'admins', 'applicants', 'recruiters'];
    
    for (const collectionName of userCollectionNames) {
      try {
        const exists = await db.collection(collectionName).findOne();
        if (exists) {
          console.log(`   ✅ Found collection: "${collectionName}"`);
          const count = await db.collection(collectionName).countDocuments();
          console.log(`      Documents: ${count}`);
          
          if (count > 0) {
            const sample = await db.collection(collectionName).findOne();
            console.log(`      Sample keys:`, Object.keys(sample || {}));
          }
        }
      } catch (error) {
        // Collection doesn't exist, continue
      }
    }

    // Check the models to understand the expected structure
    console.log('\n🏗️ Expected User Model Structure (from backend code):');
    console.log('   Based on the backend models, users should be stored in a collection with:');
    console.log('   - email (string)');
    console.log('   - password (hashed string)');
    console.log('   - role (admin/applicant/recruiter)');
    console.log('   - firstName, lastName (strings)');
    console.log('   - username (string)');
    console.log('   - isActive, isVerified (booleans)');
    console.log('   - createdAt, updatedAt (dates)');

  } catch (error) {
    console.error('❌ Error analyzing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

analyzeDatabaseStructure()
  .then(() => console.log('\n🎯 Database structure analysis completed!'))
  .catch(console.error);
