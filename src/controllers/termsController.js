
// // backend/src/controllers/termsController.js
// const Terms = require('../models/Terms');

// // Helper: Generate section ID
// const generateSectionId = () => {
//   return Math.floor(Math.random() * 1000);
// };

// // @desc    Get terms (public)
// // @route   GET /api/terms
// // @access  Public
// const getPublicTerms = async (req, res) => {
//   try {
//     let terms = await Terms.findOne({ isActive: true });
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     // ONLY show active sections to the public
//     const activeSections = terms.sections.filter(section => section.isActive !== false);
    
//     res.json({
//       success: true,
//       data: {
//         heroTitle: terms.heroTitle,
//         heroDescription: terms.heroDescription,
//         introText: terms.introText,
//         heroImage: terms.heroImage || 'https://i.ibb.co.com/XkF8TGQZ/jn.png',
//         ctaImage: terms.ctaImage || 'https://i.ibb.co.com/0RHQ0thP/jh.png',
//         sections: activeSections.sort((a, b) => a.displayOrder - b.displayOrder),
//         lastUpdated: terms.lastUpdated
//       }
//     });
//   } catch (error) {
//     console.error('Get public terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching terms'
//     });
//   }
// };

// // @desc    Get terms (admin) - SHOW ALL SECTIONS
// // @route   GET /api/admin/terms
// // @access  Private (Admin/Moderator)
// const getAdminTerms = async (req, res) => {
//   try {
//     let terms = await Terms.findOne();
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     const sortedSections = terms.sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
//     terms.sections = sortedSections;

//     console.log('📊 ADMIN API - ALL sections (including inactive):');
//     console.log(`Total: ${terms.sections.length} sections`);

//     res.json({
//       success: true,
//       data: terms
//     });
//   } catch (error) {
//     console.error('Get admin terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching terms'
//     });
//   }
// };

// // @desc    Update terms
// // @route   PUT /api/admin/terms
// // @access  Private (Admin/Moderator)
// const updateTerms = async (req, res) => {
//   try {
//     console.log('📥 Received update request');
    
