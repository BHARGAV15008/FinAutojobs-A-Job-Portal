const realTimeService = require('../services/realTimeService');
const { db } = require('../config/database');
const { 
  users, userProfiles, applicantProfiles, companies, jobs, jobApplications,
  userActivities, notifications
} = require('../schemas');
const { eq, desc, count, and, gte, lte, sql } = require('drizzle-orm');

class DashboardController {
  // Get real-time dashboard data
  async getDashboard(req, res) {
    try {
      const { userId } = req.user;
      const { role } = req.user;

      // Get real-time metrics
      const metrics = await realTimeService.getDashboardMetrics(userId, role);

      // Track user activity
      await this.trackActivity(userId, 'dashboard_view', 'dashboard', null, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // Get applicant-specific dashboard
  async getApplicantDashboard(req, res) {
    try {
      const { userId } = req.user;

      const [
        profileData,
        applicationStats,
        recentJobs,
        upcomingInterviews,
        skillsProgress,
        notifications
      ] = await Promise.all([
        this.getApplicantProfileData(userId),
        this.getApplicantApplicationStats(userId),
        this.getRecentJobRecommendations(userId),
        this.getUpcomingInterviews(userId),
        this.getSkillsProgress(userId),
        this.getRecentNotifications(userId)
      ]);

      const dashboardData = {
        profile: profileData,
        applications: applicationStats,
        jobs: recentJobs,
        interviews: upcomingInterviews,
        skills: skillsProgress,
        notifications,
        lastUpdated: new Date().toISOString()
      };

      // Update real-time cache
      realTimeService.setCache(`applicant_dashboard_${userId}`, dashboardData);

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Applicant dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applicant dashboard',
        error: error.message
      });
    }
  }

  // Get recruiter-specific dashboard
  async getRecruiterDashboard(req, res) {
    try {
      const { userId } = req.user;

      const [
        jobStats,
        applicationStats,
        hiringMetrics,
        recentApplications,
        upcomingInterviews,
        performanceMetrics
      ] = await Promise.all([
        this.getRecruiterJobStats(userId),
        this.getRecruiterApplicationStats(userId),
        this.getHiringMetrics(userId),
        this.getRecentApplications(userId),
        this.getRecruiterUpcomingInterviews(userId),
        this.getRecruiterPerformanceMetrics(userId)
      ]);

      const dashboardData = {
        jobs: jobStats,
        applications: applicationStats,
        hiring: hiringMetrics,
        recentApplications,
        interviews: upcomingInterviews,
        performance: performanceMetrics,
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Recruiter dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recruiter dashboard',
        error: error.message
      });
    }
  }

  // Get admin dashboard with platform metrics
  async getAdminDashboard(req, res) {
    try {
      const [
        platformStats,
        userGrowth,
        jobMarketTrends,
        revenueMetrics,
        systemHealth,
        topPerformers
      ] = await Promise.all([
        this.getPlatformStats(),
        this.getUserGrowthStats(),
        this.getJobMarketTrends(),
        this.getRevenueMetrics(),
        this.getSystemHealth(),
        this.getTopPerformers()
      ]);

      const dashboardData = {
        platform: platformStats,
        growth: userGrowth,
        market: jobMarketTrends,
        revenue: revenueMetrics,
        system: systemHealth,
        topPerformers,
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin dashboard',
        error: error.message
      });
    }
  }

  // Real-time analytics endpoint
  async getAnalytics(req, res) {
    try {
      const { userId } = req.user;
      const { role } = req.user;
      const { timeRange = '30d', metric = 'all' } = req.query;

      let analytics = {};

      if (role === 'applicant') {
        analytics = await this.getApplicantAnalytics(userId, timeRange, metric);
      } else if (role === 'recruiter') {
        analytics = await this.getRecruiterAnalytics(userId, timeRange, metric);
      } else if (role === 'admin') {
        analytics = await this.getPlatformAnalytics(timeRange, metric);
      }

      res.json({
        success: true,
        data: analytics,
        timeRange,
        metric
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }

  // Helper methods for data fetching
  async getApplicantProfileData(userId) {
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

  async getApplicantApplicationStats(userId) {
    const stats = await db.select({
      total: count(),
      applied: sql`SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END)`,
      screening: sql`SUM(CASE WHEN status = 'screening' THEN 1 ELSE 0 END)`,
      shortlisted: sql`SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END)`,
      interviewed: sql`SUM(CASE WHEN status = 'interviewed' THEN 1 ELSE 0 END)`,
      offered: sql`SUM(CASE WHEN status = 'offer_extended' THEN 1 ELSE 0 END)`,
      hired: sql`SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END)`,
      rejected: sql`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`
    })
    .from(jobApplications)
    .where(eq(jobApplications.applicantId, userId));

    return stats[0] || {};
  }

  async getRecentJobRecommendations(userId, limit = 5) {
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

  async trackActivity(userId, action, entityType, entityId, metadata = {}) {
    try {
      await db.insert(userActivities).values({
        userId,
        action,
        entityType,
        entityId,
        metadata: JSON.stringify(metadata),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        timestamp: new Date()
      });

      // Emit real-time activity update
      realTimeService.emit('user_activity', {
        userId,
        action,
        entityType,
        entityId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // WebSocket connection handler for real-time updates
  handleWebSocketConnection(ws, userId) {
    console.log(`WebSocket connected for user: ${userId}`);

    // Subscribe to user-specific updates
    const unsubscribers = [
      realTimeService.subscribe('dashboard_updated', (data) => {
        if (data.userId === userId) {
          ws.send(JSON.stringify({
            type: 'dashboard_updated',
            data: data.metrics
          }));
        }
      }),

      realTimeService.subscribe('notification_created', (data) => {
        if (data.userId === userId) {
          ws.send(JSON.stringify({
            type: 'notification',
            data: data.notification
          }));
        }
      }),

      realTimeService.subscribe('application_updated', (data) => {
        if (data.applicantId === userId) {
          ws.send(JSON.stringify({
            type: 'application_updated',
            data: data.application
          }));
        }
      })
    ];

    // Handle WebSocket close
    ws.on('close', () => {
      console.log(`WebSocket disconnected for user: ${userId}`);
      unsubscribers.forEach(unsubscribe => unsubscribe());
    });

    // Send initial dashboard data
    realTimeService.getDashboardMetrics(userId, 'applicant')
      .then(metrics => {
        ws.send(JSON.stringify({
          type: 'initial_data',
          data: metrics
        }));
      })
      .catch(error => {
        console.error('Error sending initial data:', error);
      });
  }

  // Update profile completeness in real-time
  async updateProfileCompleteness(req, res) {
    try {
      const { userId } = req.user;
      
      // Calculate profile completeness
      const completeness = await this.calculateProfileCompleteness(userId);
      
      // Update in database
      await db.update(userProfiles)
        .set({ 
          profileCompleteness: completeness,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));

      // Emit real-time update
      realTimeService.emit('profile_updated', {
        userId,
        completeness
      });

      res.json({
        success: true,
        data: { completeness }
      });
    } catch (error) {
      console.error('Profile completeness update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile completeness',
        error: error.message
      });
    }
  }

  async calculateProfileCompleteness(userId) {
    // Implementation for calculating profile completeness percentage
    // This would check various profile fields and return a percentage
    return 75; // Placeholder
  }
}

module.exports = new DashboardController();
