import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeDatabase } from '../config/database.js';

// Import all MongoDB models to ensure they're registered
import BaseUser from '../models/unified/BaseUser.js';
import Applicant from '../models/unified/Applicant.js';
import Recruiter from '../models/unified/Recruiter.js';
import Admin from '../models/unified/Admin.js';
import Job from '../models/unified/Job.js';
import Application from '../models/unified/Application.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import Interview from '../models/Interview.js';
import JobAlert from '../models/JobAlert.js';
import Moderation from '../models/Moderation.js';
import EnhancedApplication from '../models/EnhancedApplication.js';

// Load environment variables
dotenv.config();

async function setupMongoDB() {
  try {
    console.log('🚀 Starting MongoDB setup...');
    
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connection established');
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    
    // User indexes
    await BaseUser.createIndexes();
    console.log('✅ User indexes created');
    
    // Job indexes
    await Job.createIndexes();
    console.log('✅ Job indexes created');
    
    // Application indexes
    await EnhancedApplication.createIndexes();
    console.log('✅ Application indexes created');
    
    // Company indexes
    await Company.createIndexes();
    console.log('✅ Company indexes created');
    
    // Notification indexes
    await Notification.createIndexes();
    console.log('✅ Notification indexes created');
    
    // Create sample admin user if none exists
    const adminExists = await BaseUser.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('👤 Creating default admin user...');
      
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 12);
      
      const adminUser = new BaseUser({
        username: 'admin',
        email: 'admin@finautojobs.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        phone: '+91-9999999999',
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        isPhoneVerified: false
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@finautojobs.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('👤 Admin user already exists');
    }
    
    // Create sample data if database is empty
    const userCount = await BaseUser.countDocuments();
    const jobCount = await Job.countDocuments();
    const companyCount = await Company.countDocuments();
    
    if (userCount === 0 || userCount === 1) { // Only admin exists
      console.log('📝 Creating sample data...');
      await createSampleData();
    } else {
      console.log(`📊 Database already has ${userCount} users, ${jobCount} jobs, ${companyCount} companies`);
    }
    
    console.log('🎉 MongoDB setup completed successfully!');
    console.log('🔗 Database URL:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

async function createSampleData() {
  const bcrypt = await import('bcryptjs');
  
  try {
    // Create sample companies
    const companies = [
      {
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        industry: 'Technology',
        size: '51-200',
        location: 'Bangalore, India',
        website: 'https://techcorp.com',
        logo: 'https://via.placeholder.com/100x100?text=TC',
        isVerified: true
      },
      {
        name: 'FinanceHub Inc',
        description: 'Financial services and consulting',
        industry: 'Finance',
        size: '11-50',
        location: 'Mumbai, India',
        website: 'https://financehub.com',
        logo: 'https://via.placeholder.com/100x100?text=FH',
        isVerified: true
      }
    ];
    
    const createdCompanies = await Company.insertMany(companies);
    console.log('✅ Sample companies created');
    
    // Create sample users
    const hashedPassword = await bcrypt.default.hash('password123', 12);
    
    const users = [
      {
        username: 'john_applicant',
        email: 'john@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        phone: '+91-9876543210',
        role: 'applicant',
        status: 'active',
        isEmailVerified: true
      },
      {
        username: 'jane_recruiter',
        email: 'jane@techcorp.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        phone: '+91-9876543211',
        role: 'recruiter',
        status: 'active',
        isEmailVerified: true,
        companyId: createdCompanies[0]._id
      }
    ];
    
    const createdUsers = await BaseUser.insertMany(users);
    console.log('✅ Sample users created');
    
    // Create sample jobs
    const jobs = [
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced Frontend Developer to join our team.',
        company: createdCompanies[0]._id,
        recruiter: createdUsers[1]._id,
        location: 'Bangalore, India',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        salary: {
          min: 1200000,
          max: 1800000,
          currency: 'INR'
        },
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
        requirements: [
          '5+ years of experience in Frontend development',
          'Strong knowledge of React and modern JavaScript',
          'Experience with TypeScript',
          'Good understanding of responsive design'
        ],
        benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
        status: 'active',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Financial Analyst',
        description: 'Join our finance team as a Financial Analyst.',
        company: createdCompanies[1]._id,
        recruiter: createdUsers[1]._id,
        location: 'Mumbai, India',
        jobType: 'Full-time',
        workMode: 'Office',
        salary: {
          min: 800000,
          max: 1200000,
          currency: 'INR'
        },
        skills: ['Excel', 'Financial Modeling', 'SQL', 'Python'],
        requirements: [
          '3+ years of experience in financial analysis',
          'Strong Excel and modeling skills',
          'Knowledge of SQL and Python preferred'
        ],
        benefits: ['Health Insurance', 'Bonus', 'Career Growth'],
        status: 'active',
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
      }
    ];
    
    await Job.insertMany(jobs);
    console.log('✅ Sample jobs created');
    
    console.log('📊 Sample data creation completed');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMongoDB()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export default setupMongoDB;
