
import mongoose from 'mongoose';
import BaseUser from '../models/unified/BaseUser.js';
import Applicant from '../models/unified/Applicant.js';
import Recruiter from '../models/unified/Recruiter.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

async function connectToDatabase() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory database');
}

async function disconnectFromDatabase() {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Disconnected from in-memory database');
}

async function createSampleData() {
  // Create a sample applicant
  const applicantData = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    password: 'password123',
    role: 'applicant',
    socialLinks: {
      linkedinUrl: 'linkedin.com/johndoe',
      githubUrl: 'github.com/johndoe',
      portfolioUrl: 'johndoe.com',
    },
    skills: {
      languages: [
        { language: 'English', proficiency: 'native' },
        { language: 'Spanish', proficiency: 'intermediate' },
      ],
    },
    languages: [],
    documents: {
      portfolioUrl: 'johndoe-portfolio.com',
    },
  };
  const applicant = new Applicant(applicantData);
  await applicant.save();

  // Create a sample recruiter
  const recruiterData = {
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'janesmith',
    email: 'jane.smith@example.com',
    phone: '0987654321',
    password: 'password123',
    role: 'recruiter',
    professionalLinks: {
      linkedin: 'linkedin.com/janesmith',
      github: 'github.com/janesmith',
      personalWebsite: 'janesmith.com',
    },
  };
  const recruiter = new Recruiter(recruiterData);
  await recruiter.save();
}

async function migrateUsers() {
  const users = await BaseUser.find({});
  console.log(`Found ${users.length} users to migrate.`);

  for (const user of users) {
    let updated = false;

    // Migrate social links
    if (user.socialLinks) {
      if (user.socialLinks.linkedinUrl) {
        user.linkedin_url = user.socialLinks.linkedinUrl;
        updated = true;
      }
      if (user.socialLinks.githubUrl) {
        user.github_url = user.socialLinks.githubUrl;
        updated = true;
      }
      if (user.socialLinks.portfolioUrl) {
        user.portfolio_url = user.socialLinks.portfolioUrl;
        updated = true;
      }
      user.socialLinks = undefined;
    }

    if (user.role === 'applicant') {
      // Migrate applicant portfolio URL
      if (user.documents && user.documents.portfolioUrl) {
        user.portfolio_url = user.documents.portfolioUrl;
        user.documents.portfolioUrl = undefined;
        updated = true;
      }

      // Migrate applicant languages
      if (user.skills && user.skills.languages && user.skills.languages.length > 0) {
        user.languages = user.skills.languages.map(l => ({ name: l.language, proficiency: l.proficiency }));
        user.skills.languages = undefined;
        updated = true;
      }
    }

    if (user.role === 'recruiter') {
        // Migrate recruiter professional links
        if (user.professionalLinks) {
            if (user.professionalLinks.linkedin) {
                user.linkedin_url = user.professionalLinks.linkedin;
                updated = true;
            }
            if (user.professionalLinks.github) {
                user.github_url = user.professionalLinks.github;
                updated = true;
            }
            if (user.professionalLinks.personalWebsite) {
                user.portfolio_url = user.professionalLinks.personalWebsite;
                updated = true;
            }
            user.professionalLinks = undefined;
        }
    }

    if (updated) {
      await user.save();
      console.log(`Migrated user ${user.username}`);
    }
  }
}

async function main() {
  await connectToDatabase();
  await createSampleData();
  await migrateUsers();
  const users = await BaseUser.find({});
  console.log('Migration complete. Showing updated users:');
  users.forEach(user => {
    console.log(JSON.stringify(user.toObject(), null, 2));
  });
  await disconnectFromDatabase();
}

main().catch(console.error);
