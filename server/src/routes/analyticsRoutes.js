// Analytics endpoints for sessions
const express = require('express');
const router = express.Router();
const {
  getSessionAnalytics,
  getRealtimeStats,
  getSessionInsight
} = require('../controllers/analyticsController');

router.get('/session/:id', getSessionAnalytics);
router.get('/session/:id/realtime', getRealtimeStats);
router.post('/session/:id/insight', getSessionInsight);

module.exports = router;