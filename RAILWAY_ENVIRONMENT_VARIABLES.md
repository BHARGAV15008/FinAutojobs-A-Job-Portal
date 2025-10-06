# 🚂 Railway Environment Variables Setup

## 📍 **Where to Add Variables**

**Railway Dashboard** → **Your Project** → **Service** → **Variables Tab**

## 🔑 **Required Environment Variables**

### **Essential Variables (Required)**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

### **Email Service (Gmail)**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### **SMS Service (Twilio)**
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### **Security & Session**
```
SESSION_SECRET=your_session_secret_key
CORS_ORIGIN=https://your-app-name.railway.app
```

### **Optional Variables**
```
PORT=5000
DATABASE_URL=mongodb+srv://username:password@cluster0.nvq1gwn.mongodb.net/finautojobs
```

## 🎯 **Step-by-Step Instructions**

### **1. MongoDB URI Setup**
- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Navigate to **Database** → **Connect** → **Connect your application**
- Copy the connection string
- Replace `<username>`, `<password>`, and `<database>` with your values
- **Example**: `mongodb+srv://myuser:mypass@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority`

### **2. JWT Secret**
Generate a secure JWT secret:
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use online generator
# Visit: https://generate-secret.vercel.app/64
```

### **3. Gmail App Password**
1. Go to [Google Account Settings](https://myaccount.google.com)
2. **Security** → **2-Step Verification** → **App passwords**
3. Generate an app password for "Mail"
4. Use this password (not your regular Gmail password)

### **4. Twilio Setup (Optional)**
1. Sign up at [Twilio](https://www.twilio.com)
2. Get your **Account SID** and **Auth Token** from dashboard
3. Purchase a phone number or use trial number

### **5. Session Secret**
Generate another random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 **Railway Dashboard Steps**

1. **Deploy your project first**:
   - Go to [railway.app](https://railway.app)
   - **New Project** → **Deploy from GitHub repo**
   - Select `FinAutojobs-A-Job-Portal`

2. **Add variables**:
   - Click on your deployed service
   - Go to **Variables** tab
   - Click **"New Variable"**
   - Add **Name** and **Value** for each variable above

3. **Redeploy**:
   - After adding variables, Railway will automatically redeploy
   - Your app will be live with all environment variables!

## 📋 **Quick Copy-Paste Template**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority
JWT_SECRET=your_64_character_random_string_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
SESSION_SECRET=your_32_character_random_string
CORS_ORIGIN=https://your-app-name.railway.app
```

## ⚠️ **Important Notes**

1. **Replace placeholder values** with your actual credentials
2. **Don't commit** environment variables to Git (they're in Railway dashboard)
3. **MongoDB Atlas**: Make sure to whitelist Railway IPs or use "Allow from anywhere"
4. **CORS_ORIGIN**: Update with your actual Railway app URL after deployment
5. **Gmail**: Use App Password, not regular password

## 🎯 **Deployment Order**

1. **Deploy first** (without variables - it will fail)
2. **Add environment variables** in Railway dashboard
3. **Railway auto-redeploys** with variables
4. **App works perfectly!** ✅

Your app will be live at: `https://your-app-name.railway.app`
