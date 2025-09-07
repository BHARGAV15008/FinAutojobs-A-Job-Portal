import { db } from './config/database.js';
import * as schema from './schema.js';
import bcrypt from 'bcryptjs';

// Additional comprehensive dataset for FinAutoJobs
export const seedAdditionalData = async () => {
  try {
    console.log('🌱 Seeding additional comprehensive data...');

    // Additional Companies
    const additionalCompanies = [
      {
        name: 'Infosys',
        description: 'Global leader in next-generation digital services and consulting',
        logo_url: 'https://logos-world.net/wp-content/uploads/2020/06/Infosys-Logo.png',
        website: 'https://infosys.com',
        location: 'Bengaluru, Karnataka',
        industry: 'Information Technology',
        size: '1000+',
        founded_year: 1981,
        email: 'careers@infosys.com',
        phone: '+91-80-2852-0261',
        linkedin_url: 'https://linkedin.com/company/infosys',
        benefits: '["Health Insurance", "Flexible Work", "Learning & Development", "Stock Options"]',
        culture: 'Innovation-driven culture with focus on employee growth',
        mission: 'Navigate your next with digital innovation, technology, and talent',
        verified: true
      },
      {
        name: 'Tata Consultancy Services',
        description: 'Leading global IT services, consulting and business solutions organization',
        logo_url: 'https://logos-world.net/wp-content/uploads/2020/09/TCS-Logo.png',
        website: 'https://tcs.com',
        location: 'Mumbai, Maharashtra',
        industry: 'Information Technology',
        size: '1000+',
        founded_year: 1968,
        email: 'careers@tcs.com',
        phone: '+91-22-6778-9595',
        linkedin_url: 'https://linkedin.com/company/tcs',
        benefits: '["Health Insurance", "Retirement Plans", "Training Programs", "Work-Life Balance"]',
        culture: 'Values-driven organization with focus on excellence',
        mission: 'Build on Belief - helping customers achieve their business objectives',
        verified: true
      },
      {
        name: 'HDFC Bank',
        description: 'Leading private sector bank in India',
        logo_url: 'https://logos-world.net/wp-content/uploads/2021/02/HDFC-Bank-Logo.png',
        website: 'https://hdfcbank.com',
        location: 'Mumbai, Maharashtra',
        industry: 'Banking & Financial Services',
        size: '1000+',
        founded_year: 1994,
        email: 'careers@hdfcbank.com',
        phone: '+91-22-6160-6161',
        linkedin_url: 'https://linkedin.com/company/hdfc-bank',
        benefits: '["Medical Insurance", "Performance Bonus", "Career Growth", "Training"]',
        culture: 'Customer-centric approach with innovation at core',
        mission: 'We understand your world and help you achieve your dreams',
        verified: true
      },
      {
        name: 'Flipkart',
        description: 'Leading e-commerce marketplace in India',
        logo_url: 'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png',
        website: 'https://flipkart.com',
        location: 'Bengaluru, Karnataka',
        industry: 'E-commerce',
        size: '1000+',
        founded_year: 2007,
        email: 'careers@flipkart.com',
        phone: '+91-80-4719-2222',
        linkedin_url: 'https://linkedin.com/company/flipkart',
        benefits: '["Stock Options", "Health Insurance", "Flexible Hours", "Learning Budget"]',
        culture: 'Fast-paced, innovative environment with customer obsession',
        mission: 'Transform commerce through technology',
        verified: true
      },
      {
        name: 'Zomato',
        description: 'Leading food delivery and restaurant discovery platform',
        logo_url: 'https://logos-world.net/wp-content/uploads/2021/08/Zomato-Logo.png',
        website: 'https://zomato.com',
        location: 'Gurugram, Haryana',
        industry: 'Food Technology',
        size: '501-1000',
        founded_year: 2008,
        email: 'careers@zomato.com',
        phone: '+91-124-4616-500',
        linkedin_url: 'https://linkedin.com/company/zomato',
        benefits: '["Health Insurance", "Meal Allowance", "Flexible Work", "Stock Options"]',
        culture: 'Food-first culture with focus on innovation and customer delight',
        mission: 'Better food for more people',
        verified: true
      }
    ];

    // Insert additional companies
    for (const company of additionalCompanies) {
      await db.insert(schema.companies).values(company);
    }

    // Additional Jobs
    const additionalJobs = [
      {
        title: 'Full Stack Developer',
        company_id: 5, // Infosys
        location: 'Bengaluru, Karnataka',
        salary_min: 800000,
        salary_max: 1500000,
        salary_currency: 'INR',
        job_type: 'Full Time',
        work_mode: 'Hybrid',
        experience_min: 2,
        experience_max: 5,
        english_level: 'Good English',
        description: 'Join our digital transformation team as a Full Stack Developer. Work on cutting-edge projects using modern technologies.',
        requirements: '2+ years of full stack development experience\nProficiency in React, Node.js, and databases\nExperience with cloud platforms\nBachelor\'s degree in Computer Science',
        benefits: 'Competitive salary\nHealth insurance\nFlexible work arrangements\nLearning opportunities',
        skills_required: '["React", "Node.js", "JavaScript", "MongoDB", "AWS", "Git"]',
        category: 'Technology',
        featured: true
      },
      {
        title: 'Data Scientist',
        company_id: 6, // TCS
        location: 'Pune, Maharashtra',
        salary_min: 1200000,
        salary_max: 2000000,
        salary_currency: 'INR',
        job_type: 'Full Time',
        work_mode: 'Work from Office',
        experience_min: 3,
        experience_max: 6,
        english_level: 'Advanced English',
        description: 'Looking for a Data Scientist to work on AI/ML projects and drive data-driven decision making.',
        requirements: '3+ years of data science experience\nStrong knowledge of Python, R, and ML algorithms\nExperience with big data technologies\nMaster\'s degree preferred',
        benefits: 'Excellent compensation\nHealth benefits\nTraining programs\nCareer growth',
        skills_required: '["Python", "R", "Machine Learning", "SQL", "Tableau", "TensorFlow"]',
        category: 'Data Science',
        featured: true
      },
      {
        title: 'Investment Analyst',
        company_id: 7, // HDFC Bank
        location: 'Mumbai, Maharashtra',
        salary_min: 1000000,
        salary_max: 1800000,
        salary_currency: 'INR',
        job_type: 'Full Time',
        work_mode: 'Work from Office',
        experience_min: 1,
        experience_max: 3,
        english_level: 'Advanced English',
        description: 'Join our investment team to analyze market trends and investment opportunities.',
        requirements: '1-3 years of financial analysis experience\nStrong analytical and quantitative skills\nKnowledge of financial markets\nCFA or MBA preferred',
        benefits: 'Competitive package\nPerformance bonuses\nHealth insurance\nProfessional development',
        skills_required: '["Financial Analysis", "Excel", "Bloomberg", "Valuation", "Risk Management"]',
        category: 'Finance',
        featured: false
      },
      {
        title: 'Product Manager',
        company_id: 8, // Flipkart
        location: 'Bengaluru, Karnataka',
        salary_min: 1500000,
        salary_max: 2500000,
        salary_currency: 'INR',
        job_type: 'Full Time',
        work_mode: 'Hybrid',
        experience_min: 4,
        experience_max: 8,
        english_level: 'Advanced English',
        description: 'Lead product strategy and execution for our e-commerce platform. Drive innovation and user experience.',
        requirements: '4+ years of product management experience\nStrong analytical and strategic thinking\nExperience with agile methodologies\nMBA or equivalent preferred',
        benefits: 'Stock options\nHealth insurance\nFlexible work\nLearning budget',
        skills_required: '["Product Strategy", "Analytics", "Agile", "User Research", "SQL", "A/B Testing"]',
        category: 'Product',
        featured: true
      },
      {
        title: 'Backend Developer',
        company_id: 9, // Zomato
        location: 'Gurugram, Haryana',
        salary_min: 900000,
        salary_max: 1600000,
        salary_currency: 'INR',
        job_type: 'Full Time',
        work_mode: 'Work from Office',
        experience_min: 2,
        experience_max: 4,
        english_level: 'Good English',
        description: 'Build scalable backend systems for our food delivery platform. Work with microservices and distributed systems.',
        requirements: '2+ years of backend development experience\nProficiency in Java, Python, or Go\nExperience with databases and APIs\nKnowledge of system design',
        benefits: 'Meal allowance\nHealth insurance\nStock options\nFlexible hours',
        skills_required: '["Java", "Python", "Microservices", "Redis", "PostgreSQL", "Docker"]',
        category: 'Technology',
        featured: false
      },
      {
        title: 'Digital Marketing Manager',
        company_id: 8, // Flipkart
        location: 'Mumbai, Maharashtra',
        salary_min: 800000,
        salary_max: 1400000,
        salary_currency: 'INR',
        job_type: 'Full Time',
        work_mode: 'Hybrid',
        experience_min: 3,
        experience_max: 6,
        english_level: 'Advanced English',
        description: 'Drive digital marketing campaigns and customer acquisition strategies for our e-commerce platform.',
        requirements: '3+ years of digital marketing experience\nExperience with Google Ads, Facebook Ads\nStrong analytical skills\nBachelor\'s degree in Marketing or related field',
        benefits: 'Performance bonuses\nHealth insurance\nFlexible work\nTraining programs',
        skills_required: '["Digital Marketing", "Google Ads", "Facebook Ads", "Analytics", "SEO", "Content Marketing"]',
        category: 'Marketing',
        featured: false
      }
    ];

    // Insert additional jobs
    for (const job of additionalJobs) {
      await db.insert(schema.jobs).values(job);
    }

    // Sample Users
    const sampleUsers = [
      {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'John Doe',
        phone: '+91-9876543210',
        role: 'jobseeker',
        bio: 'Experienced software developer with passion for full-stack development',
        location: 'Bengaluru, Karnataka',
        skills: '["JavaScript", "React", "Node.js", "Python", "AWS"]',
        qualification: 'Bachelor of Technology in Computer Science',
        experience_years: 3,
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        email_verified: true
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Jane Smith',
        phone: '+91-9876543211',
        role: 'jobseeker',
        bio: 'Data scientist with expertise in machine learning and analytics',
        location: 'Mumbai, Maharashtra',
        skills: '["Python", "R", "Machine Learning", "SQL", "Tableau"]',
        qualification: 'Master of Science in Data Science',
        experience_years: 4,
        linkedin_url: 'https://linkedin.com/in/janesmith',
        email_verified: true
      },
      {
        username: 'recruiter_infosys',
        email: 'recruiter@infosys.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Priya Sharma',
        phone: '+91-9876543212',
        role: 'employer',
        bio: 'Senior recruiter at Infosys with 5+ years of experience',
        location: 'Bengaluru, Karnataka',
        company_name: 'Infosys',
        position: 'Senior Recruiter',
        company_id: 5,
        linkedin_url: 'https://linkedin.com/in/priyasharma',
        email_verified: true
      }
    ];

    // Insert sample users
    for (const user of sampleUsers) {
      await db.insert(schema.users).values(user);
    }

    console.log('✅ Additional comprehensive data seeded successfully!');
    console.log('📊 Database now contains:');
    console.log('   - Companies: 9 total');
    console.log('   - Jobs: 12+ total');
    console.log('   - Users: 3 sample users');
    
  } catch (error) {
    console.error('❌ Error seeding additional data:', error);
    throw error;
  }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdditionalData()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}