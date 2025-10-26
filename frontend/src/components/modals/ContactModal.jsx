import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { communicationsAPI } from '../../api/communications';
import { 
  XMarkIcon, 
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  PaperClipIcon,
  ClockIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const ContactModal = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onSendEmail,
  onOpenMessaging,
  currentUser 
}) => {
  const { darkMode } = useTheme();
  const [contactMode, setContactMode] = useState('selection'); // 'selection', 'email', 'messaging'
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: '',
    attachments: [],
    scheduleSend: false,
    scheduleDate: ''
  });
  const [messageData, setMessageData] = useState({
    message: '',
    template: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !candidate) return null;

  const emailTemplates = [
    {
      id: 'interview_invitation',
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {jobTitle} Position',
      content: `Dear {candidateName},

Thank you for your interest in the {jobTitle} position at our company. We were impressed with your application and would like to invite you for an interview.

Interview Details:
- Position: {jobTitle}
- Date: {interviewDate}
- Time: {interviewTime}
- Duration: Approximately 1 hour
- Format: {interviewFormat}

Please confirm your availability by replying to this email. If the proposed time doesn't work for you, please suggest alternative times.

We look forward to speaking with you.

Best regards,
{recruiterName}
{companyName}`
    },
    {
      id: 'follow_up',
      name: 'Follow-up',
      subject: 'Following up on your application - {jobTitle}',
      content: `Dear {candidateName},

I hope this email finds you well. I wanted to follow up on your application for the {jobTitle} position.

We have received your application and are currently reviewing all submissions. We will be in touch within the next few days with an update on the next steps.

Thank you for your patience and continued interest in our company.

Best regards,
{recruiterName}
{companyName}`
    },
    {
      id: 'rejection',
      name: 'Polite Rejection',
      subject: 'Update on your application - {jobTitle}',
      content: `Dear {candidateName},

Thank you for taking the time to apply for the {jobTitle} position and for your interest in our company.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs. This was a difficult decision as we received many qualified applications.

We encourage you to apply for future positions that match your skills and experience. We will keep your resume on file for future opportunities.

Thank you again for your interest in our company.

Best regards,
{recruiterName}
{companyName}`
    },
    {
      id: 'offer',
      name: 'Job Offer',
      subject: 'Job Offer - {jobTitle} Position',
      content: `Dear {candidateName},

Congratulations! We are pleased to offer you the position of {jobTitle} at {companyName}.

Offer Details:
- Position: {jobTitle}
- Start Date: {startDate}
- Salary: {salary}
- Benefits: {benefits}

Please review the attached offer letter for complete details. We would like to receive your response by {responseDeadline}.

We are excited about the possibility of you joining our team and look forward to your positive response.

Best regards,
{recruiterName}
{companyName}`
    }
  ];

  const handleTemplateSelect = (template) => {
    const populatedContent = template.content
      .replace(/{candidateName}/g, candidate.name)
      .replace(/{jobTitle}/g, candidate.appliedPosition || 'Software Developer')
      .replace(/{companyName}/g, 'FinAutoJobs')
      .replace(/{recruiterName}/g, 'Hiring Team');

    setEmailData({
      ...emailData,
      subject: template.subject
        .replace(/{candidateName}/g, candidate.name)
        .replace(/{jobTitle}/g, candidate.appliedPosition || 'Software Developer'),
      message: populatedContent,
      template: template.id
    });
  };

  const smsTemplates = [
    {
      id: 'interview_reminder',
      name: 'Interview Reminder',
      content: `Hi {candidateName}, this is a reminder about your interview for {jobTitle} position scheduled for {interviewDate} at {interviewTime}. Please confirm your attendance. - {companyName}`
    },
    {
      id: 'application_update',
      name: 'Application Update',
      content: `Hi {candidateName}, we have an update regarding your application for {jobTitle} position. Please check your email for details. - {companyName}`
    },
    {
      id: 'quick_followup',
      name: 'Quick Follow-up',
      content: `Hi {candidateName}, thank you for your interest in {jobTitle} position. We will get back to you soon. - {companyName}`
    }
  ];

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      await communicationsAPI.sendEmail({
        to: candidate.email,
        subject: emailData.subject,
        message: emailData.message,
        recruiterEmail: currentUser?.email,
        recruiterName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser?.name
      });
      
      alert('✅ Email sent successfully!');
      
      // Reset form and close modal
      setEmailData({
        subject: '',
        message: '',
        template: '',
        attachments: [],
        scheduleSend: false,
        scheduleDate: ''
      });
      setContactMode('selection');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      await communicationsAPI.sendSMS({
        to: candidate.phone,
        message: messageData.message,
        recruiterPhone: currentUser?.phone,
        recruiterName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser?.name
      });
      alert('✅ Message sent successfully!');
      setMessageData({ message: '', template: '' });
      setContactMode('selection');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessaging = () => {
    onOpenMessaging(candidate);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl rounded-lg sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-3 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Contact {candidate.name}
                    </h2>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {candidate.email} • {candidate.currentRole}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {contactMode === 'selection' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold text-center ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Choose Communication Method
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setContactMode('email')}
                      className={`p-8 rounded-xl border-2 border-dashed transition-all ${
                        darkMode 
                          ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <EnvelopeIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className={`text-xl font-semibold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Send Email
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Compose and send professional emails with templates, attachments, and scheduling options.
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                          <span className="flex items-center space-x-1">
                            <DocumentIcon className="w-4 h-4" />
                            <span>Templates</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <PaperClipIcon className="w-4 h-4" />
                            <span>Attachments</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>Schedule</span>
                          </span>
                        </div>
                      </div>
                    </motion.button>

                    {/* SMS/Message Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setContactMode('messaging')}
                      className={`p-8 rounded-xl border-2 border-dashed transition-all ${
                        darkMode 
                          ? 'border-gray-600 hover:border-green-500 hover:bg-gray-700' 
                          : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                          <DevicePhoneMobileIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className={`text-xl font-semibold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Send Message
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Send SMS directly to candidate's mobile number with quick templates and instant delivery.
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                          <span className="flex items-center space-x-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Instant</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DocumentIcon className="w-4 h-4" />
                            <span>Templates</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DevicePhoneMobileIcon className="w-4 h-4" />
                            <span>SMS</span>
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              )}

              {contactMode === 'email' && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Back Button */}
                  <button
                    onClick={() => setContactMode('selection')}
                    className={`text-sm flex items-center space-x-2 ${
                      darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>←</span>
                    <span>Back to selection</span>
                  </button>

                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Compose Email
                  </h3>

                  {/* Email Templates */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Templates
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {emailTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-3 text-sm rounded-lg border transition-colors ${
                            emailData.template === template.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : darkMode
                              ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Form */}
                  <div className="space-y-4">
                    {/* To Field */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        To
                      </label>
                      <input
                        type="email"
                        value={candidate.email}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-300' 
                            : 'border-gray-300 bg-gray-100 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Subject
                      </label>
                      <input
                        type="text"
                        value={emailData.subject}
                        onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                        placeholder="Enter email subject..."
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Message
                      </label>
                      <textarea
                        value={emailData.message}
                        onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                        placeholder="Compose your message..."
                        rows={12}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* Schedule Send Option */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="scheduleSend"
                        checked={emailData.scheduleSend}
                        onChange={(e) => setEmailData({...emailData, scheduleSend: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="scheduleSend" className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Schedule send
                      </label>
                      {emailData.scheduleSend && (
                        <input
                          type="datetime-local"
                          value={emailData.scheduleDate}
                          onChange={(e) => setEmailData({...emailData, scheduleDate: e.target.value})}
                          className={`px-3 py-1 rounded border ${
                            darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setContactMode('selection')}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={loading || !emailData.subject || !emailData.message}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span>{loading ? 'Sending...' : 'Send Email'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
