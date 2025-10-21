import express from 'express';
const router = express.Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Users endpoint', data: [] });
});

export default router;
