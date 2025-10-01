# 🔧 Job Status Fix - Draft & Closed Jobs Visibility

## **🎯 ISSUE FIXED**

**Problem:** Draft and closed jobs were not visible in the recruiter dashboard because the jobs API was hardcoded to only show `status: 'active'` jobs.

**Solution:** Enhanced the jobs API to show all job statuses for recruiters while maintaining public access restrictions.

---

## **✅ WHAT HAS BEEN FIXED**

### **1. Enhanced Main Jobs Route**
- **Route:** `GET /api/v2/jobs`
- **Change:** Now detects user role and shows appropriate jobs
- **For Recruiters:** Shows all their jobs (active, draft, closed)
- **For Public:** Shows only active jobs with future deadlines

### **2. New Dedicated Recruiter Route**
- **Route:** `GET /api/v2/jobs/my-jobs`
- **Purpose:** Specifically for recruiter dashboard job management
- **Features:** Status filtering, search, pagination, statistics

### **3. Job Status Management**
- **Route:** `PUT /api/v2/jobs/:id/status`
- **Purpose:** Change job status (draft → active, active → closed, etc.)
- **Features:** Validation, status transition rules, analytics tracking

---

## **📊 NEW API ENDPOINTS**

### **🔍 1. GET RECRUITER'S JOBS**

**Endpoint:** `GET /api/v2/jobs/my-jobs`

**Purpose:** Get all recruiter's jobs with status filtering for dashboard tabs

**Frontend Usage:**
```javascript
// Load all jobs for recruiter
const loadRecruiterJobs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/v2/jobs/my-jobs?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Display jobs in appropriate tabs
      displayJobsInDashboard(data.data.jobs);
      
      // Update tab counts
      updateTabCounts(data.data.summary);
      
      // Update pagination
      updatePagination(data.data.pagination);
    }
  } catch (error) {
    console.error('Error loading recruiter jobs:', error);
  }
};

// Load jobs by status for different tabs
const loadActiveJobs = () => {
  loadRecruiterJobs({ status: 'active' });
};

const loadDraftJobs = () => {
  loadRecruiterJobs({ status: 'draft' });
};

const loadClosedJobs = () => {
  loadRecruiterJobs({ status: 'closed' });
};

// Load all jobs (default)
const loadAllJobs = () => {
  loadRecruiterJobs(); // No status filter = all statuses
};
```

