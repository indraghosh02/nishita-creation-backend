

// // backend/src/controllers/aboutController.js
// const About = require('../models/About');

// // @desc    Get public about data
// // @route   GET /api/about/page
// // @access  Public
// const getPublicAbout = async (req, res) => {
//   try {
//     let about = await About.findOne({ isActive: true });
    
//     if (!about) {
//       about = await createDefaultAbout();
//     }

//     // Filter active items
//     const activeStats = about.stats?.items?.filter(s => s.isActive !== false) || [];
//     const activeValues = about.values?.filter(v => v.isActive !== false) || [];
//     const activeMilestones = about.milestones?.filter(m => m.isActive !== false) || [];
//     const activeImages = about.story?.images?.filter(i => i.isActive !== false) || [];

//     // ✅ Ensure story data has all required fields with defaults
//     const storyData = {
//       badge: about.story?.badge || 'Our Story',
//       title: about.story?.title || 'A Journey of Beauty & Trust',
//       paragraphs: about.story?.paragraphs?.length > 0 ? about.story.paragraphs : [
//         'BeautyBucket was founded with a simple yet powerful vision: to make premium beauty products accessible to everyone in Bangladesh. What started as a passion project has grown into a trusted destination for beauty enthusiasts.',
//         'We carefully curate each product in our collection, ensuring only the highest quality, authentic, and effective products make it to our shelves. From skincare to makeup, we bring you the best from around the world.',
//         'Our commitment to quality, transparency, and customer satisfaction has made us a beloved brand among thousands of customers across the country.'
//       ],
//       trustIndicators: about.story?.trustIndicators?.length > 0 ? about.story.trustIndicators : [
//         { icon: 'FaCheckCircle', label: 'Quality Assured' },
//         { icon: 'FaShippingFast', label: 'Fast Delivery' },
//         { icon: 'FaGift', label: 'Shipping Across the Country' },
//         { icon: 'FaSmile', label: '100% Satisfaction' }
//       ],
//       images: activeImages.sort((a, b) => a.displayOrder - b.displayOrder)
//     };

//     // ✅ Ensure values is always an array
//     const valuesData = Array.isArray(activeValues) ? activeValues : [];
    
//     // ✅ Ensure milestones is always an array
//     const milestonesData = Array.isArray(activeMilestones) ? activeMilestones : [];

//     res.json({
//       success: true,
//       data: {
//         hero: about.hero || {},
//         stats: {
//           backgroundImage: about.stats?.backgroundImage || '/images/bg5.PNG',
//           items: activeStats.sort((a, b) => a.displayOrder - b.displayOrder)
//         },
//         story: storyData,
//         values: valuesData,
//         milestones: milestonesData,
//         cta: about.cta || {}
//       }
//     });
//   } catch (error) {
//     console.error('Get public about error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching about data'
//     });
//   }
// };

// // @desc    Get admin about data
// // @route   GET /api/admin/about
// // @access  Private (Admin/Moderator)
// const getAdminAbout = async (req, res) => {
//   try {
//     let about = await About.findOne();
    
//     if (!about) {
//       about = await createDefaultAbout();
//     }

//     res.json({
//       success: true,
//       data: about
//     });
//   } catch (error) {
//     console.error('Get admin about error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching about data'
//     });
//   }
// };

// // @desc    Update about data
// // @route   PUT /api/admin/about
// // @access  Private (Admin/Moderator)
// const updateAbout = async (req, res) => {
//   try {
//     let about = await About.findOne();
    
//     if (!about) {
//       about = await createDefaultAbout();
//     }

//     const {
//       hero,
//       stats,
//       story,
//       values,
//       milestones,
//       cta,
//       isActive
//     } = req.body;

//     // Update fields
//     if (hero) about.hero = hero;
//     if (stats) about.stats = stats;
//     if (story) about.story = story;
//     if (values) about.values = values;
//     if (milestones) about.milestones = milestones;
//     if (cta) about.cta = cta;
//     if (isActive !== undefined) about.isActive = isActive;

