import { getRecommendedJobs, getRecommendationStats } from '../api/recommendations';
import { getJobAlerts, getJobMatches } from '../api/jobAlerts';
import { createNotification } from '../api/notifications';

class JobRecommendationService {
  constructor() {
    this.lastCheckTime = localStorage.getItem('lastJobCheckTime') || null;
    this.notificationsSent = JSON.parse(localStorage.getItem('jobNotificationsSent') || '[]');
  }

  // Main function to check for new job matches and send notifications
  async checkForNewJobMatches(userId) {
    try {
      console.log('🔍 Checking for new job matches for user:', userId);
      
      // Get user's job alerts and preferences
      const [alertsResponse, recommendationsResponse, matchesResponse] = await Promise.all([
        this.getJobAlerts(),
        this.getRecommendedJobs(),
        this.getJobMatches()
      ]);

      const alerts = alertsResponse.data || [];
      const recommendations = recommendationsResponse.data?.jobs || [];
      const matches = matchesResponse.data || [];

      console.log('📊 Job data fetched:', {
        alerts: alerts.length,
        recommendations: recommendations.length,
        matches: matches.length
      });

      // Process recommendations and send notifications
      await this.processRecommendations(userId, recommendations);
      
      // Process job alert matches
      await this.processJobAlertMatches(userId, alerts, matches);
      
      // Update last check time
      this.lastCheckTime = new Date().toISOString();
      localStorage.setItem('lastJobCheckTime', this.lastCheckTime);
      
      return {
        success: true,
        recommendations: recommendations.length,
        matches: matches.length,
        notificationsSent: this.notificationsSent.length
      };
      
    } catch (error) {
      console.error('❌ Error checking for job matches:', error);
      return { success: false, error: error.message };
    }
  }

  // Process job recommendations and send notifications
  async processRecommendations(userId, recommendations) {
    if (!recommendations || recommendations.length === 0) return;

    // Filter high-match jobs (>70% match)
    const highMatchJobs = recommendations.filter(job => 
      job.matchScore?.overall > 70 && 
      !this.notificationsSent.includes(job.id)
    );

    console.log('🎯 High-match jobs found:', highMatchJobs.length);

    // Send notifications for top 3 matches
    for (const job of highMatchJobs.slice(0, 3)) {
      await this.sendJobRecommendationNotification(userId, job);
    }
  }

  // Process job alert matches
  async processJobAlertMatches(userId, alerts, matches) {
    if (!alerts || !matches || alerts.length === 0 || matches.length === 0) return;

    const activeAlerts = alerts.filter(alert => alert.active);
    
    for (const alert of activeAlerts) {
      const matchingJobs = this.findMatchingJobs(alert, matches);
      
      if (matchingJobs.length > 0) {
        await this.sendJobAlertNotification(userId, alert, matchingJobs);
      }
    }
  }

  // Find jobs that match a specific alert
  findMatchingJobs(alert, jobs) {
    return jobs.filter(job => {
      // Check keywords match
      const keywordMatch = alert.keywords.some(keyword =>
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
      );

      // Check location match
      const locationMatch = alert.locations.length === 0 || 
        alert.locations.some(location =>
          job.location?.toLowerCase().includes(location.toLowerCase()) ||
          job.remote === true
        );

      // Check salary match (basic implementation)
      const salaryMatch = !alert.salary || 
        this.checkSalaryMatch(alert.salary, job.salary);

      return keywordMatch && locationMatch && salaryMatch && 
        !this.notificationsSent.includes(job.id);
    });
  }

  // Check if job salary matches alert criteria
  checkSalaryMatch(alertSalary, jobSalary) {
    if (!alertSalary || !jobSalary) return true;
    
    // Extract numbers from salary strings
    const alertAmount = this.extractSalaryAmount(alertSalary);
    const jobAmount = this.extractSalaryAmount(jobSalary);
    
    return jobAmount >= alertAmount;
  }

  // Extract salary amount from string
  extractSalaryAmount(salaryString) {
    const matches = salaryString.match(/\d+/g);
    return matches ? parseInt(matches[0]) * 1000 : 0; // Assume in thousands
  }

  // Send job recommendation notification
  async sendJobRecommendationNotification(userId, job) {
    try {
      const notification = {
        recipientId: userId,
        recipientType: 'applicant',
        type: 'job_match',
        title: 'Perfect Job Match Found! 🎯',
        message: `We found a ${job.matchScore.overall}% match: "${job.title}" at ${job.company}. This job matches your skills and preferences perfectly!`,
        data: {
          jobId: job.id,
          matchScore: job.matchScore.overall,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          actionUrl: `/jobs/${job.id}`,
          matchDetails: {
            skillsMatch: job.matchScore.skills?.matchPercentage || 0,
            locationMatch: job.matchScore.location || 0,
            experienceMatch: job.matchScore.experience || 0
          }
        },
        priority: 'high',
        channels: ['in_app', 'email']
      };

      await createNotification(notification);
      
      // Track sent notification
      this.notificationsSent.push(job.id);
      localStorage.setItem('jobNotificationsSent', JSON.stringify(this.notificationsSent));
      
      console.log('✅ Job recommendation notification sent for:', job.title);
      
    } catch (error) {
      console.error('❌ Error sending job recommendation notification:', error);
    }
  }