//     let terms = await Terms.findOne();
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     const { 
//       heroTitle, 
//       heroDescription, 
//       introText,
//       heroImage,
//       ctaImage,
//       sections, 
//       lastUpdated,
//       isActive 
//     } = req.body;

//     if (heroTitle) terms.heroTitle = heroTitle;
//     if (heroDescription) terms.heroDescription = heroDescription;
//     if (introText) terms.introText = introText;
//     if (heroImage) terms.heroImage = heroImage;
//     if (ctaImage) terms.ctaImage = ctaImage;
//     if (lastUpdated) terms.lastUpdated = lastUpdated;
//     if (isActive !== undefined) terms.isActive = isActive;

//     if (sections && Array.isArray(sections)) {
//       const processedSections = sections.map((section, index) => {
//         const isActiveValue = section.isActive !== undefined ? Boolean(section.isActive) : true;
        
//         return {
//           id: section.id || generateSectionId(),
//           title: section.title || 'Untitled Section',
//           icon: section.icon || 'FaFileContract',
//           description: section.description || '',
//           details: section.details || [],
//           isActive: isActiveValue,
//           displayOrder: section.displayOrder !== undefined ? section.displayOrder : index
//         };
//       });
      
//       terms.sections = processedSections;
//     }

//     terms.updatedBy = req.user.id;
//     await terms.save();

//     const updatedTerms = await Terms.findById(terms._id);
    
//     res.json({
//       success: true,
//       data: updatedTerms,
//       message: 'Terms updated successfully'
//     });
//   } catch (error) {
//     console.error('❌ Update terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating terms'
//     });
//   }
// };

// // @desc    Reset terms to default
// // @route   POST /api/admin/terms/reset
// // @access  Private (Admin)
// const resetTerms = async (req, res) => {
//   try {
//     console.log('⚠️ RESETTING TERMS TO DEFAULT');
//     await Terms.deleteOne({});
//     const terms = await createDefaultTerms();

//     res.json({
//       success: true,
//       data: terms,
//       message: 'Terms reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting terms'
//     });
//   }
// };

// // @desc    Get raw database data
// // @route   GET /api/admin/terms/raw-data
// // @access  Private (Admin)
// const getRawData = async (req, res) => {
//   try {
//     const terms = await Terms.findOne().lean();
    
//     if (!terms) {
//       return res.status(404).json({
//         success: false,
//         error: 'No terms data found'
//       });
//     }

//     res.json({
//       success: true,
//       data: terms
//     });
//   } catch (error) {
//     console.error('Error getting raw data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get terms (admin) - FORCED ALL SECTIONS
// // @route   GET /api/admin/terms/all
// // @access  Private (Admin/Moderator)
// const getAdminTermsAll = async (req, res) => {
//   try {
//     let terms = await Terms.findOne();
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     const allSections = terms.sections.map(s => ({
//       ...s.toObject ? s.toObject() : s,
//       isActive: s.isActive
//     }));

//     const sortedSections = allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

//     res.json({
//       success: true,
//       data: {
//         sections: sortedSections,
//         heroTitle: terms.heroTitle,
//         heroDescription: terms.heroDescription,
//         introText: terms.introText,
//         heroImage: terms.heroImage || 'https://i.ibb.co.com/XkF8TGQZ/jn.png',
//         ctaImage: terms.ctaImage || 'https://i.ibb.co.com/0RHQ0thP/jh.png',
//         lastUpdated: terms.lastUpdated,
//         isActive: terms.isActive,
//         _id: terms._id,
//         updatedBy: terms.updatedBy,
//         createdAt: terms.createdAt,
//         updatedAt: terms.updatedAt
//       }
//     });
//   } catch (error) {
//     console.error('Get admin terms all error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching terms'
//     });
//   }
// };

// // @desc    Create default terms - SMART GADGET with images
// const createDefaultTerms = async () => {
//   const defaultTerms = {
//     heroTitle: 'Terms & Conditions',
//     heroDescription: 'Please read these terms carefully before using our website and services. By accessing our platform, you agree to be bound by these terms.',
//     introText: 'Welcome to Smart Gadget. These Terms & Conditions ("Terms") govern your use of the Smart Gadget website, mobile application, and all related services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.',
//     heroImage: 'https://i.ibb.co.com/XkF8TGQZ/jn.png',
//     ctaImage: 'https://i.ibb.co.com/0RHQ0thP/jh.png',
//     lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
//     sections: [
//       {
//         id: 1,
//         title: 'Acceptance of Terms',
//         icon: 'FaFileContract',
//         description: 'By using Smart Gadget\'s website and services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our services.',
//         details: [
//           'These terms apply to all users of the Smart Gadget platform',
//           'By placing an order, you accept these terms in full',
//           'We reserve the right to update these terms at any time',
//           'Continued use constitutes acceptance of updated terms'
//         ],
//         isActive: true,
//         displayOrder: 0
//       },
//       {
//         id: 2,
//         title: 'Account Registration',
//         icon: 'FaUserShield',
//         description: 'You must be at least 18 years old to create an account or make purchases on Smart Gadget.',
//         details: [
//           'Provide accurate, complete, and up-to-date registration information',
//           'You are responsible for maintaining the confidentiality of your account credentials',
//           'Notify us immediately of any unauthorized use of your account'
//         ],
//         isActive: true,
//         displayOrder: 1
//       },
//       {
//         id: 3,
//         title: 'Products & Pricing',
//         icon: 'FaShoppingBag',
//         description: 'Smart Gadget offers premium gadgets and tech accessories sourced from trusted brands and verified for quality and performance.',
//         details: [
//           'All products are 100% authentic and sourced from authorized distributors',
//           'Prices are listed in Bangladeshi Taka (BDT) and include applicable VAT',
//           'We reserve the right to modify prices, products, or availability without notice',
//           'In case of pricing errors, we may cancel or refuse orders at our discretion'
//         ],
//         isActive: true,
//         displayOrder: 2
//       },
//       {
//         id: 4,
//         title: 'Orders & Payment',
//         icon: 'FaCreditCard',
//         description: 'Orders are processed securely with multiple payment options including Cash on Delivery (COD) and online payments.',
//         details: [
//           'All orders are subject to acceptance and availability',
//           'We accept bKash, Nagad, credit/debit cards, and cash on delivery',
//           'Payment must be received in full before order processing begins',
//           'We reserve the right to cancel orders suspected of fraud or unauthorized activity'
//         ],
//         isActive: true,
//         displayOrder: 3
//       },
//       {
//         id: 5,
//         title: 'Shipping & Delivery',
//         icon: 'FaTruck',
//         description: 'We deliver across Bangladesh with fast and reliable shipping services for all gadget orders.',
//         details: [
//           'We offer delivery services across all districts of Bangladesh',
//           'Estimated delivery times are provided as guidelines and are not guaranteed',
//           'Risk of loss or damage passes to you upon delivery of the products',
//           'Please inspect your order immediately and report any issues within 48 hours'
//         ],
//         isActive: true,
//         displayOrder: 4
//       },
//       {
//         id: 6,
//         title: 'Returns & Refunds',
//         icon: 'FaHands',
//         description: 'Customer satisfaction is our priority. You may return most items within 7 days of delivery for a full refund or exchange.',
//         details: [
//           '⚠️ Please inspect the product in front of the delivery person upon arrival',
//           'Items must be unused, in original packaging, and with proof of purchase',
//           'Certain items (e.g., opened electronics, personalized items) are non-returnable',
//           'Refunds will be processed within 5-7 business days of receiving returned items'
//         ],
//         isActive: true,
//         displayOrder: 5
//       },
//       {
//         id: 7,
//         title: 'Intellectual Property',
//         icon: 'FaBalanceScale',
//         description: 'All content on Smart Gadget including logos, images, and text is protected by copyright.',
//         details: [
//           'All content on this site (text, graphics, logos, images, software) is our property',
//           'Content is protected by Bangladesh and international copyright laws',
//           'You may not reproduce, distribute, or create derivative works without permission',
//           'Trademarks and service marks displayed on our site are our registered property'
//         ],
//         isActive: true,
//         displayOrder: 6
//       },
//       {
//         id: 8,
//         title: 'Limitation of Liability',
//         icon: 'FaExclamationTriangle',
//         description: 'Smart Gadget is not liable for any indirect, incidental, or consequential damages.',
//         details: [
//           'Smart Gadget is not liable for indirect, incidental, or consequential damages',
//           'Our total liability is limited to the purchase price of the product in question',
//           'We are not responsible for delays or failures caused by circumstances beyond our control',
//           'Some jurisdictions do not allow limitations on liability, so this may not apply to you'
//         ],
//         isActive: true,
//         displayOrder: 7
//       },
//       {
//         id: 9,
//         title: 'Governing Law & Disputes',
//         icon: 'FaLock',
//         description: 'These terms are governed by the laws of the People\'s Republic of Bangladesh.',
//         details: [
//           'These terms are governed by the laws of the People\'s Republic of Bangladesh',
//           'Any disputes shall be subject to the exclusive jurisdiction of courts in Dhaka',
//           'Disputes may first be attempted to be resolved through informal negotiations',
//           'If mediation fails, disputes will be settled through binding arbitration'
//         ],
//         isActive: true,
//         displayOrder: 8
//       }
//     ],
//     isActive: true
//   };

//   return await Terms.create(defaultTerms);
// };

// module.exports = {
//   getPublicTerms,
//   getAdminTerms,
//   updateTerms,
//   resetTerms,
//   getRawData,
//   getAdminTermsAll
// };


// backend/src/controllers/termsController.js
const Terms = require('../models/Terms');

// Helper: Generate section ID
const generateSectionId = () => {
  return Math.floor(Math.random() * 1000);
};

// @desc    Get terms (public)
// @route   GET /api/terms
// @access  Public
const getPublicTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne({ isActive: true });
    
    if (!terms) {
      terms = await createDefaultTerms();
    }

    // ONLY show active sections to the public
    const activeSections = terms.sections.filter(section => section.isActive !== false);
    
    res.json({
      success: true,
      data: {
        heroTitle: terms.heroTitle || 'Terms & Conditions',
        heroDescription: terms.heroDescription || 'Please read these terms carefully before using our website and services.',
        introText: terms.introText || 'Welcome to BeautyBucket. These Terms & Conditions govern your use of our website and services.',
        heroImage: terms.heroImage || '/images/bg10.jpg',
        ctaImage: terms.ctaImage || '/images/pattern.png',
        sections: activeSections.sort((a, b) => a.displayOrder - b.displayOrder),
        lastUpdated: terms.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Get public terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching terms'
    });
  }
};

// @desc    Get terms (admin) - SHOW ALL SECTIONS
// @route   GET /api/admin/terms
// @access  Private (Admin/Moderator)
const getAdminTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    
    if (!terms) {
      terms = await createDefaultTerms();
    }

    const sortedSections = terms.sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    terms.sections = sortedSections;

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Get admin terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching terms'
    });
  }
};