//     about.updatedBy = req.user.id;
//     await about.save();

//     const updatedAbout = await About.findById(about._id);

//     res.json({
//       success: true,
//       data: updatedAbout,
//       message: 'About page updated successfully'
//     });
//   } catch (error) {
//     console.error('Update about error:', error);
    
//     if (error.name === 'ValidationError') {
//       const errorMessages = [];
//       for (const [path, err] of Object.entries(error.errors)) {
//         const fieldName = path.split('.').pop().replace(/([A-Z])/g, ' $1').toLowerCase();
//         errorMessages.push(`The "${fieldName}" field is required.`);
//       }
      
//       return res.status(400).json({
//         success: false,
//         error: errorMessages.join(' '),
//         details: errorMessages
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update about page. Please try again.',
//       details: error.message
//     });
//   }
// };

// // @desc    Reset about to default
// // @route   POST /api/admin/about/reset
// // @access  Private (Admin/Moderator)
// const resetAbout = async (req, res) => {
//   try {
//     console.log('🔄 Resetting about to default by:', req.user?.email, '(Role:', req.user?.role, ')');
    
//     await About.deleteMany({});
//     const about = await createDefaultAbout();

//     res.json({
//       success: true,
//       data: about,
//       message: 'About page reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset about error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting about page'
//     });
//   }
// };