  // Send job alert notification
  async sendJobAlertNotification(userId, alert, matchingJobs) {
    try {
      const jobCount = matchingJobs.length;
      const topJob = matchingJobs[0];
      
      const notification = {
        recipientId: userId,
        recipientType: 'applicant',
        type: 'job_alert',
        title: `Job Alert: ${jobCount} New Match${jobCount > 1 ? 'es' : ''} Found! 🚨`,
        message: `Your "${alert.name}" alert found ${jobCount} new job${jobCount > 1 ? 's' : ''}. Top match: "${topJob.title}" at ${topJob.company}`,
        data: {
          alertId: alert.id,
          alertName: alert.name,
          jobCount: jobCount,
          topJobId: topJob.id,
          topJobTitle: topJob.title,
          topJobCompany: topJob.company,
          actionUrl: `/jobs?alert=${alert.id}`,
          allJobs: matchingJobs.slice(0, 5).map(job => ({
            id: job.id,
            title: job.title,
            company: job.company
          }))
        },
        priority: 'medium',
        channels: ['in_app', 'email']
      };

      await createNotification(notification);
      
      // Track sent notifications for all matching jobs
      matchingJobs.forEach(job => {
        if (!this.notificationsSent.includes(job.id)) {
          this.notificationsSent.push(job.id);
        }
      });
      localStorage.setItem('jobNotificationsSent', JSON.stringify(this.notificationsSent));
      
      console.log('✅ Job alert notification sent for:', alert.name, 'with', jobCount, 'matches');
      
    } catch (error) {
      console.error('❌ Error sending job alert notification:', error);
    }
  }

  // API wrapper methods with error handling
  async getJobAlerts() {
    try {
      return await getJobAlerts();
    } catch (error) {
      console.warn('⚠️ Job alerts API not available, using fallback');
      return { data: [] };
    }
  }

  async getRecommendedJobs() {
    try {
      return await getRecommendedJobs({ limit: 20, minMatchPercentage: 50 });
    } catch (error) {
      console.warn('⚠️ Recommendations API not available, using fallback');
      return { data: { jobs: [] } };
    }
  }

  async getJobMatches() {
    try {
      return await getJobMatches(20);
    } catch (error) {
      console.warn('⚠️ Job matches API not available, using fallback');
      return { data: [] };
    }
  }

  // Clear notification history (for testing)
  clearNotificationHistory() {
    this.notificationsSent = [];
    localStorage.removeItem('jobNotificationsSent');
    localStorage.removeItem('lastJobCheckTime');
    console.log('🧹 Job notification history cleared');
  }

  // Get notification statistics
  getNotificationStats() {
    return {
      lastCheckTime: this.lastCheckTime,
      notificationsSent: this.notificationsSent.length,
      notificationIds: this.notificationsSent
    };
  }
}

// Create singleton instance
const jobRecommendationService = new JobRecommendationService();

// Auto-check for job matches every 30 minutes
let autoCheckInterval = null;

export const startAutoJobMatching = (userId) => {
  if (autoCheckInterval) {
    clearInterval(autoCheckInterval);
  }
  
  // Initial check
  jobRecommendationService.checkForNewJobMatches(userId);
  
  // Set up periodic checks (every 30 minutes)
  autoCheckInterval = setInterval(() => {
    jobRecommendationService.checkForNewJobMatches(userId);
  }, 30 * 60 * 1000); // 30 minutes
  
  console.log('🔄 Auto job matching started for user:', userId);
};

export const stopAutoJobMatching = () => {
  if (autoCheckInterval) {
    clearInterval(autoCheckInterval);
    autoCheckInterval = null;
    console.log('⏹️ Auto job matching stopped');
  }
};

// Test function for manual checking
window.testJobMatching = async (userId) => {
  console.log('🧪 Testing job matching for user:', userId);
  const result = await jobRecommendationService.checkForNewJobMatches(userId);
  console.log('🧪 Test result:', result);
  alert(`Job matching test completed! Check console for details.\nRecommendations: ${result.recommendations}\nMatches: ${result.matches}`);
};

// Test function to clear notification history
window.clearJobNotifications = () => {
  jobRecommendationService.clearNotificationHistory();
  alert('Job notification history cleared!');
};

export default jobRecommendationService;
