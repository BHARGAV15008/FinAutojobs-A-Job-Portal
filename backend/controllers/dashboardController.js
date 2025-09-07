import { db } from '../config/database.js';
import * as schema from '../schema.js';
import { eq, and, desc, asc, count, sum, avg, sql } from 'drizzle-orm';
import { format, subDays } from 'date-fns';

// Mock schema references for new tables (will be replaced with actual schema)
const mockSchema = {
  user_preferences: 'user_preferences',
  job_alerts: 'job_alerts', 
  interviews: 'interviews',
  notifications: 'notifications',
  company_analytics: 'company_analytics',
  user_activity_logs: 'user_activity_logs'
};

// Get applicant dashboard data
export const getApplicantDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile with all details
    const userProfile = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    
    if (!userProfile.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userProfile[0];

    // Get application statistics
    const applicationStats = await db
      .select({
        total: count(),
        pending: sum(sql`CASE WHEN status = 'pending' THEN 1 ELSE 0 END`),
        reviewed: sum(sql`CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END`),
        shortlisted: sum(sql`CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END`),
        rejected: sum(sql`CASE WHEN status = 'rejected' THEN 1 ELSE 0 END`),
        hired: sum(sql`CASE WHEN status = 'hired' THEN 1 ELSE 0 END`)
      })
      .from(schema.applications)
      .where(eq(schema.applications.user_id, userId));

    // Get recent applications with job details
    const recentApplications = await db
      .select({
        id: schema.applications.id,
        status: schema.applications.status,
        appliedAt: schema.applications.applied_at,
        jobTitle: schema.jobs.title,
        companyName: schema.companies.name,
        location: schema.jobs.location,
        salaryMin: schema.jobs.salary_min,
        salaryMax: schema.jobs.salary_max,
        jobType: schema.jobs.job_type
      })
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.job_id, schema.jobs.id))
      .leftJoin(schema.companies, eq(schema.jobs.company_id, schema.companies.id))
      .where(eq(schema.applications.user_id, userId))
      .orderBy(desc(schema.applications.applied_at))
      .limit(10);

    // Get saved jobs
    const savedJobs = await db
      .select({
        id: schema.saved_jobs.id,
        savedAt: schema.saved_jobs.saved_at,
        jobId: schema.jobs.id,
        jobTitle: schema.jobs.title,
        companyName: schema.companies.name,
        location: schema.jobs.location,
        salaryMin: schema.jobs.salary_min,
        salaryMax: schema.jobs.salary_max,
        jobType: schema.jobs.job_type,
        workMode: schema.jobs.work_mode
      })
      .from(schema.saved_jobs)
      .leftJoin(schema.jobs, eq(schema.saved_jobs.job_id, schema.jobs.id))
      .leftJoin(schema.companies, eq(schema.jobs.company_id, schema.companies.id))
      .where(eq(schema.saved_jobs.user_id, userId))
      .orderBy(desc(schema.saved_jobs.saved_at))
      .limit(10);

    // Get recommended jobs based on user skills and preferences
    const userSkills = user.skills ? JSON.parse(user.skills) : [];
    let recommendedJobs = [];
    
    if (userSkills.length > 0) {
      recommendedJobs = await db
        .select({
          id: schema.jobs.id,
          title: schema.jobs.title,
          companyName: schema.companies.name,
          location: schema.jobs.location,
          salaryMin: schema.jobs.salary_min,
          salaryMax: schema.jobs.salary_max,
          jobType: schema.jobs.job_type,
          workMode: schema.jobs.work_mode,
          skillsRequired: schema.jobs.skills_required,
          postedAt: schema.jobs.created_at
        })
        .from(schema.jobs)
        .leftJoin(schema.companies, eq(schema.jobs.company_id, schema.companies.id))
        .where(eq(schema.jobs.status, 'active'))
        .orderBy(desc(schema.jobs.created_at))
        .limit(10);
    }

    // Get upcoming interviews (mock data for now)
    const upcomingInterviews = [];

    // Get notifications (mock data for now)
    const notifications = [];

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        skills: user.skills ? JSON.parse(user.skills) : [],
        qualification: user.qualification,
        experienceYears: user.experience_years,
        resumeUrl: user.resume_url,
        profilePicture: user.profile_picture,
        linkedinUrl: user.linkedin_url,
        githubUrl: user.github_url,
        portfolioUrl: user.portfolio_url
      },
      stats: {
        applications: applicationStats[0],
        savedJobs: savedJobs.length,
        profileViews: 0, // TODO: Implement profile views tracking
        profileCompletion: calculateProfileCompletion(user)
      },
      recentApplications,
      savedJobs,
      recommendedJobs,
      upcomingInterviews,
      notifications: notifications.map(n => ({
        ...n,
        isRead: Boolean(n.is_read)
      }))
    });

  } catch (error) {
    console.error('Error fetching applicant dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recruiter dashboard data
export const getRecruiterDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile
    const userProfile = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    
    if (!userProfile.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userProfile[0];

    // Get company details if user has company_id
    let company = null;
    if (user.company_id) {
      const companyResult = await db.select().from(schema.companies).where(eq(schema.companies.id, user.company_id)).limit(1);
      company = companyResult.length ? companyResult[0] : null;
    }

    // Get job statistics
    const jobStats = await db
      .select({
        total: count(),
        active: sum(sql`CASE WHEN status = 'active' THEN 1 ELSE 0 END`),
        draft: sum(sql`CASE WHEN status = 'draft' THEN 1 ELSE 0 END`),
        closed: sum(sql`CASE WHEN status = 'closed' THEN 1 ELSE 0 END`)
      })
      .from(schema.jobs)
      .where(eq(schema.jobs.posted_by, userId));

    // Get application statistics for recruiter's jobs
    const applicationStats = await db
      .select({
        total: count(),
        pending: sum(sql`CASE WHEN applications.status = 'pending' THEN 1 ELSE 0 END`),
        reviewed: sum(sql`CASE WHEN applications.status = 'reviewed' THEN 1 ELSE 0 END`),
        shortlisted: sum(sql`CASE WHEN applications.status = 'shortlisted' THEN 1 ELSE 0 END`),
        rejected: sum(sql`CASE WHEN applications.status = 'rejected' THEN 1 ELSE 0 END`),
        hired: sum(sql`CASE WHEN applications.status = 'hired' THEN 1 ELSE 0 END`)
      })
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.job_id, schema.jobs.id))
      .where(eq(schema.jobs.posted_by, userId));

    // Get recent applications
    const recentApplications = await db
      .select({
        id: schema.applications.id,
        status: schema.applications.status,
        appliedAt: schema.applications.applied_at,
        jobTitle: schema.jobs.title,
        applicantName: schema.users.full_name,
        applicantEmail: schema.users.email,
        resumeUrl: schema.applications.resume_url
      })
      .from(schema.applications)
      .leftJoin(schema.jobs, eq(schema.applications.job_id, schema.jobs.id))
      .leftJoin(schema.users, eq(schema.applications.user_id, schema.users.id))
      .where(eq(schema.jobs.posted_by, userId))
      .orderBy(desc(schema.applications.applied_at))
      .limit(10);

    // Get active jobs
    const activeJobs = await db
      .select({
        id: schema.jobs.id,
        title: schema.jobs.title,
        location: schema.jobs.location,
        jobType: schema.jobs.job_type,
        applicationsCount: schema.jobs.applications_count,
        createdAt: schema.jobs.created_at,
        status: schema.jobs.status
      })
      .from(schema.jobs)
      .where(eq(schema.jobs.posted_by, userId))
      .orderBy(desc(schema.jobs.created_at))
      .limit(10);

    // Get upcoming interviews
    const upcomingInterviews = await db
      .select({
        id: schema.interviews.id,
        title: schema.interviews.title,
        scheduledAt: schema.interviews.scheduled_at,
        duration: schema.interviews.duration,
        type: schema.interviews.type,
        jobTitle: schema.jobs.title,
        applicantName: schema.users.full_name
      })
      .from(schema.interviews)
      .leftJoin(schema.jobs, eq(schema.interviews.job_id, schema.jobs.id))
      .leftJoin(schema.users, eq(schema.interviews.applicant_id, schema.users.id))
      .where(and(
        eq(schema.interviews.recruiter_id, userId),
        eq(schema.interviews.status, 'scheduled')
      ))
      .orderBy(asc(schema.interviews.scheduled_at))
      .limit(5);

    // Get company analytics (last 30 days)
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const companyAnalytics = company ? await db
      .select({
        date: schema.company_analytics.date,
        jobsPosted: schema.company_analytics.jobs_posted,
        applicationsReceived: schema.company_analytics.applications_received,
        profileViews: schema.company_analytics.profile_views
      })
      .from(schema.company_analytics)
      .where(and(
        eq(schema.company_analytics.company_id, company.id),
        sql`date >= ${thirtyDaysAgo}`
      ))
      .orderBy(asc(schema.company_analytics.date)) : [];

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        companyName: user.company_name,
        position: user.position,
        linkedinUrl: user.linkedin_url
      },
      company,
      stats: {
        jobs: jobStats[0],
        applications: applicationStats[0],
        interviews: upcomingInterviews.length
      },
      recentApplications,
      activeJobs,
      upcomingInterviews,
      analytics: companyAnalytics
    });

  } catch (error) {
    console.error('Error fetching recruiter dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    // Get overall system statistics
    const userStats = await db
      .select({
        total: count(),
        jobseekers: sum(sql`CASE WHEN role = 'jobseeker' THEN 1 ELSE 0 END`),
        employers: sum(sql`CASE WHEN role = 'employer' THEN 1 ELSE 0 END`),
        active: sum(sql`CASE WHEN status = 'active' THEN 1 ELSE 0 END`),
        inactive: sum(sql`CASE WHEN status = 'inactive' THEN 1 ELSE 0 END`)
      })
      .from(schema.users);

    const jobStats = await db
      .select({
        total: count(),
        active: sum(sql`CASE WHEN status = 'active' THEN 1 ELSE 0 END`),
        closed: sum(sql`CASE WHEN status = 'closed' THEN 1 ELSE 0 END`),
        draft: sum(sql`CASE WHEN status = 'draft' THEN 1 ELSE 0 END`)
      })
      .from(schema.jobs);

    const applicationStats = await db
      .select({
        total: count(),
        pending: sum(sql`CASE WHEN status = 'pending' THEN 1 ELSE 0 END`),
        hired: sum(sql`CASE WHEN status = 'hired' THEN 1 ELSE 0 END`)
      })
      .from(schema.applications);

    const companyStats = await db
      .select({
        total: count(),
        verified: sum(sql`CASE WHEN verified = true THEN 1 ELSE 0 END`)
      })
      .from(schema.companies);

    // Get recent users
    const recentUsers = await db
      .select({
        id: schema.users.id,
        fullName: schema.users.full_name,
        email: schema.users.email,
        role: schema.users.role,
        status: schema.users.status,
        createdAt: schema.users.created_at
      })
      .from(schema.users)
      .orderBy(desc(schema.users.created_at))
      .limit(10);

    // Get recent jobs
    const recentJobs = await db
      .select({
        id: schema.jobs.id,
        title: schema.jobs.title,
        companyName: schema.companies.name,
        location: schema.jobs.location,
        status: schema.jobs.status,
        applicationsCount: schema.jobs.applications_count,
        createdAt: schema.jobs.created_at
      })
      .from(schema.jobs)
      .leftJoin(schema.companies, eq(schema.jobs.company_id, schema.companies.id))
      .orderBy(desc(schema.jobs.created_at))
      .limit(10);

    // Get system activity logs
    const recentActivity = await db
      .select({
        id: schema.user_activity_logs.id,
        action: schema.user_activity_logs.action,
        userName: schema.users.full_name,
        createdAt: schema.user_activity_logs.created_at
      })
      .from(schema.user_activity_logs)
      .leftJoin(schema.users, eq(schema.user_activity_logs.user_id, schema.users.id))
      .orderBy(desc(schema.user_activity_logs.created_at))
      .limit(20);

    res.json({
      stats: {
        users: userStats[0],
        jobs: jobStats[0],
        applications: applicationStats[0],
        companies: companyStats[0]
      },
      recentUsers,
      recentJobs,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  const fields = [
    'full_name', 'email', 'phone', 'location', 'bio', 
    'skills', 'qualification', 'resume_url', 'linkedin_url'
  ];
  
  let completedFields = 0;
  fields.forEach(field => {
    if (user[field] && user[field].trim() !== '') {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / fields.length) * 100);
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // Check if preferences exist
    const existingPrefs = await db
      .select()
      .from(schema.user_preferences)
      .where(eq(schema.user_preferences.user_id, userId))
      .limit(1);

    if (existingPrefs.length > 0) {
      // Update existing preferences
      await db
        .update(schema.user_preferences)
        .set({
          ...preferences,
          updated_at: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(schema.user_preferences.user_id, userId));
    } else {
      // Create new preferences
      await db
        .insert(schema.user_preferences)
        .values({
          user_id: userId,
          ...preferences
        });
    }

    res.json({ message: 'Preferences updated successfully' });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await db
      .select()
      .from(schema.user_preferences)
      .where(eq(schema.user_preferences.user_id, userId))
      .limit(1);

    if (preferences.length === 0) {
      // Return default preferences
      return res.json({
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        jobAlerts: true,
        dashboardLayout: 'grid',
        timezone: 'Asia/Kolkata'
      });
    }

    res.json(preferences[0]);

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