// // @desc    Create default about
// const createDefaultAbout = async () => {
//   const defaultAbout = {
//     hero: {
//       image: '/images/bg1.png',
//       overlayImage: '/images/bg2.jpg',
//       badge: 'About Us',
//       title: 'Redefining Beauty',
//       highlightedText: 'for Everyone',
//       description: 'We believe beauty is for everyone. Our mission is to bring you the finest beauty products with expert care, fast delivery, and a touch of luxury.',
//       buttonText: 'Explore Products',
//       buttonLink: '/products',
//       secondaryButtonText: 'Get in Touch',
//       secondaryButtonLink: '/contact'
//     },
//     stats: {
//       backgroundImage: '/images/bg5.PNG',
//       items: [
//         { 
//           icon: 'FaAward', 
//           value: '50+', 
//           label: 'Premium Brands', 
//           displayOrder: 0, 
//           isActive: true 
//         },
//         { 
//           icon: 'FaUsers', 
//           value: '5K+', 
//           label: 'Happy Customers', 
//           displayOrder: 1, 
//           isActive: true 
//         },
//         { 
//           icon: 'GiLipstick', 
//           value: '500+', 
//           label: 'Products', 
//           displayOrder: 2, 
//           isActive: true 
//         },
//         { 
//           icon: 'FaStar', 
//           value: '98%', 
//           label: 'Satisfaction Rate', 
//           displayOrder: 3, 
//           isActive: true 
//         }
//       ]
//     },
//     story: {
//       badge: 'Our Story',
//       title: 'A Journey of Beauty & Trust',
//       paragraphs: [
//         'BeautyBucket was founded with a simple yet powerful vision: to make premium beauty products accessible to everyone in Bangladesh. What started as a passion project has grown into a trusted destination for beauty enthusiasts.',
//         'We carefully curate each product in our collection, ensuring only the highest quality, authentic, and effective products make it to our shelves. From skincare to makeup, we bring you the best from around the world.',
//         'Our commitment to quality, transparency, and customer satisfaction has made us a beloved brand among thousands of customers across the country.'
//       ],
//       trustIndicators: [
//         { icon: 'FaCheckCircle', label: 'Quality Assured' },
//         { icon: 'FaShippingFast', label: 'Fast Delivery' },
//         { icon: 'FaGift', label: 'Shipping Across the Country' },
//         { icon: 'FaSmile', label: '100% Satisfaction' }
//       ],
//       images: [
//         { src: '/images/about1.jpg', alt: 'Happy customer', displayOrder: 0, isActive: true },
//         { src: '/images/bg6.png', alt: 'Beauty products display', displayOrder: 1, isActive: true },
//         { src: '/images/bg9.PNG', alt: 'Product curation', displayOrder: 2, isActive: true },
//         { src: '/images/bg8.png', alt: 'Beauty team', displayOrder: 3, isActive: true }
//       ]
//     },
//     values: [
//       {
//         icon: 'FaHeart',
//         title: 'Passion for Beauty',
//         description: 'We believe every individual deserves to feel beautiful and confident in their own skin.',
//         displayOrder: 0,
//         isActive: true
//       },
//       {
//         icon: 'FaLeaf',
//         title: 'Natural & Safe',
//         description: 'We prioritize natural ingredients and safety in every product we curate.',
//         displayOrder: 1,
//         isActive: true
//       },
//       {
//         icon: 'FaShieldAlt',
//         title: '100% Authentic',
//         description: 'Every product is sourced directly from trusted brands and verified for authenticity.',
//         displayOrder: 2,
//         isActive: true
//       },
//       {
//         icon: 'FaUsers',
//         title: 'Community First',
//         description: 'We build a community of beauty enthusiasts who support and inspire each other.',
//         displayOrder: 3,
//         isActive: true
//       }
//     ],
//     milestones: [
//       {
//         year: '2020',
//         title: 'Founded',
//         description: 'BeautyBucket was born with a vision to bring premium beauty products to Bangladesh.',
//         icon: 'FaRocket',
//         displayOrder: 0,
//         isActive: true
//       },
//       {
//         year: '2021',
//         title: 'First Store',
//         description: 'Opened our first physical store in Dhaka, bringing beauty closer to our customers.',
//         icon: 'FaStore',
//         displayOrder: 1,
//         isActive: true
//       },
//       {
//         year: '2022',
//         title: 'Online Launch',
//         description: 'Launched our e-commerce platform to serve customers nationwide with ease.',
//         icon: 'FaGlobe',
//         displayOrder: 2,
//         isActive: true
//       },
//       {
//         year: '2023',
//         title: '50+ Brands',
//         description: 'Partnered with over 50 premium beauty brands from around the world.',
//         icon: 'FaTrophy',
//         displayOrder: 3,
//         isActive: true
//       },
//       {
//         year: '2024',
//         title: '5K+ Customers',
//         description: 'Served over 5,000 happy customers across Bangladesh with love and care.',
//         icon: 'FaUsers',
//         displayOrder: 4,
//         isActive: true
//       }
//     ],
//     cta: {
//       image: '/images/pattern.png',
//       title: 'Ready to Start Your Beauty Journey?',
//       description: 'Explore our curated collection of premium beauty products and find your perfect match.',
//       buttonText: 'Shop Now',
//       buttonLink: '/products',
//       secondaryButtonText: 'Contact Us',
//       secondaryButtonLink: '/contact'
//     },
//     isActive: true
//   };

//   return await About.create(defaultAbout);
// };

// module.exports = {
//   getPublicAbout,
//   getAdminAbout,
//   updateAbout,
//   resetAbout
// };


// backend/src/controllers/aboutController.js
const About = require('../models/About');

