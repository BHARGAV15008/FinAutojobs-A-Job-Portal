import express from 'express';
const router = express.Router();

// GET /api/candidates
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Candidates endpoint', data: [] });
});

export default router;
