# OTP Verification Setup Guide

## 🔧 Fixed Issues

The OTP verification system has been completely fixed and improved:

### ✅ What Was Fixed:
1. **Email Service**: Replaced Ethereal test service with real SMTP configuration
2. **SMS Service**: Implemented Twilio integration with fallback to mock service
3. **Better Error Handling**: Added comprehensive validation and error messages
4. **Code Organization**: Created dedicated OTP service with proper separation of concerns
5. **Environment Configuration**: Updated .env.example with all required settings

## 📧 Email OTP Setup

### For Production (Real Emails):
1. **Gmail Setup**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password  # Generate from Google Account settings
   EMAIL_FROM="FinAutoJobs" <no-reply@finautojobs.com>
   ```

2. **Other Email Providers**:
   ```env
   # Outlook/Hotmail
   EMAIL_HOST=smtp-mail.outlook.com
   EMAIL_PORT=587
   
   # Yahoo
   EMAIL_HOST=smtp.mail.yahoo.com
   EMAIL_PORT=587
   
   # Custom SMTP
   EMAIL_HOST=your-smtp-server.com
   EMAIL_PORT=587
   ```

### For Development (Test Emails):
- Leave `EMAIL_USER` and `EMAIL_PASS` empty
- System will automatically use Ethereal test service
- Check console for preview URLs

## 📱 SMS OTP Setup

### For Production (Real SMS):
1. **Create Twilio Account**: https://www.twilio.com/
2. **Get Credentials** from Twilio Console:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
   ```

3. **Install Twilio Package**:
   ```bash
   cd backend
   npm install twilio
   ```

### For Development (Mock SMS):
- Leave Twilio credentials empty
- System will log SMS to console
- Perfect for testing without real SMS costs

## 🚀 Quick Setup Steps

1. **Copy Environment File**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure Email** (choose one):
   - **Gmail**: Enable 2FA, generate app password, add to .env
   - **Development**: Leave EMAIL_USER and EMAIL_PASS empty

3. **Configure SMS** (optional):
   - **Twilio**: Add credentials to .env
   - **Development**: Leave Twilio settings empty

4. **Restart Backend**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Test Email OTP:
```bash
curl -X POST http://localhost:5002/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test SMS OTP:
```bash
curl -X POST http://localhost:5002/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

## 🔍 API Endpoints

### Send Email OTP
- **POST** `/api/auth/send-email-otp`
- **Body**: `{"email": "user@example.com"}`
- **Response**: `{"message": "OTP sent successfully", "success": true, "expiresIn": 300}`

### Verify Email OTP
- **POST** `/api/auth/verify-email-otp`
- **Body**: `{"email": "user@example.com", "otp": "123456"}`
- **Response**: `{"message": "Email verified successfully", "verified": true, "success": true}`

### Send SMS OTP
- **POST** `/api/auth/send-sms-otp`
- **Body**: `{"phone": "+1234567890"}`
- **Response**: `{"message": "OTP sent successfully", "success": true, "mock": false, "expiresIn": 300}`

### Verify SMS OTP
- **POST** `/api/auth/verify-sms-otp`
- **Body**: `{"phone": "+1234567890", "otp": "123456"}`
- **Response**: `{"message": "Phone verified successfully", "verified": true, "success": true}`

## 🛡️ Security Features

- **Rate Limiting**: Prevents spam requests
- **OTP Expiration**: 5-minute expiry time
- **Attempt Limiting**: Max 3 verification attempts
- **Input Validation**: Email and phone format validation
- **Secure Storage**: OTPs stored with expiration timestamps

## 🔧 Troubleshooting

### Email Issues:
- **Gmail**: Enable 2FA and use App Password, not regular password
- **SMTP Error**: Check host, port, and credentials
- **Firewall**: Ensure port 587 is open

### SMS Issues:
- **Twilio Error**: Verify Account SID, Auth Token, and phone number format
- **Phone Format**: Use international format with country code (+1234567890)
- **Twilio Balance**: Ensure account has sufficient balance

### General Issues:
- **Environment**: Restart server after .env changes
- **Console Logs**: Check server console for detailed error messages
- **Network**: Ensure internet connectivity for external services

## 📝 Notes

- **Development**: Both email and SMS work in mock mode without external services
- **Production**: Configure real services for actual email/SMS delivery
- **Cost**: Twilio charges per SMS, Gmail is free with limits
- **Security**: Never commit real credentials to version control
