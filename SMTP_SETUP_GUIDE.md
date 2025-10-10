# 📧 SMTP Service Setup Guide

## 🚀 Recommended: Resend.com (5 minutes setup)

### Step 1: Sign Up
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### Step 2: Get API Key
1. Go to Dashboard → API Keys
2. Click "Create API Key"
3. Name it "FinAutoJobs"
4. Copy the API key (starts with `re_`)

### Step 3: Update Render Environment
In your Render backend service, update these variables:
```
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=resend
EMAIL_PASS=re_YourAPIKeyHere
EMAIL_FROM_ADDRESS=noreply@finautojobs.com
EMAIL_FROM_NAME=FinAutoJobs
```

### Step 4: Test
Your OTP emails should now work perfectly!

---

## 🔄 Alternative Options

### Option 2: Brevo (Sendinblue)
- **Free**: 300 emails/day
- **Setup**: [sendinblue.com](https://sendinblue.com)
- **Config**:
  ```
  EMAIL_HOST=smtp-relay.brevo.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-smtp-key
  ```

### Option 3: Mailgun
- **Free**: 5,000 emails/month (3 months)
- **Setup**: [mailgun.com](https://mailgun.com)
- **Config**:
  ```
  EMAIL_HOST=smtp.mailgun.org
  EMAIL_PORT=587
  EMAIL_USER=postmaster@sandbox-xxx.mailgun.org
  EMAIL_PASS=your-password
  ```

### Option 4: Postmark
- **Free**: 100 emails/month
- **Setup**: [postmarkapp.com](https://postmarkapp.com)
- **Config**:
  ```
  EMAIL_HOST=smtp.postmarkapp.com
  EMAIL_PORT=587
  EMAIL_USER=your-server-token
  EMAIL_PASS=your-server-token
  ```

---

## ✅ Why These Work Better Than Gmail

1. **No SMTP blocks** on hosting platforms
2. **Higher delivery rates** (99%+ vs Gmail's 85%)
3. **No app password hassles**
4. **Built for transactional emails**
5. **Better error handling**
6. **Professional sender reputation**

---

## 🎯 Recommendation

**Use Resend.com** - it's specifically designed for developers and works perfectly with hosting platforms like Render.com.

After setup, your users will receive OTP emails instantly and reliably!
