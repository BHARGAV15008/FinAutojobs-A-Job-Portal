# 🚀 MERN Backend Restructure - Quick Implementation

## ✅ What's Been Created

### 1. Unified Models
- `backend/models/unified/BaseUser.js` - Common user fields
- `backend/models/unified/Recruiter.js` - Recruiter-specific fields  
- `backend/models/unified/Applicant.js` - Applicant-specific fields
- `backend/models/unified/UserManager.js` - Unified operations

### 2. New API Routes
- `backend/routes/unified-auth.js` - Clean auth with consistent naming
- Available at `/api/v2/auth/*` endpoints

### 3. Key Improvements
- **Consistent Naming**: `firstName`, `lastName`, `jobTitle`, `companyName`
- **Unified IDs**: `userId`, `recruiterId`, `applicantId`
- **Social Links**: `linkedinUrl`, `githubUrl`, `portfolioUrl`
- **Proper Data Flow**: Registration → Profile → Dashboard

## 🎯 Quick Test

```bash
# Test new registration
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@test.com",
    "password": "password123",
    "phone": "+91-9876543210",
    "role": "recruiter",
    "companyName": "Tech Corp",
    "position": "HR Manager"
  }'

# Test login
curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123", 
    "role": "recruiter"
  }'
```

## 🔄 Migration Steps

1. **Test New System**: Use `/api/v2/auth` endpoints
2. **Update Frontend**: Point to new API routes
3. **Migrate Data**: Run migration script if needed
4. **Switch Over**: Replace old routes when ready

## 📋 Frontend Updates Needed

```javascript
// Change API base URL
const API_BASE = 'http://localhost:5000/api/v2';

// Update field names in forms
companyName: user.companyInfo?.companyName || user.companyName
jobTitle: user.companyInfo?.jobTitle || user.position
linkedinUrl: user.socialLinks?.linkedinUrl || user.linkedin_url
```

## ✨ Benefits

- ✅ Consistent field naming across entire backend
- ✅ Proper data flow from registration to profile
- ✅ Clean API structure with unified responses
- ✅ Scalable architecture for future features
- ✅ Backward compatibility during transition

**Next Step**: Test the new `/api/v2/auth` endpoints and verify profile data flows correctly!
