# 📧📱 Communication Setup Guide

## Overview
The FinAutoJobs platform now supports real email and SMS communication between recruiters and applicants through the ContactModal interface.

## ✅ What's Implemented

### 🎯 **Frontend Features**
- **ContactModal Integration**: Send Email and Send Message buttons now work with real APIs
- **Email Sending**: Professional email templates with HTML formatting
- **SMS Sending**: Direct SMS messaging to applicant phone numbers
- **Error Handling**: Proper feedback for success/failure scenarios
- **Loading States**: User-friendly loading indicators during sending

### 🎯 **Backend Features**
- **Email API**: `/api/communication/send-email` - Send professional emails
- **SMS API**: `/api/communication/send-sms` - Send SMS messages
- **Test Endpoints**: Configuration testing for email and SMS services
- **Security**: Role-based access (only recruiters can send communications)
- **Logging**: Comprehensive logging for debugging and monitoring

## 🔧 Setup Instructions

### 1. **Install Required Packages**
```bash
cd backend
npm install nodemailer twilio --legacy-peer-deps
```

### 2. **Configure Environment Variables**
Copy `.env.example` to `.env` and configure:

#### **Email Configuration (Gmail)**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**To get Gmail App Password:**
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Use the generated password (not your regular Gmail password)

#### **SMS Configuration (Twilio)**
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**To get Twilio credentials:**
1. Sign up at https://www.twilio.com/
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number for sending SMS

### 3. **Test Configuration**
Use the test endpoints to verify setup:

```bash
# Test email configuration
GET /api/communication/test-email

# Test SMS configuration  
GET /api/communication/test-sms
```

## 📋 API Documentation

### **Send Email**
```http
POST /api/communication/send-email
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "to": "applicant@example.com",
  "subject": "Interview Invitation",
  "message": "Dear candidate, we would like to invite you for an interview...",
  "attachments": [],
  "scheduleSend": false,
  "scheduleDate": null
}
```

### **Send SMS**
```http
POST /api/communication/send-sms
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Hello! This is a message from FinAutoJobs recruiter.",
  "candidateName": "John Doe"
}
```

## 🎯 How It Works

### **Email Flow**
1. Recruiter clicks "Send Email" in ContactModal
2. Fills out email form with subject and message
3. Frontend calls `communicationAPI.sendEmail()`
4. Backend uses Nodemailer to send professional HTML email
5. Success/error feedback displayed to user

### **SMS Flow**
1. Recruiter clicks "Send Message" in ContactModal
2. Enters SMS message in prompt
3. Frontend calls `communicationAPI.sendSMS()`
4. Backend uses Twilio to send SMS to applicant's phone
5. Success/error feedback displayed to user

## 🔒 Security Features

- **Role-Based Access**: Only recruiters can send communications
- **JWT Authentication**: All endpoints require valid authentication
- **Input Validation**: Email and phone number format validation
- **Rate Limiting**: Prevents spam and abuse
- **Secure Headers**: Professional email formatting with platform branding

## 📧 Email Template

Emails are sent with professional HTML formatting:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <div style="text-align: center;">
    <h2 style="color: #2563eb;">FinAutoJobs</h2>
    <p style="color: #666;">Professional Communication Platform</p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px;">
    <h3>Message from Recruiter</h3>
    <div>{message content}</div>
  </div>
  
  <div style="text-align: center; color: #6b7280;">
    This email was sent through FinAutoJobs recruitment platform.
  </div>
</div>
```

## 📱 SMS Template

SMS messages are formatted with platform branding:

```
FinAutoJobs Recruitment Update:

{message content}

---
This message was sent by a recruiter through FinAutoJobs platform. Please check your email for detailed communication.
```

## 🚀 Usage Examples

### **Interview Invitation Email**
- **Subject**: "Interview Invitation - React Developer Position"
- **Message**: Professional interview details with date, time, format
- **Result**: Branded HTML email sent to applicant

### **Status Update SMS**
- **Message**: "Your application for React Developer has been shortlisted!"
- **Result**: Formatted SMS with platform branding

## ⚠️ Important Notes

1. **Gmail App Password**: Must use App Password, not regular Gmail password
2. **Twilio Trial**: Free tier has limitations, upgrade for production use
3. **Phone Format**: SMS requires proper international format (+1234567890)
4. **Error Handling**: All failures are logged and user-friendly messages shown
5. **Testing**: Use test endpoints to verify configuration before production

## 🎉 Benefits

- **Real Communication**: No more fake/simulated messaging
- **Professional Branding**: All communications branded with FinAutoJobs
- **User Experience**: Immediate feedback and proper error handling
- **Scalable**: Easy to extend with more communication channels
- **Secure**: Proper authentication and role-based access control

## 🔧 Troubleshooting

### **Email Issues**
- Verify Gmail App Password is correct
- Check if 2-Step Verification is enabled
- Test with `/api/communication/test-email`

### **SMS Issues**
- Verify Twilio credentials are correct
- Check phone number format (+country code)
- Test with `/api/communication/test-sms`

### **Frontend Issues**
- Check browser console for API errors
- Verify JWT token is valid
- Ensure user has recruiter role

---

**The communication system is now fully functional and ready for production use!** 🚀