// @desc    Update terms
// @route   PUT /api/admin/terms
// @access  Private (Admin/Moderator)
const updateTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    
    if (!terms) {
      terms = await createDefaultTerms();
    }

    const { 
      heroTitle, 
      heroDescription, 
      introText,
      heroImage,
      ctaImage,
      sections, 
      lastUpdated,
      isActive 
    } = req.body;

    if (heroTitle) terms.heroTitle = heroTitle;
    if (heroDescription) terms.heroDescription = heroDescription;
    if (introText) terms.introText = introText;
    if (heroImage) terms.heroImage = heroImage;
    if (ctaImage) terms.ctaImage = ctaImage;
    if (lastUpdated) terms.lastUpdated = lastUpdated;
    if (isActive !== undefined) terms.isActive = isActive;

    if (sections && Array.isArray(sections)) {
      const processedSections = sections.map((section, index) => {
        const isActiveValue = section.isActive !== undefined ? Boolean(section.isActive) : true;
        
        return {
          id: section.id || generateSectionId(),
          title: section.title || 'Untitled Section',
          icon: section.icon || 'FaFileContract',
          description: section.description || '',
          details: section.details || [],
          isActive: isActiveValue,
          displayOrder: section.displayOrder !== undefined ? section.displayOrder : index
        };
      });
      
      terms.sections = processedSections;
    }

    terms.updatedBy = req.user.id;
    await terms.save();

    const updatedTerms = await Terms.findById(terms._id);
    
    res.json({
      success: true,
      data: updatedTerms,
      message: 'Terms updated successfully'
    });
  } catch (error) {
    console.error('Update terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating terms'
    });
  }
};

