import express from 'express';
const router = express.Router();

// GET /api/interviews
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Interviews endpoint', data: [] });
});

export default router;
