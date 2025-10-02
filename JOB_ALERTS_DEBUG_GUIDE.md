# Job Alerts Debugging Guide - FinAutoJobs

## **Current Status: Unable to Create Job Alerts**

### **🔧 Debugging Steps Implemented**

#### **1. Enhanced Backend Logging**
Added comprehensive logging to `/backend/routes/jobAlerts.js`:
- ✅ User authentication details
- ✅ Request body validation
- ✅ Alert object creation process
- ✅ Matching jobs calculation
- ✅ Database save operation
- ✅ Detailed error messages with stack traces

#### **2. Enhanced Frontend Logging**
Added debugging to `/frontend/src/components/dashboard/JobAlertsTab.jsx`:
- ✅ Form data validation
- ✅ API request payload
- ✅ API response details
- ✅ Error handling with specific messages

#### **3. Authentication Fix Applied**
Previously fixed JWT token compatibility in job alerts middleware:
```javascript
// Handle both userId and id for compatibility
const userId = decoded.userId || decoded.id;
const user = await BaseUser.findById(userId);
```

### **🧪 Testing Instructions**

#### **Step 1: Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate to Job Alerts tab in applicant dashboard
4. Try to create a new job alert
5. Look for these log messages:

**Expected Frontend Logs:**
```
🔍 Creating job alert with data: {title: "...", keywords: [...], ...}
🔍 Sending alert data to API: {...}
🔍 API response: {...}
```

**Expected Backend Logs (in terminal):**
```
🔍 Creating job alert for user: [userId] role: applicant
🔍 Request body: {...}
✅ Validation passed, creating alert...
🔍 Alert object before save: {...}
🔍 Found matching jobs: [number]
✅ Job alert saved successfully: [alertId]
```

#### **Step 2: Check Network Tab**
1. Open Network tab in browser dev tools
2. Try creating a job alert
3. Look for POST request to `/api/job-alerts`
4. Check request headers (should include Authorization: Bearer [token])
5. Check response status and body

**Expected Request:**
- URL: `http://localhost:5000/api/job-alerts`
- Method: POST
- Headers: `Authorization: Bearer [jwt-token]`
- Body: JSON with title, keywords, location, etc.

**Expected Response:**
- Status: 201 Created
- Body: `{success: true, data: {...}, message: "Job alert created successfully"}`

#### **Step 3: Manual API Test**
Run the test script to verify API endpoints:
```bash
cd /run/media/technog/Data\ \&\ Files/Projects/prf/FinAutojobs-A-Job-Portal
node test-job-alerts.js
```

### **🔍 Common Issues to Check**

#### **1. Authentication Issues**
- **Symptom**: 401 Unauthorized errors
- **Check**: JWT token in localStorage
- **Fix**: Login again to get fresh token

#### **2. Role Permission Issues**
- **Symptom**: 403 Forbidden errors
- **Check**: User role is 'applicant' (not 'recruiter')
- **Fix**: Login with applicant account

#### **3. Validation Errors**
- **Symptom**: 400 Bad Request
- **Check**: Title and keywords are provided
- **Fix**: Ensure form fields are filled correctly

#### **4. Database Connection Issues**
- **Symptom**: 500 Internal Server Error
- **Check**: MongoDB connection in backend
- **Fix**: Restart backend server

#### **5. Model Import Issues**
- **Symptom**: "JobAlert is not defined" errors
- **Check**: JobAlert model import in backend
- **Fix**: Verify model file exists and is imported correctly

### **🛠️ Debugging Commands**

#### **Check Backend Server Status**
```bash
# In backend directory
npm run dev
# Should show: Server running on port 5000
```

#### **Check Database Connection**
```bash
# In backend terminal, look for:
# ✅ Connected to MongoDB
```

#### **Check Frontend Development Server**
```bash
# In frontend directory
npm run dev
# Should show: Local: http://localhost:3000
```

#### **Test API Endpoint Manually**
```bash
# Test with curl (replace [TOKEN] with actual JWT)
curl -X GET http://localhost:5000/api/job-alerts \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json"
```

### **📋 Troubleshooting Checklist**

#### **Backend Checks:**
- [ ] Backend server running on port 5000
- [ ] MongoDB connected successfully
- [ ] JobAlert model exists in `/backend/models/JobAlert.js`
- [ ] Job model exists in `/backend/models/Job.js`
- [ ] Routes registered in `/backend/server.js`
- [ ] Authentication middleware working

#### **Frontend Checks:**
- [ ] Frontend server running on port 3000
- [ ] User logged in as applicant
- [ ] JWT token exists in localStorage
- [ ] API client configured correctly
- [ ] Job alerts form rendering properly
- [ ] Console shows no JavaScript errors

#### **API Checks:**
- [ ] POST `/api/job-alerts` endpoint accessible
- [ ] GET `/api/job-alerts` endpoint accessible
- [ ] Authentication headers being sent
- [ ] Request body format correct
- [ ] Response format as expected

### **🔧 Quick Fixes**

#### **If Authentication Fails:**
1. Clear localStorage: `localStorage.clear()`
2. Login again with applicant account
3. Check JWT token: `localStorage.getItem('token')`

#### **If Validation Fails:**
1. Ensure title is not empty
2. Ensure keywords array has at least one item
3. Check form data structure in console

#### **If Server Errors:**
1. Restart backend server: `npm run dev`
2. Check MongoDB connection
3. Verify all model imports

#### **If Frontend Errors:**
1. Restart frontend server: `npm run dev`
2. Clear browser cache
3. Check console for JavaScript errors

### **📊 Expected Behavior**

#### **Successful Job Alert Creation:**
1. User fills out form with title and keywords
2. Clicks "Create Alert" button
3. Form data validated successfully
4. API request sent with authentication
5. Backend creates JobAlert document
6. Response returns success with alert data
7. Frontend updates alerts list
8. Success toast notification shown
9. Form resets and closes

#### **Error Scenarios:**
- **Empty title**: "Title is required" error
- **No keywords**: "Keywords must be a non-empty array" error
- **Not logged in**: "Authentication required" error
- **Wrong role**: "Only applicants can create job alerts" error
- **Server error**: Specific error message from backend

### **🎯 Next Steps**

1. **Follow testing instructions** to identify the exact failure point
2. **Check console logs** for specific error messages
3. **Verify authentication** is working properly
4. **Test with simple data** first (title + one keyword)
5. **Report specific error messages** found in console/network tabs

The enhanced logging will help identify exactly where the job alert creation is failing. Please follow the testing steps and report the specific error messages you see in the browser console and network tab.
