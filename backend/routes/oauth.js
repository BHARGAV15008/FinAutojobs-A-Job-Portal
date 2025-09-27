import express from 'express';
const router = express.Router();

// GET /api/oauth
router.get('/', (req, res) => {
  res.json({ success: true, message: 'OAuth endpoint', data: [] });
});

export default router;
