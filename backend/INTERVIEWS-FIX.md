# 🔧 Interviews Not Showing Fix

## **🎯 ISSUE**
No interviews showing on `/recruiter-dashboard/interviews` even though interviews are scheduled.

## **✅ SOLUTION**

### **1. Check API Endpoint**
Frontend should call: `GET /api/v2/interviews`

### **2. Enhanced Frontend Code**

```javascript
// Interviews Dashboard Handler
class InterviewsDashboard {
  constructor() {
    this.token = localStorage.getItem('token');
    this.init();
  }

  async init() {
    if (!this.token) {
      window.location.href = '/login';
      return;
    }
    await this.loadInterviews();
  }

  async loadInterviews() {
    try {
      console.log('Loading interviews...');
      
      const response = await fetch('/api/v2/interviews', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Interviews loaded:', data.data.interviews.length);
        this.displayInterviews(data.data.interviews);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
      this.showError('Failed to load interviews');
    }
  }

  displayInterviews(interviews) {
    const container = document.getElementById('interviews-container');
    
    if (!interviews || interviews.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-calendar-times fa-4x text-muted mb-3"></i>
          <h4>No Interviews Scheduled</h4>
          <p class="text-muted">No interviews have been scheduled yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = interviews.map(interview => `
      <div class="card mb-3">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h5>${interview.candidateName || 'Candidate'}</h5>
              <p class="text-muted">${interview.candidateEmail || 'N/A'}</p>
              <p><strong>Job:</strong> ${interview.jobTitle || 'Position'}</p>
              <p><strong>Company:</strong> ${interview.companyName || 'Company'}</p>
              <span class="badge bg-primary">${interview.status}</span>
            </div>
            <div class="col-md-4 text-end">
              <p><strong>Date:</strong> ${new Date(interview.scheduledDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${interview.scheduledTime}</p>
              <p><strong>Type:</strong> ${interview.interviewType || 'Interview'}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  showError(message) {
    const container = document.getElementById('interviews-container');
    container.innerHTML = `
      <div class="alert alert-danger">
        <h4>Error</h4>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new InterviewsDashboard();
});
```

### **3. Debug API Call**

Test the API directly:

```javascript
// Test in browser console
fetch('/api/v2/interviews', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => console.log('Interviews:', data));
```

### **4. Check Database**

Verify interviews exist:
```javascript
// In MongoDB shell
db.interviews.find({}).count()
db.interviews.find({}).limit(5)
```

## **🎯 EXPECTED RESULT**

After implementing:
- ✅ Interviews will display on `/recruiter-dashboard/interviews`
- ✅ Shows candidate names, job titles, dates/times
- ✅ Proper error handling for empty states
- ✅ Authentication and API integration working

**🎉 Your interviews will now be visible in the dashboard!**
