

// // backend/src/routes/footerRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const { upload } = require('../config/cloudinary');
// const {
//   getPublicFooter,
//   getAdminFooter,
//   createFooter,
//   updateFooter,
//   deleteFooter,
//   toggleFooterStatus,
//   resetFooter,
//   uploadLogo
// } = require('../controllers/footerController');

// // ============================================================
// // PUBLIC ROUTES (No authentication needed)
// // ============================================================

// // @route   GET /api/footer
// // @desc    Get public footer data
// // @access  Public
// router.get('/', getPublicFooter);

// // ============================================================
// // ADMIN/MODERATOR ROUTES (Authentication + Admin/Moderator role required)
// // ============================================================

// // Debug middleware to log user role
// router.use(protect, (req, res, next) => {
//   console.log('🔍 User role from token:', req.user?.role);
//   console.log('🔍 User ID:', req.user?._id);
//   console.log('🔍 User email:', req.user?.email);
//   next();
// });

// // All routes below require authentication and admin/moderator role
// router.use(protect, isModeratorOrAdmin);

// // @route   GET /api/admin/footer
// // @desc    Get footer data for admin/moderator
// // @access  Private (Admin/Moderator)
// router.get('/', getAdminFooter);

// // @route   POST /api/admin/footer
// // @desc    Create footer
// // @access  Private (Admin/Moderator)
// router.post('/', createFooter);

// // @route   PUT /api/admin/footer
// // @desc    Update footer
// // @access  Private (Admin/Moderator)
// router.put('/', updateFooter);

// // @route   DELETE /api/admin/footer
// // @desc    Delete footer (deactivate)
// // @access  Private (Admin/Moderator)
// router.delete('/', deleteFooter);

// // @route   PUT /api/admin/footer/toggle
// // @desc    Toggle footer status
// // @access  Private (Admin/Moderator)
// router.put('/toggle', toggleFooterStatus);

// // @route   POST /api/admin/footer/reset
// // @desc    Reset footer to default
// // @access  Private (Admin/Moderator)
// router.post('/reset', resetFooter);

// // @route   POST /api/admin/footer/upload-logo
// // @desc    Upload footer logo
// // @access  Private (Admin/Moderator)
// router.post('/upload-logo', upload.single('logo'), uploadLogo);

// module.exports = router;


// backend/src/routes/footerRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getPublicFooter,
  getAdminFooter,
  createFooter,
  updateFooter,
  deleteFooter,
  toggleFooterStatus,
  resetFooter,
  uploadBackground,
  uploadLogo
} = require('../controllers/footerController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/footer
// @desc    Get public footer data
// @access  Public
router.get('/', getPublicFooter);

// ============================================================
// ADMIN/MODERATOR ROUTES
// ============================================================

router.use(protect, (req, res, next) => {
  console.log('🔍 User role from token:', req.user?.role);
  console.log('🔍 User ID:', req.user?._id);
  console.log('🔍 User email:', req.user?.email);
  next();
});

router.use(protect, isModeratorOrAdmin);

// @route   GET /api/admin/footer
// @desc    Get footer data for admin
router.get('/', getAdminFooter);

// @route   POST /api/admin/footer
// @desc    Create footer
router.post('/', createFooter);

// @route   PUT /api/admin/footer
// @desc    Update footer
router.put('/', updateFooter);

// @route   DELETE /api/admin/footer
// @desc    Delete footer (deactivate)
router.delete('/', deleteFooter);

// @route   PUT /api/admin/footer/toggle
// @desc    Toggle footer status
router.put('/toggle', toggleFooterStatus);

// @route   POST /api/admin/footer/reset
// @desc    Reset footer to default
router.post('/reset', resetFooter);

// @route   POST /api/admin/footer/upload-background
// @desc    Upload footer background image
router.post('/upload-background', upload.single('background'), uploadBackground);

// @route   POST /api/admin/footer/upload-logo
// @desc    Upload footer logo
router.post('/upload-logo', upload.single('logo'), uploadLogo);

module.exports = router;