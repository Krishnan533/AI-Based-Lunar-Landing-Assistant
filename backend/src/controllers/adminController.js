const User = require('../models/User');
const LandingReport = require('../models/LandingReport');
const Prediction = require('../models/Prediction');
const Image = require('../models/Image');
const { inMemoryUsers } = require('./authController');
const { inMemoryReports } = require('./landingController');

const withDbTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms)),
  ]);
};

// @desc    Get all registered users (Admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    let users = [];
    try {
      users = await withDbTimeout(User.find().select('-password').sort({ createdAt: -1 }));
    } catch (e) {
      users = inMemoryUsers.map(({ password, ...u }) => u);
    }
    if (users.length === 0 && inMemoryUsers.length > 0) {
      users = inMemoryUsers.map(({ password, ...u }) => u);
    }
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all landing reports across all users (Admin view)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res, next) => {
  try {
    let reports = [];
    try {
      reports = await withDbTimeout(
        LandingReport.find()
          .populate('userId', 'name email organization')
          .populate('imageId')
          .populate('detectionResultId')
          .sort({ createdAt: -1 })
      );
    } catch (e) {
      reports = inMemoryReports;
    }
    if (reports.length === 0 && inMemoryReports.length > 0) {
      reports = inMemoryReports;
    }
    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall system stats & prediction logs (Admin view)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    let totalUsers = 0;
    let totalImages = 0;
    let totalReports = 0;
    let totalPredictions = 0;
    let clearedCount = 0;
    let cautionCount = 0;
    let abortedCount = 0;
    let recentPredictions = [];

    try {
      totalUsers = await withDbTimeout(User.countDocuments());
      totalImages = await withDbTimeout(Image.countDocuments());
      totalReports = await withDbTimeout(LandingReport.countDocuments());
      totalPredictions = await withDbTimeout(Prediction.countDocuments());

      clearedCount = await withDbTimeout(LandingReport.countDocuments({ recommendationStatus: 'CLEARED_FOR_LANDING' }));
      cautionCount = await withDbTimeout(LandingReport.countDocuments({ recommendationStatus: 'PROCEED_WITH_CAUTION' }));
      abortedCount = await withDbTimeout(LandingReport.countDocuments({ recommendationStatus: 'LANDING_ABORTED' }));

      recentPredictions = await withDbTimeout(
        Prediction.find()
          .populate('userId', 'name email')
          .populate('imageId')
          .sort({ timestamp: -1 })
          .limit(10)
      );
    } catch (e) {
      totalUsers = inMemoryUsers.length || 1;
      totalReports = inMemoryReports.length;
      totalImages = inMemoryReports.length;
      totalPredictions = inMemoryReports.length;
      clearedCount = inMemoryReports.filter((r) => r.recommendationStatus === 'CLEARED_FOR_LANDING').length;
      cautionCount = inMemoryReports.filter((r) => r.recommendationStatus === 'PROCEED_WITH_CAUTION').length;
      abortedCount = inMemoryReports.filter((r) => r.recommendationStatus === 'LANDING_ABORTED').length;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalImages,
        totalReports,
        totalPredictions,
        recommendationDistribution: {
          cleared: clearedCount,
          caution: cautionCount,
          aborted: abortedCount,
        },
        recentPredictions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a landing report (Admin view)
// @route   DELETE /api/admin/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res, next) => {
  try {
    try {
      const report = await withDbTimeout(LandingReport.findById(req.params.id));
      if (report) {
        await report.deleteOne();
      }
    } catch (e) {
      const idx = inMemoryReports.findIndex((r) => r._id.toString() === req.params.id);
      if (idx !== -1) {
        inMemoryReports.splice(idx, 1);
      }
    }

    res.json({ success: true, message: 'Landing report deleted successfully' });
  } catch (error) {
    next(error);
  }
};
