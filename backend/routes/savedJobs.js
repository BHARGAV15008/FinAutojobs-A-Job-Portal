import express from 'express';
const router = express.Router();

// GET /api/saved-jobs
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Saved Jobs endpoint', data: [] });
});

export default router;
