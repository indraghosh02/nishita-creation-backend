


// // backend/src/controllers/footerController.js
// const Footer = require('../models/Footer');
// const { cloudinary } = require('../config/cloudinary');

// // ============================================================
// // 1. GET FOOTER DATA
// // ============================================================

// // @desc    Get footer data (public)
// // @route   GET /api/footer
// // @access  Public
// const getPublicFooter = async (req, res) => {
//   try {
//     const footer = await Footer.findOne({ isActive: true });
    
//     if (!footer) {
//       return res.status(404).json({
//         success: false,
//         error: 'Footer not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: footer
//     });
//   } catch (error) {
//     console.error('Get public footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching footer'
//     });
//   }
// };

// // @desc    Get footer data (admin)
// // @route   GET /api/admin/footer
// // @access  Private (Admin)
// const getAdminFooter = async (req, res) => {
//   try {
//     let footer = await Footer.findOne();
    
//     if (!footer) {
//       // Create default footer if none exists
//       footer = await createDefaultFooter(req.user.id);
//     }

//     res.json({
//       success: true,
//       data: footer
//     });
//   } catch (error) {
//     console.error('Get admin footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching footer'
//     });
//   }
// };

// // ============================================================
// // 2. CREATE FOOTER
// // ============================================================

// // @desc    Create footer
// // @route   POST /api/admin/footer
// // @access  Private (Admin)
// const createFooter = async (req, res) => {
//   try {
//     // Check if footer already exists
//     const existingFooter = await Footer.findOne();
//     if (existingFooter) {
//       return res.status(400).json({
//         success: false,
//         error: 'Footer already exists. Use PUT to update.'
//       });
//     }

//     const footerData = req.body;
//     footerData.updatedBy = req.user.id;

//     const footer = await Footer.create(footerData);

//     res.status(201).json({
//       success: true,
//       data: footer,
//       message: 'Footer created successfully'
//     });
//   } catch (error) {
//     console.error('Create footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while creating footer'
//     });
//   }
// };

// // ============================================================
// // 3. UPDATE FOOTER
// // ============================================================

// // @desc    Update footer
// // @route   PUT /api/admin/footer
// // @access  Private (Admin)
// const updateFooter = async (req, res) => {
//   try {
//     let footer = await Footer.findOne();
    
//     if (!footer) {
//       // Create new footer if doesn't exist
//       footer = await createDefaultFooter(req.user.id);
//     }

//     const footerData = req.body;
    
//     // Update fields
//     if (footerData.company) {
//       footer.company = {
//         ...footer.company.toObject(),
//         ...footerData.company
//       };
//     }
    
//     if (footerData.columns) {
//       footer.columns = footerData.columns;
//     }
    
//     if (footerData.trustBadges) {
//       footer.trustBadges = footerData.trustBadges;
//     }
    
//     if (footerData.paymentMethods) {
//       footer.paymentMethods = footerData.paymentMethods;
//     }
    
//     if (footerData.footerText !== undefined) {
//       footer.footerText = footerData.footerText;
//     }
    
//     if (footerData.showCopyright !== undefined) {
//       footer.showCopyright = footerData.showCopyright;
//     }
    
//     if (footerData.showTrustBadges !== undefined) {
//       footer.showTrustBadges = footerData.showTrustBadges;
//     }
    
//     if (footerData.showPaymentMethods !== undefined) {
//       footer.showPaymentMethods = footerData.showPaymentMethods;
//     }
    
//     if (footerData.isActive !== undefined) {
//       footer.isActive = footerData.isActive;
//     }

//     footer.updatedBy = req.user.id;
//     await footer.save();

//     res.json({
//       success: true,
//       data: footer,
//       message: 'Footer updated successfully'
//     });
//   } catch (error) {
//     console.error('Update footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating footer'
//     });
//   }
// };

// // ============================================================
// // 4. DELETE FOOTER
// // ============================================================

// // @desc    Delete footer (soft delete - deactivate)
// // @route   DELETE /api/admin/footer
// // @access  Private (Admin)
// const deleteFooter = async (req, res) => {
//   try {
//     const footer = await Footer.findOne();
    
//     if (!footer) {
//       return res.status(404).json({
//         success: false,
//         error: 'Footer not found'
//       });
//     }

//     // Soft delete - deactivate instead of hard delete
//     footer.isActive = false;
//     footer.updatedBy = req.user.id;
//     await footer.save();

//     res.json({
//       success: true,
//       message: 'Footer deactivated successfully'
//     });
//   } catch (error) {
//     console.error('Delete footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while deleting footer'
//     });
//   }
// };

