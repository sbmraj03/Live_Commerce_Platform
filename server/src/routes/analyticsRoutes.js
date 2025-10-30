// Analytics endpoints for sessions
const express = require('express');
const router = express.Router();
const {
  getSessionAnalytics,
  getRealtimeStats
} = require('../controllers/analyticsController');

router.get('/session/:id', getSessionAnalytics);
router.get('/session/:id/realtime', getRealtimeStats);

module.exports = router;