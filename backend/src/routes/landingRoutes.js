const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  analyzeLandingSite,
  getLandingHistory,
  getLandingReportById,
  getDashboardStats,
} = require('../controllers/landingController');

router.post('/analyze', protect, upload.single('image'), analyzeLandingSite);
router.get('/history', protect, getLandingHistory);
router.get('/stats', protect, getDashboardStats);
router.get('/report/:id', protect, getLandingReportById);

module.exports = router;
