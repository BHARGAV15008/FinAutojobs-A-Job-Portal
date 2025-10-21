import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Import Job model
const Job = mongoose.model('Job', new mongoose.Schema({
  // Basic Information
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: {
      values: ['Finance & Banking', 'Automobile & Manufacturing'],
      message: 'Industry must be either Finance & Banking or Automobile & Manufacturing'
    }
  },
  
  jobCategory: {
    type: String,
    required: [true, 'Job category is required'],
    enum: {
      values: [
        'Banking & Financial Services',
        'Investment Banking',
        'Insurance',
        'Mutual Funds',
        'Credit & Lending',
        'Financial Planning',
        'Risk Management',
        'Compliance',
        'Fintech',
        'Accounting & Auditing',
        'Tax Advisory',
        'Treasury Management',
        'Corporate Finance',
        'Automotive Engineering',
        'Manufacturing Operations',
        'Quality Control',
        'Supply Chain Management',
        'Research & Development',
        'Sales & Marketing',
        'After Sales Service',
        'Design & Styling'
      ],
      message: 'Invalid job category'
    }
  },
  
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: {
      values: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
      message: 'Invalid job type'
    }
  },
  
  workArrangement: {
    type: String,
    required: [true, 'Work arrangement is required'],
    enum: {
      values: ['On-site', 'Remote', 'Hybrid'],
      message: 'Work arrangement must be On-site, Remote, or Hybrid'
    }
  },
  
  // Salary Information (Old format for compatibility)
  salary: {
    type: {
      type: String,
      enum: ['Fixed', 'Range', 'Negotiable'],
      default: 'Negotiable'
    },
    minimum: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    maximum: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(value) {
          // Handle case where salary might be undefined during updates
          if (this.salary && this.salary.type === 'Range' && this.salary.minimum) {
            return value >= this.salary.minimum;
          }
          return true;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    period: {
      type: String,
      required: [true, 'Salary period is required'],
      enum: ['Yearly', 'Monthly', 'Weekly', 'Daily', 'Hourly'],
      default: 'Yearly'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // New Salary Range format
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    period: {
      type: String,
      enum: ['Yearly', 'Monthly', 'Weekly', 'Daily', 'Hourly'],
      default: 'Yearly'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Experience Requirements
  experience: {
    minimum: {
      type: Number,
      min: [0, 'Minimum experience cannot be negative'],
      default: 0
    },
    maximum: {
      type: Number,
      min: [0, 'Maximum experience cannot be negative']
    }
  },
  
  // Skills and Requirements
  requiredSkills: [{
    type: String,
    trim: true
  }],
  
  // Job Description
  jobDescription: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  
  keyResponsibilities: {
    type: String,
    maxlength: [3000, 'Key responsibilities cannot exceed 3000 characters']
  },
  
  requirements: {
    type: String,
    maxlength: [3000, 'Requirements cannot exceed 3000 characters']
  },
  
  qualifications: {
    type: String,
    maxlength: [2000, 'Qualifications cannot exceed 2000 characters']
  },
  
  // Application Details
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Job Status & Analytics
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Paused', 'Closed', 'Expired'],
    default: 'Active'
  },
  
  jobUrgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  applicationsCount: {
    type: Number,
    default: 0
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedDate: {
    type: Date,
    default: Date.now
  },
  
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Posted by is required']
  },
  
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
}));

const dummyJobs = [
  // Draft Job 1
  {
    jobTitle: 'Senior Financial Analyst - Draft',
    companyName: 'FinTech Solutions Ltd',
    location: 'Mumbai, Delhi, Bangalore',
    industry: 'Finance & Banking',
    jobCategory: 'Financial Planning',
    jobType: 'Full-time',
    workArrangement: 'Hybrid',
    salary: {
      type: 'Range',
      minimum: 800000,
      maximum: 1200000,
      period: 'Yearly',
      currency: 'INR'
    },
    salaryRange: {
      min: 800000,
      max: 1200000,
      period: 'Yearly',
      currency: 'INR'
    },
    experience: {
      minimum: 3,
      maximum: 6
    },
    requiredSkills: ['Financial Modeling', 'Excel', 'SQL', 'Python', 'Risk Analysis'],
    jobDescription: 'We are looking for a Senior Financial Analyst to join our growing team. This role involves analyzing financial data, creating models, and providing insights to support business decisions.',
    keyResponsibilities: 'Develop financial models, analyze market trends, prepare reports, collaborate with cross-functional teams',
    requirements: 'Bachelor\'s degree in Finance, 3-6 years experience, strong analytical skills',
    qualifications: 'CFA or similar certification preferred',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    contactEmail: 'hr@fintechsolutions.com',
    status: 'Draft',
    jobUrgency: 'Medium',
    views: 0,
    applicationsCount: 0,
    slug: 'senior-financial-analyst-draft-' + Date.now()
  },
  
  // Draft Job 2
  {
    jobTitle: 'Automotive Design Engineer - Draft',
    companyName: 'AutoTech Innovations',
    location: 'Chennai, Pune, Hyderabad',
    industry: 'Automobile & Manufacturing',
    jobCategory: 'Design & Styling',
    jobType: 'Full-time',
    workArrangement: 'On-site',
    salary: {
      type: 'Range',
      minimum: 600000,
      maximum: 900000,
      period: 'Yearly',
      currency: 'INR'
    },
    salaryRange: {
      min: 600000,
      max: 900000,
      period: 'Yearly',
      currency: 'INR'
    },
    experience: {
      minimum: 2,
      maximum: 5
    },
    requiredSkills: ['CAD Software', 'SolidWorks', 'AutoCAD', 'Product Design', 'Manufacturing Processes'],
    jobDescription: 'Join our design team to create innovative automotive solutions. Work on cutting-edge vehicle designs and contribute to the future of mobility.',
    keyResponsibilities: 'Create 3D models, collaborate with engineering teams, conduct design reviews, optimize for manufacturing',
    requirements: 'Bachelor\'s in Mechanical/Automotive Engineering, 2-5 years experience, proficiency in CAD tools',
    qualifications: 'Master\'s degree preferred, experience with electric vehicles is a plus',
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    contactEmail: 'careers@autotechinnovations.com',
    status: 'Draft',
    jobUrgency: 'High',
    views: 0,
    applicationsCount: 0,
    slug: 'automotive-design-engineer-draft-' + Date.now()
  },
  
  // Closed Job 1
  {
    jobTitle: 'Investment Banking Associate - Closed',
    companyName: 'Global Investment Bank',
    location: 'Mumbai, Delhi',
    industry: 'Finance & Banking',
    jobCategory: 'Investment Banking',
    jobType: 'Full-time',
    workArrangement: 'On-site',
    salary: {
      type: 'Range',
      minimum: 1500000,
      maximum: 2500000,
      period: 'Yearly',
      currency: 'INR'
    },
    salaryRange: {
      min: 1500000,
      max: 2500000,
      period: 'Yearly',
      currency: 'INR'
    },
    experience: {
      minimum: 2,
      maximum: 4
    },
    requiredSkills: ['Financial Modeling', 'Valuation', 'M&A', 'Excel', 'PowerPoint', 'Bloomberg'],
    jobDescription: 'Exciting opportunity for an Investment Banking Associate to work on high-profile M&A transactions and capital market deals.',
    keyResponsibilities: 'Financial modeling, due diligence, client presentations, transaction execution, market research',
    requirements: 'MBA from top-tier school, 2-4 years IB experience, strong analytical and communication skills',
    qualifications: 'CFA Level 1 or higher preferred, previous bulge bracket experience',
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    contactEmail: 'recruitment@globalib.com',
    status: 'Closed',
    jobUrgency: 'Urgent',
    views: 245,
    applicationsCount: 87,
    slug: 'investment-banking-associate-closed-' + Date.now()
  },
  
  // Closed Job 2
  {
    jobTitle: 'Manufacturing Operations Manager - Closed',
    companyName: 'Premier Auto Manufacturing',
    location: 'Chennai, Aurangabad',
    industry: 'Automobile & Manufacturing',
    jobCategory: 'Manufacturing Operations',
    jobType: 'Full-time',
    workArrangement: 'On-site',
    salary: {
      type: 'Range',
      minimum: 1200000,
      maximum: 1800000,
      period: 'Yearly',
      currency: 'INR'
    },
    salaryRange: {
      min: 1200000,
      max: 1800000,
      period: 'Yearly',
      currency: 'INR'
    },
    experience: {
      minimum: 8,
      maximum: 12
    },
    requiredSkills: ['Lean Manufacturing', 'Six Sigma', 'Production Planning', 'Quality Management', 'Team Leadership'],
    jobDescription: 'Lead manufacturing operations for our automotive production facility. Drive efficiency improvements and ensure quality standards.',
    keyResponsibilities: 'Oversee production operations, implement lean practices, manage teams, ensure safety compliance, optimize processes',
    requirements: 'Bachelor\'s in Engineering, 8-12 years manufacturing experience, proven leadership skills',
    qualifications: 'Six Sigma Black Belt, experience in automotive industry preferred',
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    contactEmail: 'jobs@premierauto.com',
    status: 'Closed',
    jobUrgency: 'High',
    views: 156,
    applicationsCount: 43,
    slug: 'manufacturing-operations-manager-closed-' + Date.now()
  }
];

async function createDummyJobs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finauto-jobs');
    console.log('✅ Connected to MongoDB');
    
    // Find a recruiter user to assign jobs to
    const recruiterUser = await mongoose.connection.db.collection('baseusers').findOne({role: 'recruiter'});
    
    if (!recruiterUser) {
      console.log('❌ No recruiter user found. Please create a recruiter account first.');
      return;
    }
    
    console.log('👤 Found recruiter:', recruiterUser.firstName, recruiterUser.lastName);
    console.log('🆔 Recruiter ID:', recruiterUser._id.toString());
    
    // Add postedBy field to all dummy jobs
    const jobsWithRecruiter = dummyJobs.map(job => ({
      ...job,
      postedBy: recruiterUser._id
    }));
    
    console.log('🔄 Creating dummy jobs...');
    
    // Insert jobs one by one to handle any validation errors
    for (let i = 0; i < jobsWithRecruiter.length; i++) {
      try {
        const job = new Job(jobsWithRecruiter[i]);
        await job.save();
        console.log(`✅ Created job ${i + 1}: ${job.jobTitle} (${job.status})`);
      } catch (error) {
        console.log(`❌ Failed to create job ${i + 1}:`, error.message);
      }
    }
    
    console.log('🎉 Dummy jobs creation completed!');
    
    // Show summary
    const draftCount = await Job.countDocuments({ status: 'Draft', postedBy: recruiterUser._id });
    const closedCount = await Job.countDocuments({ status: 'Closed', postedBy: recruiterUser._id });
    const activeCount = await Job.countDocuments({ status: 'Active', postedBy: recruiterUser._id });
    
    console.log('\n📊 Job Summary for recruiter:');
    console.log(`   Draft jobs: ${draftCount}`);
    console.log(`   Active jobs: ${activeCount}`);
    console.log(`   Closed jobs: ${closedCount}`);
    
  } catch (error) {
    console.error('❌ Error creating dummy jobs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
createDummyJobs();