// @desc    Get public about data
// @route   GET /api/about/page
// @access  Public
const getPublicAbout = async (req, res) => {
  try {
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = await createDefaultAbout();
    }

    // Filter active items
    const activeStats = about.stats?.items?.filter(s => s.isActive !== false) || [];
    const activeImages = about.story?.images?.filter(i => i.isActive !== false) || [];

    const storyData = {
      badge: about.story?.badge || 'Our Story',
      title: about.story?.title || 'A Journey of Beauty & Trust',
      paragraphs: about.story?.paragraphs?.length > 0 ? about.story.paragraphs : [
        'BeautyBucket was founded with a simple yet powerful vision: to make premium beauty products accessible to everyone in Bangladesh.',
        'We carefully curate each product in our collection, ensuring only the highest quality, authentic, and effective products make it to our shelves.',
        'Our commitment to quality, transparency, and customer satisfaction has made us a beloved brand among thousands of customers across the country.'
      ],
      trustIndicators: about.story?.trustIndicators?.length > 0 ? about.story.trustIndicators : [
        { icon: 'FaCheckCircle', label: 'Quality Assured' },
        { icon: 'FaShippingFast', label: 'Fast Delivery' },
        { icon: 'FaGift', label: 'Shipping Across the Country' },
        { icon: 'FaSmile', label: '100% Satisfaction' }
      ],
      images: activeImages.sort((a, b) => a.displayOrder - b.displayOrder)
    };

    // Get categories for curatedForYou section
    const Category = require('../models/Category');
    const categories = await Category.find({ isActive: true })
      .select('name slug image productCount')
      .sort({ name: 1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        hero: about.hero || {},
        stats: {
          backgroundImage: about.stats?.backgroundImage || '/images/bg5.PNG',
          items: activeStats.sort((a, b) => a.displayOrder - b.displayOrder)
        },
        story: storyData,
        whyChooseUs: about.whyChooseUs || {},
        curatedForYou: {
          ...about.curatedForYou || {},
          categories: categories || []
        },
        cta: about.cta || {}
      }
    });
  } catch (error) {
    console.error('Get public about error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching about data'
    });
  }
};

// @desc    Get admin about data
// @route   GET /api/admin/about
// @access  Private (Admin/Moderator)
const getAdminAbout = async (req, res) => {
  try {
    let about = await About.findOne();
    
    if (!about) {
      about = await createDefaultAbout();
    }

    res.json({
      success: true,
      data: about
    });
  } catch (error) {
    console.error('Get admin about error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching about data'
    });
  }
};

// @desc    Update about data
// @route   PUT /api/admin/about
// @access  Private (Admin/Moderator)
const updateAbout = async (req, res) => {
  try {
    let about = await About.findOne();
    
    if (!about) {
      about = await createDefaultAbout();
    }

    const {
      hero,
      stats,
      story,
      whyChooseUs,
      curatedForYou,
      cta,
      isActive
    } = req.body;

    if (hero) about.hero = hero;
    if (stats) about.stats = stats;
    if (story) about.story = story;
    if (whyChooseUs) about.whyChooseUs = whyChooseUs;
    if (curatedForYou) about.curatedForYou = curatedForYou;
    if (cta) about.cta = cta;
    if (isActive !== undefined) about.isActive = isActive;

    about.updatedBy = req.user.id;
    await about.save();

    const updatedAbout = await About.findById(about._id);

    res.json({
      success: true,
      data: updatedAbout,
      message: 'About page updated successfully'
    });
  } catch (error) {
    console.error('Update about error:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = [];
      for (const [path, err] of Object.entries(error.errors)) {
        const fieldName = path.split('.').pop().replace(/([A-Z])/g, ' $1').toLowerCase();
        errorMessages.push(`The "${fieldName}" field is required.`);
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessages.join(' '),
        details: errorMessages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update about page. Please try again.',
      details: error.message
    });
  }
};

// @desc    Reset about to default
// @route   POST /api/admin/about/reset
// @access  Private (Admin/Moderator)
const resetAbout = async (req, res) => {
  try {
    console.log('🔄 Resetting about to default by:', req.user?.email, '(Role:', req.user?.role, ')');
    
    await About.deleteMany({});
    const about = await createDefaultAbout();

    res.json({
      success: true,
      data: about,
      message: 'About page reset to default successfully'
    });
  } catch (error) {
    console.error('Reset about error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting about page'
    });
  }
};

