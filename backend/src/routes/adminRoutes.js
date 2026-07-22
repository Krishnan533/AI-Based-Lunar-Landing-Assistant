const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getAllReports,
  getAdminStats,
  deleteReport,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.get('/reports', getAllReports);
router.get('/stats', getAdminStats);
router.delete('/reports/:id', deleteReport);

module.exports = router;
