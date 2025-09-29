import mongoose from 'mongoose';
import Interview from './models/Interview.js';
import { BaseUser } from './models/UserModels.js';
import Job from './models/Job.js';
import Application from './models/unified/Application.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/finauto_jobs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createInterviewData() {
  try {
    console.log('🔄 Creating interview test data...\n');
    
    // Get existing users, jobs, and applications
    const recruiter = await BaseUser.findOne({ role: 'recruiter' });
    const applicant = await BaseUser.findOne({ role: 'applicant' });
    const job = await Job.findOne();
    const application = await Application.findOne({ applicantId: applicant?._id, jobId: job?._id });
    
    if (!recruiter || !applicant || !job || !application) {
      console.log('❌ Missing required data. Please run create-test-data.js first');
      console.log(`Found: Recruiter: ${!!recruiter}, Applicant: ${!!applicant}, Job: ${!!job}, Application: ${!!application}`);
      return;
    }
    
    console.log('Found data:');
    console.log(`Recruiter: ${recruiter.firstName} ${recruiter.lastName} (${recruiter._id})`);
    console.log(`Applicant: ${applicant.firstName} ${applicant.lastName} (${applicant._id})`);
    console.log(`Job: ${job.jobTitle} (${job._id})\n`);
    
    // Clear existing interviews
    await Interview.deleteMany({});
    console.log('✅ Cleared existing interviews\n');
    
    // Create test interviews
    const interviews = [
      {
        jobId: job._id,
        candidateId: applicant._id,
        recruiterId: recruiter._id,
        applicationId: application._id,
        interviewType: 'screening',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        scheduledTime: '10:00',
        duration: 30,
        status: 'scheduled',
        title: 'Initial Phone Screening',
        createdBy: recruiter._id,
        description: 'Initial phone screening to discuss background and role requirements',
        meetingLink: 'tel:+919876543210',
        location: 'Phone Call',
        interviewerNotes: 'Review candidate resume and discuss experience',
        candidateInfo: {
          name: `${applicant.firstName} ${applicant.lastName}`,
          email: applicant.email,
          phone: applicant.phone
        },
        jobInfo: {
          title: job.jobTitle,
          company: job.companyName,
          location: job.location
        }
      },
      {
        jobId: job._id,
        candidateId: applicant._id,
        recruiterId: recruiter._id,
        applicationId: application._id,
        interviewType: 'technical',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        scheduledTime: '14:00',
        duration: 60,
        status: 'scheduled',
        title: 'Technical Interview',
        createdBy: recruiter._id,
        description: 'Technical interview to assess financial analysis skills',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        location: 'Google Meet',
        interviewerNotes: 'Prepare technical questions about financial modeling',
        candidateInfo: {
          name: `${applicant.firstName} ${applicant.lastName}`,
          email: applicant.email,
          phone: applicant.phone
        },
        jobInfo: {
          title: job.jobTitle,
          company: job.companyName,
          location: job.location
        }
      },
      {
        jobId: job._id,
        candidateId: applicant._id,
        recruiterId: recruiter._id,
        applicationId: application._id,
        interviewType: 'hr',
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (completed)
        scheduledTime: '11:00',
        duration: 45,
        status: 'completed',
        title: 'HR Interview',
        createdBy: recruiter._id,
        description: 'HR interview to discuss company culture and compensation',
        meetingLink: '',
        location: 'Office - Conference Room A',
        interviewerNotes: 'Discuss salary expectations and start date',
        candidateInfo: {
          name: `${applicant.firstName} ${applicant.lastName}`,
          email: applicant.email,
          phone: applicant.phone
        },
        jobInfo: {
          title: job.jobTitle,
          company: job.companyName,
          location: job.location
        },
        feedback: {
          rating: 4,
          notes: 'Good candidate with relevant experience. Recommended for next round.',
          recommendation: 'next-round'
        }
      }
    ];
    
    // Save interviews
    for (let i = 0; i < interviews.length; i++) {
      const interview = new Interview(interviews[i]);
      await interview.save();
      console.log(`✅ Created interview ${i + 1}: ${interview.title} (${interview._id})`);
    }
    
    console.log('\n🎉 Interview test data created successfully!');
    console.log('\n📋 Summary:');
    console.log('📝 3 interviews created');
    console.log('📅 1 completed, 2 scheduled');
    console.log('📞 Phone, Video, and In-person interviews');
    
  } catch (error) {
    console.error('❌ Error creating interview data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createInterviewData();