// @desc    Create default about
const createDefaultAbout = async () => {
  const defaultAbout = {
    hero: {
      leftImage: '/images/bg1.png',
      rightImage: '/images/bg8.png',
      badge: 'About Us',
      title: 'Redefining Beauty',
      highlightedText: 'for Everyone',
      description: 'We believe beauty is for everyone. Our mission is to bring you the finest beauty products with expert care, fast delivery, and a touch of luxury.',
      buttonText: 'Explore Products',
      buttonLink: '/products',
      secondaryButtonText: 'Get in Touch',
      secondaryButtonLink: '/contact'
    },
    stats: {
      backgroundImage: '/images/bg5.PNG',
      items: [
        { icon: 'FaAward', value: '50+', label: 'Premium Brands', displayOrder: 0, isActive: true },
        { icon: 'FaUsers', value: '5K+', label: 'Happy Customers', displayOrder: 1, isActive: true },
        { icon: 'GiLipstick', value: '500+', label: 'Products', displayOrder: 2, isActive: true },
        { icon: 'FaStar', value: '98%', label: 'Satisfaction Rate', displayOrder: 3, isActive: true }
      ]
    },
    story: {
      badge: 'Our Story',
      title: 'A Journey of Beauty & Trust',
      paragraphs: [
        'BeautyBucket was founded with a simple yet powerful vision: to make premium beauty products accessible to everyone in Bangladesh.',
        'We carefully curate each product in our collection, ensuring only the highest quality, authentic, and effective products make it to our shelves.',
        'Our commitment to quality, transparency, and customer satisfaction has made us a beloved brand among thousands of customers across the country.'
      ],
      trustIndicators: [
        { icon: 'FaCheckCircle', label: 'Quality Assured' },
        { icon: 'FaShippingFast', label: 'Fast Delivery' },
        { icon: 'FaGift', label: 'Shipping Across the Country' },
        { icon: 'FaSmile', label: '100% Satisfaction' }
      ],
      images: [
        { src: '/images/about1.jpg', alt: 'Happy customer', displayOrder: 0, isActive: true },
        { src: '/images/bg6.png', alt: 'Beauty products display', displayOrder: 1, isActive: true },
        { src: '/images/bg9.PNG', alt: 'Product curation', displayOrder: 2, isActive: true },
        { src: '/images/bg8.png', alt: 'Beauty team', displayOrder: 3, isActive: true }
      ]
    },
    whyChooseUs: {
      backgroundImage: '/images/bg5.PNG',
      badge: 'Why Choose Us',
      title: 'Beauty Is Power, A Smile Is Its Word',
      description: 'We believe that true beauty starts from within. Our carefully selected products are designed to help you feel confident, radiant, and completely yourself.',
      buttonText: 'Explore More',
      buttonLink: '/products',
      cards: [
        {
          icon: 'FaLeaf',
          title: '100% Organic',
          description: 'Carefully selected products made with ingredients you can trust.'
        },
        {
          icon: 'FaHeart',
          title: 'Improve Health',
          description: 'Beauty essentials designed to support your everyday self-care.'
        },
        {
          icon: 'FaShieldAlt',
          title: '100% Authentic',
          description: 'Every product is verified for authenticity and quality.'
        },
        {
          icon: 'FaTruck',
          title: 'Fast Delivery',
          description: 'Quick and reliable delivery right to your doorstep.'
        }
      ]
    },
    curatedForYou: {
      badge: 'Curated For You',
      title: 'Beauty, Curated For You',
      description: 'Discover our handpicked collection of premium beauty products, carefully selected to enhance your natural beauty.',
      buttonText: 'View All Products',
      buttonLink: '/products',
      isActive: true
    },
    cta: {
      backgroundImage: '/images/cta-bg.jpg',
      title: "We're Here to Help",
      description: 'Our beauty experts are ready to assist you with any questions about products or orders.',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      secondaryButtonText: 'Contact Us',
      secondaryButtonLink: '/contact'
    },
    isActive: true
  };

  return await About.create(defaultAbout);
};

module.exports = {
  getPublicAbout,
  getAdminAbout,
  updateAbout,
  resetAbout
};