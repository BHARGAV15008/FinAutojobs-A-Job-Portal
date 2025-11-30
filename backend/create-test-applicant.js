import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://technogenius1500_db_user:kaCi2YhDO3EqGAWr@cluster0.4vnlmzp.mongodb.net/finautojobs';

// BaseUser Schema (simplified)
const baseUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'recruiter', 'admin'], default: 'applicant' },
  firstName: String,
  lastName: String,
  fullName: String,
  phone: String,
  bio: String,
  currentLocation: {
    city: String,
    country: String
  },
  yearsOfExperience: Number,
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: String,
    endDate: String
  }],
  workExperience: [{
    companyName: String,
    jobTitle: String,
    startDate: String,
    endDate: String,
    description: String,
    isCurrentJob: Boolean
  }],
  skills: {
    primary: [String],
    technical: [String],
    soft: [String]
  },
  socialLinks: {
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String
  },
  documents: {
    resumeUrl: String
  },
  expectedSalary: String,
  noticePeriod: String,
  jobPreferences: {
    remoteWorkPreference: Boolean,
    willingToRelocate: Boolean
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BaseUser = mongoose.model('BaseUser', baseUserSchema, 'baseusers');

async function createTestApplicant() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if applicant already exists
    const existingApplicant = await BaseUser.findOne({ 
      email: 'vijaymaliya92@gmail.com',
      role: 'applicant'
    });

    if (existingApplicant) {
      console.log('✅ Applicant account already exists!');
      console.log('📧 Email:', existingApplicant.email);
      console.log('👤 Name:', existingApplicant.fullName || `${existingApplicant.firstName} ${existingApplicant.lastName}`);
      console.log('🔑 Use password: Vijay@123');
      
      // Update password to known value
      const hashedPassword = await bcrypt.hash('Vijay@123', 10);
      existingApplicant.password = hashedPassword;
      await existingApplicant.save();
      console.log('✅ Password updated to: Vijay@123');
      
      await mongoose.disconnect();
      return;
    }

    // Create new applicant
    console.log('🔄 Creating test applicant account...');
    
    const hashedPassword = await bcrypt.hash('Vijay@123', 10);
    
    const testApplicant = new BaseUser({
      email: 'vijaymaliya92@gmail.com',
      password: hashedPassword,
      role: 'applicant',
      firstName: 'Vijay',
      lastName: 'Maliya',
      fullName: 'Vijay Maliya',
      phone: '8989345622',
      bio: 'Experienced software engineer with 5 years of experience',
      currentLocation: {
        city: 'Mumbai',
        country: 'India'
      },
      yearsOfExperience: 5,
      education: [{
        institution: 'MBIT',
        degree: 'BTECH',
        fieldOfStudy: 'Computer Science',
        startDate: '2016',
        endDate: '2020'
      }],
      workExperience: [{
        companyName: 'Scaledge Tech',
        jobTitle: 'Auto Engineer',
        startDate: '2019',
        endDate: '2023',
        description: 'Worked on automotive software systems',
        isCurrentJob: false
      }],
      skills: {
        primary: ['Java', 'MongoDB', 'React', 'Node.js'],
        technical: ['JavaScript', 'Python', 'SQL'],
        soft: ['Communication', 'Teamwork', 'Problem Solving']
      },
      socialLinks: {
        linkedinUrl: 'http://linkedin.com/in/vijaymaliya',
        githubUrl: 'http://github.com/vijaymaliya',
        portfolioUrl: 'http://vijaymaliya.com'
      },
      documents: {
        resumeUrl: '/uploads/documents/resume_vijay.pdf'
      },
      expectedSalary: '₹8-10 LPA',
      noticePeriod: '30 days',
      jobPreferences: {
        remoteWorkPreference: false,
        willingToRelocate: false
      }
    });

    await testApplicant.save();
    
    console.log('✅ Test applicant created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: vijaymaliya92@gmail.com');
    console.log('🔑 Password: Vijay@123');
    console.log('👤 Role: applicant');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🌐 Login URL: http://192.168.41.134:3000/login');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTestApplicant();