// // ============================================================
// // 5. ACTIVATE/DEACTIVATE FOOTER
// // ============================================================

// // @desc    Toggle footer status
// // @route   PUT /api/admin/footer/toggle
// // @access  Private (Admin)
// const toggleFooterStatus = async (req, res) => {
//   try {
//     const footer = await Footer.findOne();
    
//     if (!footer) {
//       return res.status(404).json({
//         success: false,
//         error: 'Footer not found'
//       });
//     }

//     footer.isActive = !footer.isActive;
//     footer.updatedBy = req.user.id;
//     await footer.save();

//     res.json({
//       success: true,
//       data: footer,
//       message: `Footer ${footer.isActive ? 'activated' : 'deactivated'} successfully`
//     });
//   } catch (error) {
//     console.error('Toggle footer status error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while toggling footer status'
//     });
//   }
// };

// // ============================================================
// // 6. RESET TO DEFAULT
// // ============================================================

// // @desc    Reset footer to default
// // @route   POST /api/admin/footer/reset
// // @access  Private (Admin)
// const resetFooter = async (req, res) => {
//   try {
//     // Delete existing footer
//     await Footer.deleteOne({});
    
//     // Create default footer
//     const footer = await createDefaultFooter(req.user.id);

//     res.json({
//       success: true,
//       data: footer,
//       message: 'Footer reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting footer'
//     });
//   }
// };

// // ============================================================
// // 7. UPLOAD LOGO
// // ============================================================

// // @desc    Upload logo
// // @route   POST /api/admin/footer/upload-logo
// // @access  Private (Admin)
// const uploadLogo = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: 'No logo image provided'
//       });
//     }

//     // Get existing footer to delete old logo
//     const footer = await Footer.findOne();
//     if (footer && footer.company && footer.company.logoPublicId) {
//       try {
//         await cloudinary.uploader.destroy(footer.company.logoPublicId);
//       } catch (error) {
//         console.error('Error deleting old logo:', error);
//         // Continue even if deletion fails
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         url: req.file.path,
//         publicId: req.file.filename
//       },
//       message: 'Logo uploaded successfully'
//     });
//   } catch (error) {
//     console.error('Upload logo error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while uploading logo'
//     });
//   }
// };

// // ============================================================
// // 8. HELPER FUNCTIONS
// // ============================================================

// // Helper: Generate unique ID
// const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

// // Helper: Create default footer
// const createDefaultFooter = async (userId) => {
//   const defaultFooter = {
//     company: {
//       name: 'Smart Gadget',
//       tagline: 'Premium Gadgets at Your Fingertips',
//       description: 'Discover the latest technology with premium quality gadgets, expert support, and fast delivery across Bangladesh.',
//       address: 'Dhaka, Bangladesh',
//       phone: '+880 1XXXXXXXXX',
//       email: 'support@smartproductbuy.com',
//       hours: 'Always Open • 24/7 Online Ordering • Quick Response',
//       logoUrl: '',
//       logoPublicId: ''
//     },
//     columns: [
//       {
//         id: generateId(),
//         title: 'Quick Links',
//         type: 'links',
//         items: [
//           { id: generateId(), label: 'Home', url: '/' },
//           { id: generateId(), label: 'Products', url: '/products' },
//           { id: generateId(), label: 'Track Order', url: '/track' },
//           { id: generateId(), label: 'About Us', url: '/about' },
//         ]
//       },
//       {
//         id: generateId(),
//         title: 'Support',
//         type: 'support',
//         items: [
//           { id: generateId(), label: 'Contact Us', url: '/contact' },
//           { id: generateId(), label: 'Terms & Conditions', url: '/terms' },
//           { id: generateId(), label: 'Privacy Policy', url: '/privacy' },
//         ],
//         socialLinks: [
//           { platform: 'facebook', url: 'https://facebook.com', active: true },
//           { platform: 'youtube', url: 'https://youtube.com', active: true },
//         ]
//       },
//       {
//         id: generateId(),
//         title: 'Contact Us',
//         type: 'contact',
//         items: [
//           { id: generateId(), type: 'address', label: 'Address', value: 'Dhaka, Bangladesh' },
//           { id: generateId(), type: 'phone', label: 'Phone', value: '+880 1XXXXXXXXX' },
//           { id: generateId(), type: 'email', label: 'Email', value: 'support@smartproductbuy.com' },
//           { id: generateId(), type: 'hours', label: 'Hours', value: 'Always Open • 24/7 Online Ordering' },
//         ]
//       },
//       {
//         id: generateId(),
//         title: 'Connect With Us',
//         type: 'social',
//         items: [],
//         socialLinks: [
//           { platform: 'facebook', url: 'https://facebook.com', active: true },
//           { platform: 'youtube', url: 'https://youtube.com', active: true },
//         ]
//       }
//     ],
//     trustBadges: [
//       { type: 'authentic', label: '100% Authentic', active: true },
//       { type: 'warranty', label: 'Official Warranty', active: true },
//       { type: 'delivery', label: 'Fast Delivery', active: true },
//     ],
//     paymentMethods: [
//       { method: 'visa', active: true },
//       { method: 'mastercard', active: true },
//       { method: 'paypal', active: true },
//       { method: 'applepay', active: true },
//     ],
//     footerText: 'All rights reserved.',
//     showCopyright: true,
//     showTrustBadges: true,
//     showPaymentMethods: true,
//     isActive: true,
//     updatedBy: userId
//   };

