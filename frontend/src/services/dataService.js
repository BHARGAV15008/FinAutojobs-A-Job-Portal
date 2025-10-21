class DataService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.dbType = 'mongodb'; // Ensure we're using MongoDB exclusively
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // User Applications
  async getUserApplications() {
    try {
      const data = await this.apiCall('/applications/my-applications');
      return data.success ? data.applications || [] : [];
    } catch (error) {
      console.warn('Failed to fetch user applications, returning empty array');
      return [];
    }
  }

  // Job Recommendations
  async getJobRecommendations(limit = 10) {
    try {
      const data = await this.apiCall(`/jobs/recommended?limit=${limit}`);
      return data.success ? data.jobs || [] : [];
    } catch (error) {
      console.warn('Failed to fetch job recommendations, returning empty array');
      return [];
    }
  }

  // User Notifications
  async getUserNotifications() {
    try {
      const data = await this.apiCall('/notifications');
      return data.success ? data.notifications || [] : [];
    } catch (error) {
      console.warn('Failed to fetch notifications, returning empty array');
      return [];
    }
  }

  // User Analytics
  async getUserAnalytics(timeRange = '30d') {
    try {
      const data = await this.apiCall(`/analytics/user?timeRange=${timeRange}`);
      return data.success ? data.analytics || {} : {};
    } catch (error) {
      console.warn('Failed to fetch user analytics, returning empty object');
      return {};
    }
  }

  // Job Analytics
  async getJobAnalytics(jobId, timeRange = '30d') {
    try {
      const data = await this.apiCall(`/analytics/job/${jobId}?timeRange=${timeRange}`);
      return data.success ? data.analytics || {} : {};
    } catch (error) {
      console.warn('Failed to fetch job analytics, returning empty object');
      return {};
    }
  }

  // Company Analytics (for recruiters)
  async getCompanyAnalytics(timeRange = '30d') {
    try {
      const data = await this.apiCall(`/analytics/company?timeRange=${timeRange}`);
      return data.success ? data.analytics || {} : {};
    } catch (error) {
      console.warn('Failed to fetch company analytics, returning empty object');
      return {};
    }
  }

  // Platform Analytics (for admins)
  async getPlatformAnalytics(timeRange = '30d') {
    try {
      const data = await this.apiCall(`/analytics/platform?timeRange=${timeRange}`);
      return data.success ? data.analytics || {} : {};
    } catch (error) {
      console.warn('Failed to fetch platform analytics, returning empty object');
      return {};
    }
  }

  // User Profile Data
  async getUserProfile() {
    try {
      const data = await this.apiCall('/profile');
      return data.success ? data.profile || {} : {};
    } catch (error) {
      console.warn('Failed to fetch user profile, returning empty object');
      return {};
    }
  }

  // User Skills
  async getUserSkills() {
    try {
      const data = await this.apiCall('/profile/skills');
      return data.success ? data.skills || [] : [];
    } catch (error) {
      console.warn('Failed to fetch user skills, returning empty array');
      return [];
    }
  }

  // User Education
  async getUserEducation() {
    try {
      const data = await this.apiCall('/profile/education');
      return data.success ? data.education || [] : [];
    } catch (error) {
      console.warn('Failed to fetch user education, returning empty array');
      return [];
    }
  }

  // User Work Experience
  async getUserExperience() {
    try {
      const data = await this.apiCall('/profile/experience');
      return data.success ? data.experience || [] : [];
    } catch (error) {
      console.warn('Failed to fetch user experience, returning empty array');
      return [];
    }
  }

  // User Certifications
  async getUserCertifications() {
    try {
      const data = await this.apiCall('/profile/certifications');
      return data.success ? data.certifications || [] : [];
    } catch (error) {
      console.warn('Failed to fetch user certifications, returning empty array');
      return [];
    }
  }

  // User Projects
  async getUserProjects() {
    try {
      const data = await this.apiCall('/profile/projects');
      return data.success ? data.projects || [] : [];
    } catch (error) {
      console.warn('Failed to fetch user projects, returning empty array');
      return [];
    }
  }

  // Job Bookmarks
  async getJobBookmarks() {
    try {
      const data = await this.apiCall('/jobs/bookmarks');
      return data.success ? data.bookmarks || [] : [];
    } catch (error) {
      console.warn('Failed to fetch job bookmarks, returning empty array');
      return [];
    }
  }

  // Job Alerts
  async getJobAlerts() {
    try {
      const data = await this.apiCall('/job-alerts');
      return data.success ? data.alerts || [] : [];
    } catch (error) {
      console.warn('Failed to fetch job alerts, returning empty array');
      return [];
    }
  }

  // Interview Schedules
  async getInterviewSchedules() {
    try {
      const data = await this.apiCall('/interviews/my-interviews');
      return data.success ? data.interviews || [] : [];
    } catch (error) {
      console.warn('Failed to fetch interview schedules, returning empty array');
      return [];
    }
  }

  // Messages/Conversations
  async getConversations() {
    try {
      const data = await this.apiCall('/messages/conversations');
      return data.success ? data.conversations || [] : [];
    } catch (error) {
      console.warn('Failed to fetch conversations, returning empty array');
      return [];
    }
  }

  // Company Data (for recruiters)
  async getCompanyData() {
    try {
      const data = await this.apiCall('/company/profile');
      return data.success ? data.company || {} : {};
    } catch (error) {
      console.warn('Failed to fetch company data, returning empty object');
      return {};
    }
  }

  // Company Jobs (for recruiters)
  async getCompanyJobs() {
    try {
      const data = await this.apiCall('/company/jobs');
      return data.success ? data.jobs || [] : [];
    } catch (error) {
      console.warn('Failed to fetch company jobs, returning empty array');
      return [];
    }
  }

  // Admin Users (for admin)
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const data = await this.apiCall(`/admin/users?${params}`);
      return data.success ? data.users || [] : [];
    } catch (error) {
      console.warn('Failed to fetch users, returning empty array');
      return [];
    }
  }

  // Admin Companies (for admin)
  async getCompanies(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const data = await this.apiCall(`/admin/companies?${params}`);
      return data.success ? data.companies || [] : [];
    } catch (error) {
      console.warn('Failed to fetch companies, returning empty array');
      return [];
    }
  }

  // Admin Jobs (for admin)
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const data = await this.apiCall(`/admin/jobs?${params}`);
      return data.success ? data.jobs || [] : [];
    } catch (error) {
      console.warn('Failed to fetch jobs, returning empty array');
      return [];
    }
  }

  // Moderation Items (for admin)
  async getModerationItems(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const data = await this.apiCall(`/admin/moderation?${params}`);
      return data.success ? data.items || [] : [];
    } catch (error) {
      console.warn('Failed to fetch moderation items, returning empty array');
      return [];
    }
  }

  // Search Jobs
  async searchJobs(query, filters = {}) {
    try {
      const params = new URLSearchParams({ query, ...filters }).toString();
      const data = await this.apiCall(`/jobs/search?${params}`);
      return data.success ? data.jobs || [] : [];
    } catch (error) {
      console.warn('Failed to search jobs, returning empty array');
      return [];
    }
  }

  // Search Companies
  async searchCompanies(query, filters = {}) {
    try {
      const params = new URLSearchParams({ query, ...filters }).toString();
      const data = await this.apiCall(`/companies/search?${params}`);
      return data.success ? data.companies || [] : [];
    } catch (error) {
      console.warn('Failed to search companies, returning empty array');
      return [];
    }
  }

  // Get Salary Insights
  async getSalaryInsights(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const data = await this.apiCall(`/salary/insights?${params}`);
      return data.success ? data.insights || {} : {};
    } catch (error) {
      console.warn('Failed to fetch salary insights, returning empty object');
      return {};
    }
  }

  // Get Skills Assessment Data
  async getSkillsAssessments() {
    try {
      const data = await this.apiCall('/assessments/skills');
      return data.success ? data.assessments || [] : [];
    } catch (error) {
      console.warn('Failed to fetch skills assessments, returning empty array');
      return [];
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Get current user info
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Clear all data (logout)
  clearData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
