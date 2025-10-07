import axios from 'axios';
import API_BASE_URL from '../services/apiConfig';

import API_BASE_URL from '../services/apiConfig';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Communications API functions
export const communicationsAPI = {
  // Send email to candidate
  sendEmail: async (emailData) => {
    try {
      console.log('📧 Sending email:', emailData);
      const response = await api.post('/communications/send-email', emailData);
      console.log('✅ Email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  },

  // Send SMS to candidate
  sendSMS: async (smsData) => {
    try {
      console.log('📱 Sending SMS:', smsData);
      const response = await api.post('/communications/send-sms', smsData);
      console.log('✅ SMS sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      throw new Error(error.response?.data?.message || 'Failed to send SMS');
    }
  },

  // Send WhatsApp message (if implemented)
  sendWhatsApp: async (whatsappData) => {
    try {
      console.log('💬 Sending WhatsApp message:', whatsappData);
      const response = await api.post('/communications/send-whatsapp', whatsappData);
      console.log('✅ WhatsApp message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send WhatsApp message');
    }
  }
};

export default communicationsAPI;
