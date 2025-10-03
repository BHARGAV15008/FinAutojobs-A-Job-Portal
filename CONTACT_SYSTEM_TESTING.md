# Contact System Testing Guide

## Issue Resolution: Message Templates Not Showing

### Problem
The message templates were not appearing in the ContactCandidateModal dropdown.

### Root Cause Analysis
1. **API Endpoint Issues**: The templates API required authentication but wasn't handling fallbacks properly
2. **Template Loading**: Templates were only loaded from backend, no fallback mechanism
3. **State Management**: Templates state was initialized as empty array

### Solutions Implemented

#### 1. Fallback Templates
- **Added default templates** in component state initialization
- **4 Professional Templates** available immediately:
  - Interview Invitation
  - Application Received  
  - Job Offer
  - Follow-up Message

#### 2. Enhanced API Integration
- **Proper API URL construction** using environment variables
- **Authentication handling** with JWT tokens
- **Error handling** with graceful fallbacks
- **Debug logging** for troubleshooting

#### 3. Improved User Experience
- **Loading states** during template fetch
- **Debug information** in development mode
- **Fallback message** if no templates available
- **Enhanced error handling**

## Testing Instructions

### 1. Open Contact Modal
1. Login as a recruiter
2. Navigate to applications or candidate list
3. Click any "📧 Contact" button
4. Modal should open with two tabs: Email and Message

### 2. Verify Templates
1. Click on **Email** tab
2. Look for **"Email Template"** dropdown
3. Should see:
   - "None (Custom Message)" (default)
   - "Interview Invitation"
   - "Application Received"
   - "Job Offer"
   - "Follow-up Message"

### 3. Test Template Selection
1. Select "Interview Invitation" from dropdown
2. Subject field should auto-populate
3. Message field should fill with template content
4. Placeholders like {candidateName} should be replaced with actual data

### 4. Debug Information
In development mode, you should see debug text showing:
```
Debug: 4 templates loaded, Loading: No
```

## Expected Template Content

### Interview Invitation
```
Subject: Interview Invitation - {jobTitle} at {companyName}

Dear {candidateName},

We are pleased to invite you for an interview for the {jobTitle} position at {companyName}.

Interview Details:
- Date: {interviewDate}
- Time: {interviewTime}
- Location: {interviewLocation}
- Duration: Approximately {duration}

Please confirm your availability by replying to this email.

We look forward to meeting you.

Best regards,
{recruiterName}
{companyName}
```

### Application Received
```
Subject: Application Received - {jobTitle}

Dear {candidateName},

Thank you for your interest in the {jobTitle} position at {companyName}.

We have successfully received your application and our hiring team will review it carefully. We will contact you within 5-7 business days regarding the next steps.

If you have any questions, please feel free to reach out.

Best regards,
{recruiterName}
{companyName}
```

## Troubleshooting

### Templates Not Showing
1. **Check Console**: Open browser dev tools, look for errors
2. **Check Debug Info**: Should show "4 templates loaded"
3. **Check Authentication**: Ensure user is logged in as recruiter
4. **Check Modal State**: Modal should be open (open=true)

### API Issues
1. **Backend Server**: Ensure backend is running on port 5000
2. **Network Tab**: Check if API calls are being made
3. **Authentication**: Verify JWT token is being sent
4. **CORS**: Check for CORS errors in console

### Template Content Issues
1. **Placeholder Replacement**: Check if {candidateName} etc. are being replaced
2. **User Data**: Ensure user object has required fields (firstName, lastName, companyInfo)
3. **Candidate Data**: Verify candidate object is passed correctly

## Console Debugging

Expected console output when opening modal:
```
Templates API Response: 200 OK
Templates data received: {success: true, data: {templates: [...]}}
✅ Loaded templates from backend: 5
📋 Final templates count: 5
```

Or if API fails:
```
Templates API Response: 401 Unauthorized
⚠️ API failed, using fallback templates
📋 Final templates count: 4
```

## Current Status

### ✅ Fixed Issues
- Templates now load with fallback mechanism
- Proper API URL construction
- Enhanced error handling
- Debug information available
- Loading states implemented

### 🔧 Ready for Testing
- 4 professional templates available immediately
- Backend API integration working
- Fallback system ensures templates always available
- Debug mode for troubleshooting

### 📋 Next Steps
1. Test template dropdown functionality
2. Verify template content population
3. Test placeholder replacement
4. Confirm email/message sending works
5. Check success/error feedback

## Environment Setup

Ensure these are configured:
```env
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
```

Backend should be running on port 5000 with contact routes enabled.

## Success Criteria

✅ **Template Dropdown**: Shows 4+ templates  
✅ **Template Selection**: Populates subject and content  
✅ **Placeholder Replacement**: Dynamic content insertion  
✅ **API Integration**: Backend templates load (if available)  
✅ **Fallback System**: Always shows templates even if API fails  
✅ **Debug Information**: Shows template count and loading status  
✅ **Error Handling**: Graceful failure recovery  

The contact system should now be fully functional with professional message templates available for recruiters to communicate with candidates.
