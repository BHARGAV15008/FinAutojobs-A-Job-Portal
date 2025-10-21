import express from 'express';
const router = express.Router();

// GET /api/recruiters
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Recruiters endpoint', data: [] });
});

export default router;
