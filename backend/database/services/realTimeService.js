const { db } = require('../config/database');
const { 
  users, userProfiles, applicantProfiles, companies, jobs, jobApplications,
  userActivities, jobAnalytics, companyAnalytics, userAnalytics, platformAnalytics,
  notifications, messages
} = require('../schemas');
const { eq, desc, count, sum, avg, and, or, gte, lte, sql } = require('drizzle-orm');

class RealTimeDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.subscribers = new Map();
  }

  // Subscribe to real-time updates
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);
    
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  // Emit real-time updates
  emit(eventType, data) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time callback:', error);
        }
      });
    }
  }

  // Cache management
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Real-time dashboard metrics
  async getDashboardMetrics(userId, userRole) {
    const cacheKey = `dashboard_${userId}_${userRole}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    let metrics = {};

    try {
      if (userRole === 'applicant') {
        metrics = await this.getApplicantMetrics(userId);
      } else if (userRole === 'recruiter') {
        metrics = await this.getRecruiterMetrics(userId);
      } else if (userRole === 'admin') {
        metrics = await this.getAdminMetrics();
      }

      this.setCache(cacheKey, metrics);
      this.emit('dashboard_updated', { userId, metrics });
      
      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  // Applicant dashboard metrics
  async getApplicantMetrics(userId) {
    const [
      profileData,
      applicationStats,
      recentActivities,
      jobRecommendations,
      interviewStats,
      skillsProgress
    ] = await Promise.all([
      this.getApplicantProfile(userId),
      this.getApplicationStats(userId),
      this.getRecentActivities(userId, 10),
      this.getJobRecommendations(userId, 5),
      this.getInterviewStats(userId),
      this.getSkillsProgress(userId)
    ]);

    return {
      profile: profileData,
      applications: applicationStats,
      activities: recentActivities,
      recommendations: jobRecommendations,
      interviews: interviewStats,
      skills: skillsProgress,
      lastUpdated: new Date().toISOString()
    };
  }

  // Recruiter dashboard metrics
  async getRecruiterMetrics(userId) {
    const recruiterProfile = await db.select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, userId))
      .limit(1);

    if (!recruiterProfile.length) {
      throw new Error('Recruiter profile not found');
    }

    const companyId = recruiterProfile[0].companyId;

    const [
      jobStats,
      applicationStats,
      hiringMetrics,
      recentApplications,
      interviewSchedule,
      performanceMetrics
    ] = await Promise.all([
      this.getRecruiterJobStats(userId),
      this.getRecruiterApplicationStats(userId),
      this.getHiringMetrics(companyId),
      this.getRecentApplications(userId, 10),
      this.getUpcomingInterviews(userId, 5),
      this.getRecruiterPerformance(userId)
    ]);

    return {
      jobs: jobStats,
      applications: applicationStats,
      hiring: hiringMetrics,
      recentApplications,
      interviews: interviewSchedule,
      performance: performanceMetrics,
      lastUpdated: new Date().toISOString()
    };
  }

  // Admin dashboard metrics
  async getAdminMetrics() {
    const [
      platformStats,
      userGrowth,
      jobMarketTrends,
      revenueMetrics,
      systemHealth
    ] = await Promise.all([
      this.getPlatformStats(),
      this.getUserGrowthStats(),
      this.getJobMarketTrends(),
      this.getRevenueMetrics(),
      this.getSystemHealth()
    ]);

    return {
      platform: platformStats,
      growth: userGrowth,
      market: jobMarketTrends,
      revenue: revenueMetrics,
      system: systemHealth,
      lastUpdated: new Date().toISOString()
    };
  }

  // Detailed metric methods
  async getApplicantProfile(userId) {
    const profile = await db.select({
      id: users.id,
      email: users.email,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      avatar: userProfiles.avatar,
      profileCompleteness: userProfiles.profileCompleteness,
      currentJobTitle: applicantProfiles.currentJobTitle,
      experienceYears: applicantProfiles.experienceYears,
      expectedSalary: applicantProfiles.expectedSalary,
      isActivelyLooking: applicantProfiles.isActivelyLooking,
      profileViews: applicantProfiles.profileViews,
      profileScore: applicantProfiles.profileScore
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(applicantProfiles, eq(users.id, applicantProfiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

    return profile[0] || null;
  }

  async getApplicationStats(userId) {
    const stats = await db.select({
      total: count(),
      applied: sum(sql`CASE WHEN status = 'applied' THEN 1 ELSE 0 END`),
      screening: sum(sql`CASE WHEN status = 'screening' THEN 1 ELSE 0 END`),
      shortlisted: sum(sql`CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END`),
      interviewed: sum(sql`CASE WHEN status = 'interviewed' THEN 1 ELSE 0 END`),
      offered: sum(sql`CASE WHEN status = 'offer_extended' THEN 1 ELSE 0 END`),
      hired: sum(sql`CASE WHEN status = 'hired' THEN 1 ELSE 0 END`),
      rejected: sum(sql`CASE WHEN status = 'rejected' THEN 1 ELSE 0 END`)
    })
    .from(jobApplications)
    .where(eq(jobApplications.applicantId, userId));

    return stats[0] || {};
  }

  async getRecentActivities(userId, limit = 10) {
    return await db.select({
      id: userActivities.id,
      action: userActivities.action,
      entityType: userActivities.entityType,
      entityId: userActivities.entityId,
      metadata: userActivities.metadata,
      timestamp: userActivities.timestamp
    })
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .orderBy(desc(userActivities.timestamp))
    .limit(limit);
  }

  async getJobRecommendations(userId, limit = 5) {
    // This would typically use ML algorithms, for now we'll get recent jobs
    return await db.select({
      id: jobs.id,
      title: jobs.title,
      company: companies.name,
      location: jobs.location,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      jobType: jobs.jobType,
      workMode: jobs.workMode,
      publishedAt: jobs.publishedAt
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.status, 'published'))
    .orderBy(desc(jobs.publishedAt))
    .limit(limit);
  }

  async getInterviewStats(userId) {
    const stats = await db.select({
      total: count(),
      scheduled: sum(sql`CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END`),
      completed: sum(sql`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`),
      cancelled: sum(sql`CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END`),
      avgRating: avg(interviewSchedules.rating)
    })
    .from(interviewSchedules)
    .where(eq(interviewSchedules.applicantId, userId));

    return stats[0] || {};
  }

  async getSkillsProgress(userId) {
    return await db.select({
      name: skills.name,
      category: skills.category,
      proficiencyLevel: skills.proficiencyLevel,
      isVerified: skills.isVerified,
      verificationScore: skills.verificationScore
    })
    .from(skills)
    .where(eq(skills.userId, userId))
    .orderBy(desc(skills.proficiencyLevel));
  }

  async getPlatformStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const [totalUsers, totalJobs, totalApplications, totalCompanies] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(jobs),
      db.select({ count: count() }).from(jobApplications),
      db.select({ count: count() }).from(companies)
    ]);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalJobs: totalJobs[0]?.count || 0,
      totalApplications: totalApplications[0]?.count || 0,
      totalCompanies: totalCompanies[0]?.count || 0
    };
  }

  // Real-time notification system
  async createNotification(notificationData) {
    try {
      const [notification] = await db.insert(notifications)
        .values({
          ...notificationData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Emit real-time notification
      this.emit('notification_created', {
        userId: notification.userId,
        notification
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Real-time job application tracking
  async updateApplicationStatus(applicationId, newStatus, metadata = {}) {
    try {
      const [updatedApplication] = await db.update(jobApplications)
        .set({
          status: newStatus,
          lastStatusChange: new Date(),
          updatedAt: new Date(),
          ...metadata
        })
        .where(eq(jobApplications.id, applicationId))
        .returning();

      // Create notification for applicant
      await this.createNotification({
        userId: updatedApplication.applicantId,
        type: 'application_update',
        category: 'application',
        title: 'Application Status Updated',
        message: `Your application status has been updated to: ${newStatus}`,
        entityType: 'application',
        entityId: applicationId,
        priority: 'normal'
      });

      // Emit real-time update
      this.emit('application_updated', {
        applicationId,
        applicantId: updatedApplication.applicantId,
        status: newStatus,
        application: updatedApplication
      });

      return updatedApplication;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Real-time analytics updates
  async updateJobAnalytics(jobId, analyticsData) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [existingAnalytics] = await db.select()
        .from(jobAnalytics)
        .where(and(
          eq(jobAnalytics.jobId, jobId),
          eq(jobAnalytics.date, today)
        ))
        .limit(1);

      let analytics;
      if (existingAnalytics) {
        [analytics] = await db.update(jobAnalytics)
          .set({
            ...analyticsData,
            updatedAt: new Date()
          })
          .where(eq(jobAnalytics.id, existingAnalytics.id))
          .returning();
      } else {
        [analytics] = await db.insert(jobAnalytics)
          .values({
            jobId,
            date: today,
            ...analyticsData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }

      // Emit real-time analytics update
      this.emit('job_analytics_updated', {
        jobId,
        analytics
      });

      return analytics;
    } catch (error) {
      console.error('Error updating job analytics:', error);
      throw error;
    }
  }

  // Clean up old cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Start periodic cache cleanup
  startCacheCleanup() {
    setInterval(() => {
      this.cleanupCache();
    }, this.cacheTimeout);
  }
}

// Create singleton instance
const realTimeService = new RealTimeDataService();
realTimeService.startCacheCleanup();

module.exports = realTimeService;
