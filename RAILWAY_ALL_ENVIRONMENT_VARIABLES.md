# 🔑 Complete Environment Variables for Railway

## 📋 **ALL ENVIRONMENT VARIABLES WITH VALUES**

### **🚨 IMPORTANT: Replace Example Values with Your Real Credentials**

---

## **1. Essential Variables (Required)**

```env
NODE_ENV=production
PORT=5000
```

---

## **2. Database Configuration**

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority
DATABASE_URL=mongodb+srv://your_username:your_password@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority
MONGO_URL=mongodb+srv://your_username:your_password@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Database → Connect → Connect your application
3. Copy connection string and replace `<username>`, `<password>`, `<database>`

---

## **3. JWT & Security Secrets**

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
SESSION_SECRET=x9y8z7a6b5c4d3e2f1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v5w4x3y2z1a0b9c8d7e6f5g4h3i2j1k0
CORS_ORIGIN=https://your-app-name.railway.app
```

**Generate JWT & Session Secrets:**
```bash
# Run this command to generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Run this command to generate SESSION_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## **4. Email Configuration (Gmail)**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=your_email@gmail.com
EMAIL_SERVICE=gmail
```

**How to get Gmail App Password:**
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Security → 2-Step Verification → App passwords
3. Generate app password for "Mail"
4. Use the 16-character password (not your regular Gmail password)

---

## **5. SMS Service (Twilio)**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get Twilio credentials:**
1. Sign up at [Twilio](https://www.twilio.com)
2. Dashboard → Account Info → Account SID & Auth Token
3. Phone Numbers → Manage → Active numbers

---

## **6. OAuth Configuration (Google)**

```env
GOOGLE_CLIENT_ID=your_google_client_id_from_console
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_console
GOOGLE_CALLBACK_URL=https://your-app-name.railway.app/auth/google/callback
```

**How to get Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Set authorized redirect URI: `https://your-app-name.railway.app/auth/google/callback`

---

## **7. OAuth Configuration (Microsoft)**

```env
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_CALLBACK_URL=https://your-app-name.railway.app/auth/microsoft/callback
```

---

## **8. File Upload & Storage**

```env
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

---

## **9. Rate Limiting & Security**

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12
```

---

## **10. Development/Debug (Optional)**

```env
DEBUG=app:*
LOG_LEVEL=info
ENABLE_LOGGING=true
```

---

## **11. Firebase Configuration (Optional)**

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

---

## **🚀 Quick Setup for Railway**

### **Minimal Required Variables (Start with these):**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority
JWT_SECRET=your_generated_64_character_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
SESSION_SECRET=your_generated_32_character_secret
CORS_ORIGIN=https://your-app-name.railway.app
```

### **Add to Railway Dashboard:**

1. Go to [railway.app](https://railway.app)
2. Your Project → Service → **Variables** tab
3. Click **"New Variable"** for each one
4. Copy **Name** and **Value** from above
5. Replace example values with your real credentials

---

## **🔐 Security Notes**

- ✅ **Never commit** these values to Git
- ✅ **Use strong passwords** and secrets
- ✅ **Enable 2FA** on all accounts
- ✅ **Rotate secrets** regularly
- ✅ **Use app passwords** for Gmail (not regular password)
- ✅ **Whitelist Railway IPs** in MongoDB Atlas

---

## **📱 Testing Your Setup**

After adding variables, your Railway app should show:
```
✅ Database connected successfully to MongoDB Atlas
✅ Email service initialized
✅ OAuth strategies initialized
🚀 FinAutoJobs Backend Server running on port 5000
```

Your app will be live at: `https://your-app-name.railway.app` 🎉
