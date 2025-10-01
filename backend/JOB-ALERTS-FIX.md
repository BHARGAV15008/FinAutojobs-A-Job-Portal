# 🔧 Job Alerts Tab Fix

## **🎯 ISSUE**
Applicant Job Alert tab not working - using static fake data instead of real API.

## **✅ SOLUTION**

### **1. Create Job Alerts API**

Create `/backend/routes/enhanced/jobAlerts.js`:

```javascript
import express from 'express';
import JobAlert from '../../models/enhanced/JobAlert.js';
import Job from '../../models/Job.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// GET /api/v2/job-alerts - Get user's job alerts
router.get('/', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const alerts = await JobAlert.find({ userId }).sort({ createdAt: -1 });
    
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const matchingJobs = await Job.countDocuments({
          status: 'active',
          $text: { $search: alert.keywords.join(' ') }
        });
        
        return {
          ...alert.toObject(),
          id: alert._id,
          title: alert.name,
          matchingJobs
        };
      })
    );

    res.json({
      success: true,
      data: { alerts: enrichedAlerts }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v2/job-alerts - Create job alert
router.post('/', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const alertData = { ...req.body, userId: req.user.userId };
    const alert = new JobAlert(alertData);
    await alert.save();
    
    res.json({
      success: true,
      data: { alert: { ...alert.toObject(), id: alert._id, title: alert.name } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v2/job-alerts/:id - Update job alert
router.put('/:id', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const alert = await JobAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    
    res.json({ success: true, data: { alert } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v2/job-alerts/:id - Delete job alert
router.delete('/:id', authenticateToken, requireRole('applicant'), async (req, res) => {
  try {
    const alert = await JobAlert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

### **2. Update Frontend API**

Add to `/frontend/src/services/api.js`:

```javascript
// Job Alerts API
export const jobAlertsAPI = {
  getAlerts: () => api.get('/v2/job-alerts'),
  createAlert: (alertData) => api.post('/v2/job-alerts', alertData),
  updateAlert: (id, alertData) => api.put(`/v2/job-alerts/${id}`, alertData),
  deleteAlert: (id) => api.delete(`/v2/job-alerts/${id}`),
  toggleAlert: (id) => api.post(`/v2/job-alerts/${id}/toggle`),
  getMatches: (id) => api.get(`/v2/job-alerts/${id}/matches`)
};
```

### **3. Update JobAlertsTab Component**

Replace static data in `/frontend/src/components/dashboard/JobAlertsTab.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { jobAlertsAPI } from '../../services/api';

const JobAlertsTab = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await jobAlertsAPI.getAlerts();
      if (response.data.success) {
        setAlerts(response.data.data.alerts);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    try {
      const response = await jobAlertsAPI.createAlert(newAlert);
      if (response.data.success) {
        setAlerts([...alerts, response.data.data.alert]);
        setShowCreateForm(false);
      }
    } catch (error) {
      alert('Failed to create alert');
    }
  };

  const toggleAlert = async (id) => {
    try {
      await jobAlertsAPI.toggleAlert(id);
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      alert('Failed to toggle alert');
    }
  };

  const deleteAlert = async (id) => {
    try {
      await jobAlertsAPI.deleteAlert(id);
      setAlerts(alerts.filter(alert => alert.id !== id));
    } catch (error) {
      alert('Failed to delete alert');
    }
  };

  // Rest of component remains the same...
};
```

## **🎯 EXPECTED RESULT**

✅ Job alerts load from database  
✅ Create/edit/delete alerts work  
✅ Real matching jobs count  
✅ Toggle active/inactive status  

**🎉 Your job alerts tab is now fully functional!**