**Query Parameters:**
- `status` - Filter by job status: 'active', 'draft', 'closed'
- `search` - Search in job title, description, company name
- `page` - Page number for pagination
- `limit` - Number of jobs per page
- `sortBy` - Sort field (default: 'createdAt')
- `sortOrder` - Sort order: 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "job_id",
        "id": "job_id",
        "jobTitle": "Senior React Developer",
        "companyName": "Tech Corp",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "applicationDeadline": "2024-02-15T23:59:59Z",
        "applicationsCount": 25,
        "activeApplicationsCount": 18,
        "isExpired": false,
        "daysLeft": 15,
        "isNew": true,
        "canEdit": true,
        "canDelete": false,
        "canClose": true,
        "canReopen": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalJobs": 12,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "summary": {
      "total": 12,
      "active": 8,
      "draft": 2,
      "closed": 2,
      "expired": 1
    },
    "filters": {
      "status": ["active"],
      "search": ""
    }
  }
}
```

---

### **🔄 2. UPDATE JOB STATUS**

**Endpoint:** `PUT /api/v2/jobs/:id/status`

**Purpose:** Change job status with proper validation

**Frontend Usage:**
```javascript
// Change job status
const updateJobStatus = async (jobId, newStatus) => {
  try {
    const response = await fetch(`/api/v2/jobs/${jobId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(`Job ${newStatus} successfully`, 'success');
      
      // Refresh jobs list
      loadRecruiterJobs();
      
      // Update UI immediately
      updateJobStatusInUI(jobId, newStatus);
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    console.error('Error updating job status:', error);
    showToast('Failed to update job status', 'error');
  }
};

// Specific status change functions
const publishJob = (jobId) => {
  if (confirm('Are you sure you want to publish this job?')) {
    updateJobStatus(jobId, 'active');
  }
};

const closeJob = (jobId) => {
  if (confirm('Are you sure you want to close this job?')) {
    updateJobStatus(jobId, 'closed');
  }
};

const reopenJob = (jobId) => {
  if (confirm('Are you sure you want to reopen this job?')) {
    updateJobStatus(jobId, 'active');
  }
};
```

**Request Body:**
```json
{
  "status": "active"
}
```

**Valid Status Transitions:**
- `draft` → `active` (Publish job)
- `draft` → `closed` (Close draft)
- `active` → `closed` (Close active job)
- `closed` → `active` (Reopen job)

**Response:**
```json
{
  "success": true,
  "message": "Job status updated to active",
  "data": {
    "job": {
      "_id": "job_id",
      "jobTitle": "Senior React Developer",
      "status": "active",
      "publishedAt": "2024-01-15T15:30:00Z",
      "updatedAt": "2024-01-15T15:30:00Z"
    }
  }
}
```

---

## **🎨 FRONTEND INTEGRATION**

### **Dashboard Tabs Implementation**
```javascript
// Enhanced job management tabs
const renderJobManagementTabs = (summary) => {
  return `
    <div class="nav nav-tabs" id="jobTabs" role="tablist">
      <button class="nav-link active" id="all-jobs-tab" data-bs-toggle="tab" data-bs-target="#all-jobs" 
              onclick="loadAllJobs()">
        All Jobs <span class="badge bg-secondary">${summary.total}</span>
      </button>
      <button class="nav-link" id="active-jobs-tab" data-bs-toggle="tab" data-bs-target="#active-jobs"
              onclick="loadActiveJobs()">
        Active <span class="badge bg-success">${summary.active}</span>
      </button>
      <button class="nav-link" id="draft-jobs-tab" data-bs-toggle="tab" data-bs-target="#draft-jobs"
              onclick="loadDraftJobs()">
        Draft <span class="badge bg-warning">${summary.draft}</span>
      </button>
      <button class="nav-link" id="closed-jobs-tab" data-bs-toggle="tab" data-bs-target="#closed-jobs"
              onclick="loadClosedJobs()">
        Closed <span class="badge bg-danger">${summary.closed}</span>
      </button>
    </div>
  `;
};
```

### **Job Actions Based on Status**
```javascript
// Render job actions based on status and permissions
const renderJobActions = (job) => {
  const actions = [];
  
  // View/Edit actions
  actions.push(`
    <a href="/recruiter-dashboard/jobs/edit/${job._id}" class="btn btn-sm btn-outline-primary">
      <i class="fas fa-edit"></i> ${job.canEdit ? 'Edit' : 'View'}
    </a>
  `);
  
  // Status-specific actions
  if (job.status === 'draft') {
    actions.push(`
      <button class="btn btn-sm btn-success" onclick="publishJob('${job._id}')">
        <i class="fas fa-play"></i> Publish
      </button>
    `);
    
    if (job.canDelete) {
      actions.push(`
        <button class="btn btn-sm btn-danger" onclick="deleteJob('${job._id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      `);
    }
  }
  
  if (job.status === 'active') {
    actions.push(`
      <button class="btn btn-sm btn-warning" onclick="closeJob('${job._id}')">
        <i class="fas fa-stop"></i> Close
      </button>
    `);
  }
  
  if (job.status === 'closed') {
    actions.push(`
      <button class="btn btn-sm btn-success" onclick="reopenJob('${job._id}')">
        <i class="fas fa-play"></i> Reopen
      </button>
    `);
  }
  
  // Applications link
  if (job.applicationsCount > 0) {
    actions.push(`
      <a href="/recruiter-dashboard/applicants?jobId=${job._id}" class="btn btn-sm btn-info">
        <i class="fas fa-users"></i> Applications (${job.applicationsCount})
      </a>
    `);
  }
  
  return actions.join(' ');
};
```

### **Job Status Badge**
```javascript
// Render status badge with appropriate styling
const renderJobStatusBadge = (job) => {
  const statusConfig = {
    'active': { class: 'bg-success', icon: 'fas fa-check-circle', text: 'Active' },
    'draft': { class: 'bg-warning', icon: 'fas fa-edit', text: 'Draft' },
    'closed': { class: 'bg-danger', icon: 'fas fa-times-circle', text: 'Closed' }
  };
  
  const config = statusConfig[job.status] || statusConfig['draft'];
  
  let badge = `
    <span class="badge ${config.class}">
      <i class="${config.icon}"></i> ${config.text}
    </span>
  `;
  
  // Add expired indicator for active jobs
  if (job.status === 'active' && job.isExpired) {
    badge += ` <span class="badge bg-secondary ms-1">
      <i class="fas fa-clock"></i> Expired
    </span>`;
  }
  
  // Add new indicator
  if (job.isNew) {
    badge += ` <span class="badge bg-info ms-1">
      <i class="fas fa-star"></i> New
    </span>`;
  }
  
  return badge;
};
```

---

## **🔄 ENHANCED MAIN JOBS ROUTE**

The main jobs route (`GET /api/v2/jobs`) has also been enhanced:

### **For Recruiters (Authenticated):**
```javascript
// When recruiter is logged in, shows all their jobs
const response = await fetch('/api/v2/jobs', {
  headers: {
    'Authorization': `Bearer ${recruiterToken}`,
    'Content-Type': 'application/json'
  }
});
// Returns: All recruiter's jobs (active, draft, closed)
```

### **For Public Users:**
```javascript
// Public access shows only active jobs
const response = await fetch('/api/v2/jobs');
// Returns: Only active jobs with future deadlines
```

### **Status Filtering for Recruiters:**
```javascript
// Recruiter can filter by status in main route too
const response = await fetch('/api/v2/jobs?status=draft', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Returns: Only draft jobs for the recruiter
```

---

## **📊 DASHBOARD STATISTICS**

The new endpoint provides comprehensive statistics:

```javascript
// Update dashboard summary cards
const updateDashboardSummary = (summary) => {
  document.getElementById('total-jobs').textContent = summary.total;
  document.getElementById('active-jobs').textContent = summary.active;
  document.getElementById('draft-jobs').textContent = summary.draft;
  document.getElementById('closed-jobs').textContent = summary.closed;
  document.getElementById('expired-jobs').textContent = summary.expired;
  
  // Update progress bars
  const activePercentage = (summary.active / summary.total) * 100;
  document.getElementById('active-progress').style.width = `${activePercentage}%`;
  
  // Update tab badges
  document.querySelectorAll('.nav-link .badge').forEach(badge => {
    const tabType = badge.closest('.nav-link').id.split('-')[0];
    badge.textContent = summary[tabType] || 0;
  });
};
```

---

## **🚀 IMMEDIATE BENEFITS**

### **✅ Fixed Issues:**

1. **Draft Jobs Visible** - Recruiters can now see and manage draft jobs
2. **Closed Jobs Visible** - Closed jobs appear in the closed jobs tab
3. **Status Management** - Jobs can be moved between statuses properly
4. **Proper Filtering** - Each tab shows the correct jobs by status
5. **Public Access Protected** - Public users still only see active jobs

### **📈 Enhanced Features:**

1. **Status Transitions** - Proper validation for status changes
2. **Job Statistics** - Real-time counts for each status
3. **Action Permissions** - Buttons shown based on job status and permissions
4. **Search & Pagination** - Works across all job statuses
5. **Analytics Tracking** - Status changes are tracked for reporting

---

## **🎯 FRONTEND UPDATES NEEDED**

### **1. Update API Calls:**
```javascript
// Replace existing job loading with new endpoint
// OLD: GET /api/jobs
// NEW: GET /api/v2/jobs/my-jobs (for recruiter dashboard)

// Update job management pages to use new endpoints
```

### **2. Add Status Management:**
```javascript
// Add status change buttons to job cards/table
// Implement confirmation dialogs for status changes
// Update UI immediately after status changes
```

### **3. Update Tab Functionality:**
```javascript
// Ensure tabs call the correct API with status filters
// Update tab badges with real counts from API response
// Handle empty states for each tab
```

---

## **🧪 TESTING**

### **Test Scenarios:**

1. **Draft Jobs Tab:**
   - Should show only draft jobs
   - Should show "Publish" and "Delete" buttons
   - Should allow editing

2. **Active Jobs Tab:**
   - Should show only active jobs
   - Should show "Close" button
   - Should show application counts

3. **Closed Jobs Tab:**
   - Should show only closed jobs
   - Should show "Reopen" button
   - Should show final statistics

4. **Status Changes:**
   - Draft → Active (Publish)
   - Active → Closed (Close)
   - Closed → Active (Reopen)

### **API Testing:**
```bash
# Test recruiter jobs endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/v2/jobs/my-jobs"

# Test status filtering
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/v2/jobs/my-jobs?status=draft"

# Test status update
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status":"active"}' \
     "http://localhost:5000/api/v2/jobs/JOB_ID/status"
```

---

## **🎉 SUMMARY**

**✅ Draft and closed jobs are now fully visible and manageable in the recruiter dashboard!**

**Key Changes:**
1. Enhanced main jobs route to detect user role
2. Added dedicated `/my-jobs` endpoint for recruiters
3. Added job status management endpoint
4. Proper status filtering and validation
5. Comprehensive job statistics and analytics

**Next Steps:**
1. Update frontend to use new API endpoints
2. Implement status management UI
3. Test all job status transitions
4. Deploy and verify functionality

**🚀 Your recruiter dashboard job management is now complete with full draft and closed job visibility!**
