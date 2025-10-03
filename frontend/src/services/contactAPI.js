// Contact API service for FinAutoJobs
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ContactAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/contact`;
  }

  // Get authorization headers
  getAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Send internal message through platform
  async sendMessage({ token, receiverId, subject, message, messageType = 'contact', priority = 'normal', relatedJobId, relatedApplicationId }) {
    try {
      const response = await fetch(`${this.baseURL}/send-message`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify({
          receiverId,
          subject,
          message,
          messageType,
          priority,
          relatedJobId,
          relatedApplicationId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send email through platform (recruiter to applicant)
  async sendEmail({ token, receiverId, subject, message, emailType = 'general', relatedJobId, relatedApplicationId }) {
    try {
      const response = await fetch(`${this.baseURL}/send-email`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify({
          receiverId,
          subject,
          message,
          emailType,
          relatedJobId,
          relatedApplicationId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send bulk message to multiple recipients
  async sendBulkMessage({ token, receiverIds, subject, message, messageType = 'bulk', priority = 'normal' }) {
    try {
      const response = await fetch(`${this.baseURL}/bulk-message`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify({
          receiverIds,
          subject,
          message,
          messageType,
          priority
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send bulk message');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error sending bulk message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get email templates
  async getTemplates(token) {
    try {
      const response = await fetch(`${this.baseURL}/templates`, {
        method: 'GET',
        headers: this.getAuthHeaders(token)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch templates');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Contact candidate (unified method)
  async contactCandidate({ token, candidate, subject, message, contactType = 'message', relatedJobId, relatedApplicationId }) {
    const receiverId = candidate.id || candidate._id;
    
    if (contactType === 'email') {
      return this.sendEmail({
        token,
        receiverId,
        subject,
        message,
        emailType: 'recruiter_to_applicant',
        relatedJobId,
        relatedApplicationId
      });
    } else {
      return this.sendMessage({
        token,
        receiverId,
        subject,
        message,
        messageType: 'contact',
        relatedJobId,
        relatedApplicationId
      });
    }
  }

  // Contact multiple candidates
  async contactMultipleCandidates({ token, candidates, subject, message, contactType = 'message' }) {
    const receiverIds = candidates.map(candidate => candidate.id || candidate._id);
    
    if (contactType === 'email') {
      // For email, we need to send individual emails
      const results = await Promise.allSettled(
        candidates.map(candidate => 
          this.sendEmail({
            token,
            receiverId: candidate.id || candidate._id,
            subject,
            message,
            emailType: 'bulk_recruiter_to_applicant'
          })
        )
      );
      
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failed = results.length - successful;
      
      return {
        success: successful > 0,
        data: {
          total: results.length,
          successful,
          failed,
          results
        },
        message: `Sent ${successful} emails successfully${failed > 0 ? `, ${failed} failed` : ''}`
      };
    } else {
      return this.sendBulkMessage({
        token,
        receiverIds,
        subject,
        message,
        messageType: 'bulk_contact'
      });
    }
  }
}

// Create and export singleton instance
const contactAPI = new ContactAPI();

export default contactAPI;

// Named exports for specific functions
export const {
  sendMessage,
  sendEmail,
  sendBulkMessage,
  getTemplates,
  contactCandidate,
  contactMultipleCandidates
} = contactAPI;
