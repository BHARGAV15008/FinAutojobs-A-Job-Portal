import express from 'express';
const router = express.Router();

// GET /api/notifications
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Notifications endpoint', 
    data: {
      notifications: []
    }
  });
});

export default router;