// @desc    Reset terms to default
// @route   POST /api/admin/terms/reset
// @access  Private (Admin)
const resetTerms = async (req, res) => {
  try {
    console.log('⚠️ RESETTING TERMS TO DEFAULT');
    await Terms.deleteMany({});
    const terms = await createDefaultTerms();

    res.json({
      success: true,
      data: terms,
      message: 'Terms reset to default successfully'
    });
  } catch (error) {
    console.error('Reset terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting terms'
    });
  }
};

// @desc    Get raw database data
// @route   GET /api/admin/terms/raw-data
// @access  Private (Admin)
const getRawData = async (req, res) => {
  try {
    const terms = await Terms.findOne().lean();
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        error: 'No terms data found'
      });
    }

    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    console.error('Error getting raw data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get terms (admin) - FORCED ALL SECTIONS
// @route   GET /api/admin/terms/all
// @access  Private (Admin/Moderator)
const getAdminTermsAll = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    
    if (!terms) {
      terms = await createDefaultTerms();
    }

    const allSections = terms.sections.map(s => ({
      ...s.toObject ? s.toObject() : s,
      isActive: s.isActive
    }));

    const sortedSections = allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.json({
      success: true,
      data: {
        sections: sortedSections,
        heroTitle: terms.heroTitle,
        heroDescription: terms.heroDescription,
        introText: terms.introText,
        heroImage: terms.heroImage || '/images/bg10.jpg',
        ctaImage: terms.ctaImage || '/images/pattern.png',
        lastUpdated: terms.lastUpdated,
        isActive: terms.isActive,
        _id: terms._id,
        updatedBy: terms.updatedBy,
        createdAt: terms.createdAt,
        updatedAt: terms.updatedAt
      }
    });
  } catch (error) {
    console.error('Get admin terms all error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching terms'
    });
  }
};