//   return await Footer.create(defaultFooter);
// };

// // ============================================================
// // 9. EXPORT CONTROLLERS
// // ============================================================

// module.exports = {
//   getPublicFooter,
//   getAdminFooter,
//   createFooter,
//   updateFooter,
//   deleteFooter,
//   toggleFooterStatus,
//   resetFooter,
//   uploadLogo
// };


// backend/src/controllers/footerController.js
const Footer = require('../models/Footer');
const { cloudinary } = require('../config/cloudinary');

// ============================================================
// 1. GET FOOTER DATA
// ============================================================

const getPublicFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne({ isActive: true });
    
    if (!footer) {
      footer = await createDefaultFooter(null);
    }

    res.json({
      success: true,
      data: footer
    });
  } catch (error) {
    console.error('Get public footer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching footer'
    });
  }
};

const getAdminFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    
    if (!footer) {
      footer = await createDefaultFooter(req.user.id);
    }

    res.json({
      success: true,
      data: footer
    });
  } catch (error) {
    console.error('Get admin footer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching footer'
    });
  }
};

// @desc    Create footer
const createFooter = async (req, res) => {
  try {
    const existingFooter = await Footer.findOne();
    if (existingFooter) {
      return res.status(400).json({
        success: false,
        error: 'Footer already exists. Use PUT to update.'
      });
    }

    const footerData = req.body;
    footerData.updatedBy = req.user.id;

    const footer = await Footer.create(footerData);

    res.status(201).json({
      success: true,
      data: footer,
      message: 'Footer created successfully'
    });
  } catch (error) {
    console.error('Create footer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating footer'
    });
  }
};

// @desc    Update footer
const updateFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    
    if (!footer) {
      footer = await createDefaultFooter(req.user.id);
    }

    const footerData = req.body;
    
    if (footerData.backgroundImage !== undefined) {
      footer.backgroundImage = footerData.backgroundImage;
    }
    
    if (footerData.backgroundPublicId !== undefined) {
      footer.backgroundPublicId = footerData.backgroundPublicId;
    }
    
    if (footerData.company) {
      footer.company = {
        ...footer.company.toObject(),
        ...footerData.company
      };
    }
    
    if (footerData.columns) {
      footer.columns = footerData.columns;
    }
    
    if (footerData.trustBadges) {
      footer.trustBadges = footerData.trustBadges;
    }
    
    if (footerData.paymentMethods) {
      footer.paymentMethods = footerData.paymentMethods;
    }
    
    if (footerData.footerText !== undefined) {
      footer.footerText = footerData.footerText;
    }
    
    if (footerData.showCopyright !== undefined) {
      footer.showCopyright = footerData.showCopyright;
    }
    
    if (footerData.showTrustBadges !== undefined) {
      footer.showTrustBadges = footerData.showTrustBadges;
    }
    
    if (footerData.showPaymentMethods !== undefined) {
      footer.showPaymentMethods = footerData.showPaymentMethods;
    }
    
    if (footerData.isActive !== undefined) {
      footer.isActive = footerData.isActive;
    }

    footer.updatedBy = req.user.id;
    await footer.save();

    res.json({
      success: true,
      data: footer,
      message: 'Footer updated successfully'
    });
  } catch (error) {
    console.error('Update footer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating footer'
    });
  }
};

// @desc    Delete footer (soft delete)
const deleteFooter = async (req, res) => {
  try {
    const footer = await Footer.findOne();
    
    if (!footer) {
      return res.status(404).json({
        success: false,
        error: 'Footer not found'
      });
    }

    footer.isActive = false;
    footer.updatedBy = req.user.id;
    await footer.save();

    res.json({
      success: true,
      message: 'Footer deactivated successfully'
    });
  } catch (error) {
    console.error('Delete footer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting footer'
    });
  }
};

