
// // backend/src/routes/aboutRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicAbout,
//   getAdminAbout,
//   updateAbout,
//   resetAbout
// } = require('../controllers/aboutController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================

// // @route   GET /api/about/page
// // @access  Public
// router.get('/page', getPublicAbout);  // ✅ Removed '/about' prefix

// // ============================================================
// // ADMIN ROUTES (Protected)
// // ============================================================

// // @route   GET /api/admin/about
// // @access  Private (Admin/Moderator)
// router.get('/', protect, isModeratorOrAdmin, getAdminAbout);  // ✅ Removed '/admin' prefix

// // @route   PUT /api/admin/about
// // @access  Private (Admin/Moderator)
// router.put('/', protect, isModeratorOrAdmin, updateAbout);  // ✅ Removed '/admin' prefix

// // @route   POST /api/admin/about/reset
// // @access  Private (Admin/Moderator)
// router.post('/reset', protect, isModeratorOrAdmin, resetAbout);  // ✅ Removed '/admin' prefix

// module.exports = router;


// backend/src/routes/aboutRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicAbout,
  getAdminAbout,
  updateAbout,
  resetAbout
} = require('../controllers/aboutController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/about/page
// @access  Public
router.get('/page', getPublicAbout);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================

// @route   GET /api/admin/about
// @access  Private (Admin/Moderator)
router.get('/', protect, isModeratorOrAdmin, getAdminAbout);

// @route   PUT /api/admin/about
// @access  Private (Admin/Moderator)
router.put('/', protect, isModeratorOrAdmin, updateAbout);

// @route   POST /api/admin/about/reset
// @access  Private (Admin/Moderator)
router.post('/reset', protect, isModeratorOrAdmin, resetAbout);

module.exports = router;