// @desc    Create default terms - BEAUTY BUCKET with images
const createDefaultTerms = async () => {
  const defaultTerms = {
    heroTitle: 'Terms & Conditions',
    heroDescription: 'Please read these terms carefully before using our website and services. By accessing our platform, you agree to be bound by these terms.',
    introText: 'Welcome to BeautyBucket. These Terms & Conditions ("Terms") govern your use of the BeautyBucket website, mobile application, and all related services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.',
    heroImage: '/images/bg10.jpg',
    ctaImage: '/images/pattern.png',
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    sections: [
      {
        id: 1,
        title: 'Acceptance of Terms',
        icon: 'FaFileContract',
        description: 'By using BeautyBucket\'s website and services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our services.',
        details: [
          'These terms apply to all users of the BeautyBucket platform',
          'By placing an order, you accept these terms in full',
          'We reserve the right to update these terms at any time',
          'Continued use constitutes acceptance of updated terms'
        ],
        isActive: true,
        displayOrder: 0
      },
      {
        id: 2,
        title: 'Products & Services',
        icon: 'FaShoppingBag',
        description: 'BeautyBucket offers premium beauty products sourced from trusted brands and verified for authenticity.',
        details: [
          'All products are 100% authentic and sourced from authorized distributors',
          'Product descriptions and images are for illustrative purposes',
          'We reserve the right to modify or discontinue products at any time',
          'Prices are subject to change without prior notice'
        ],
        isActive: true,
        displayOrder: 1
      },
      {
        id: 3,
        title: 'Orders & Payments',
        icon: 'FaCreditCard',
        description: 'Orders are processed securely with multiple payment options including Cash on Delivery (COD) and online payments.',
        details: [
          'All orders are subject to acceptance and availability',
          'Payment must be completed before order processing',
          'Cash on Delivery is available for eligible areas',
          'Online payments are processed through secure gateways'
        ],
        isActive: true,
        displayOrder: 2
      },
      {
        id: 4,
        title: 'Delivery & Shipping',
        icon: 'FaTruck',
        description: 'We deliver across Bangladesh with fast and reliable shipping services.',
        details: [
          'Delivery times vary by location and product availability',
          'Shipping fees are calculated at checkout',
          'Free shipping is available for orders over ৳3000',
          'Tracking information is provided for all shipped orders'
        ],
        isActive: true,
        displayOrder: 3
      },
      {
        id: 5,
        title: 'Returns & Refunds',
        icon: 'FaHands',
        description: 'Customer satisfaction is our priority. We recommend inspecting your products upon delivery to ensure everything meets your expectations.',
        details: [
          'Please inspect the product in front of the delivery person upon arrival',
          'If you find any issues, you can refuse delivery or request an immediate return',
          'For issues noticed after delivery, contact us within 24 hours',
          'All return/refund requests must be submitted within 7 days of delivery',
          'Products must be unused, unopened, and in original packaging',
          'Refunds are processed within 7–10 business days after verification'
        ],
        isActive: true,
        displayOrder: 4
      },
      {
        id: 6,
        title: 'User Accounts',
        icon: 'FaUserShield',
        description: 'Creating an account with BeautyBucket provides you with a personalized shopping experience.',
        details: [
          'You are responsible for maintaining account security',
          'Provide accurate and complete registration information',
          'Notify us immediately of any unauthorized use',
          'We reserve the right to suspend accounts for violations'
        ],
        isActive: true,
        displayOrder: 5
      },
      {
        id: 7,
        title: 'Privacy & Data Protection',
        icon: 'FaLock',
        description: 'Your privacy is important to us. We protect your personal information in accordance with our Privacy Policy.',
        details: [
          'We collect minimal personal data necessary for order processing',
          'Your data is never shared with third parties without consent',
          'SSL encryption protects all transactions',
          'You may request data deletion at any time'
        ],
        isActive: true,
        displayOrder: 6
      },
      {
        id: 8,
        title: 'Intellectual Property',
        icon: 'FaBalanceScale',
        description: 'All content on BeautyBucket including logos, images, and text is protected by copyright.',
        details: [
          'Content is owned by BeautyBucket and its licensors',
          'You may not reproduce, modify, or distribute our content',
          'Trademarks and logos are protected by law',
          'Unauthorized use may result in legal action'
        ],
        isActive: true,
        displayOrder: 7
      },
      {
        id: 9,
        title: 'Limitation of Liability',
        icon: 'FaExclamationTriangle',
        description: 'BeautyBucket is not liable for any indirect, incidental, or consequential damages.',
        details: [
          'We are not responsible for third-party service interruptions',
          'Product descriptions are provided "as is" without warranties',
          'We are not liable for any damages exceeding the order value',
          'Users agree to indemnify BeautyBucket for any violations'
        ],
        isActive: true,
        displayOrder: 8
      }
    ],
    isActive: true
  };

  return await Terms.create(defaultTerms);
};

module.exports = {
  getPublicTerms,
  getAdminTerms,
  updateTerms,
  resetTerms,
  getRawData,
  getAdminTermsAll
};