// @desc    Toggle footer status
const toggleFooterStatus = async (req, res) => {
  try {
    const footer = await Footer.findOne();
    
    if (!footer) {
      return res.status(404).json({
        success: false,
        error: 'Footer not found'
      });
    }

    footer.isActive = !footer.isActive;
    footer.updatedBy = req.user.id;
    await footer.save();

    res.json({
      success: true,
      data: footer,
      message: `Footer ${footer.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle footer status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling footer status'
    });
  }
};

// @desc    Reset footer to default
const resetFooter = async (req, res) => {
  try {
    await Footer.deleteMany({});
    const footer = await createDefaultFooter(req.user.id);

    res.json({
      success: true,
      data: footer,
      message: 'Footer reset to default successfully'
    });
  } catch (error) {
    console.error('Reset footer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting footer'
    });
  }
};

// @desc    Upload background image
const uploadBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No background image provided'
      });
    }

    const footer = await Footer.findOne();
    if (footer && footer.backgroundPublicId) {
      try {
        await cloudinary.uploader.destroy(footer.backgroundPublicId);
      } catch (error) {
        console.error('Error deleting old background:', error);
      }
    }

    res.json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename
      },
      message: 'Background image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload background error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while uploading background'
    });
  }
};

// @desc    Upload logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No logo image provided'
      });
    }

    const footer = await Footer.findOne();
    if (footer && footer.company && footer.company.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(footer.company.logoPublicId);
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }

    res.json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename
      },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while uploading logo'
    });
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

const createDefaultFooter = async (userId) => {
  const defaultFooter = {
    backgroundImage: '',
    backgroundPublicId: '',
    company: {
      name: 'Beauty Bucket',
      tagline: 'Premium Beauty Essentials',
      description: 'Discover premium beauty products with expert care, fast delivery, and a touch of luxury across Bangladesh.',
      address: 'Dhaka, Bangladesh',
      phone: '+880 1XXXXXXXXX',
      email: 'support@beautybucket.com',
      hours: 'Always Open • 24/7 Online Ordering • Quick Response',
      logoUrl: '/images/logo3.png',
      logoPublicId: ''
    },
    columns: [
      {
        id: generateId(),
        title: 'Company',
        type: 'links',
        items: [
          { id: generateId(), label: 'Home', url: '/' },
          { id: generateId(), label: 'Products', url: '/products' },
          { id: generateId(), label: 'Track Order', url: '/track' },
          { id: generateId(), label: 'About Us', url: '/about' },
        ]
      },
      {
        id: generateId(),
        title: 'Support',
        type: 'support',
        items: [
          { id: generateId(), label: 'Contact Us', url: '/contact' },
          { id: generateId(), label: 'Register', url: '/register' },
          { id: generateId(), label: 'Terms & Conditions', url: '/terms' },
          { id: generateId(), label: 'Privacy Policy', url: '/privacy' },
        ],
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com/beautybucket', active: true },
          { platform: 'instagram', url: 'https://instagram.com/beautybucket', active: true },
          { platform: 'youtube', url: 'https://youtube.com/beautybucket', active: true },
        ]
      },
      {
        id: generateId(),
        title: 'Contact Us',
        type: 'contact',
        items: [
          { id: generateId(), type: 'address', label: 'Address', value: 'Dhaka, Bangladesh' },
          { id: generateId(), type: 'phone', label: 'Phone', value: '+880 1XXXXXXXXX' },
          { id: generateId(), type: 'email', label: 'Email', value: 'support@beautybucket.com' },
          { id: generateId(), type: 'hours', label: 'Hours', value: 'Always Open • 24/7 Online Ordering' },
        ]
      }
    ],
    trustBadges: [
      { type: 'authentic', label: '100% Authentic', active: true },
      { type: 'warranty', label: 'Official Warranty', active: true },
      { type: 'delivery', label: 'Fast Delivery', active: true },
    ],
    paymentMethods: [
      { method: 'visa', active: true },
      { method: 'mastercard', active: true },
      { method: 'bkash', active: true },
      { method: 'nagad', active: true },
    ],
    footerText: 'All rights reserved.',
    showCopyright: true,
    showTrustBadges: true,
    showPaymentMethods: true,
    isActive: true,
    updatedBy: userId
  };

  return await Footer.create(defaultFooter);
};

module.exports = {
  getPublicFooter,
  getAdminFooter,
  createFooter,
  updateFooter,
  deleteFooter,
  toggleFooterStatus,
  resetFooter,
  uploadBackground,
  uploadLogo
};