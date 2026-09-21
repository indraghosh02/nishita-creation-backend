

// // backend/src/models/About.js
// const mongoose = require('mongoose');

// // ============================================================
// // STATS SCHEMA
// // ============================================================

// // Stats Item Schema (max 4 items)
// const statItemSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaAward', 'FaUsers', 'GiLipstick', 'FaStar', 'FaHeart', 'FaLeaf', 'FaShieldAlt'],
//     default: 'FaAward'
//   },
//   value: {
//     type: String,
//     trim: true,
//     default: '0'
//   },
//   label: {
//     type: String,
//     trim: true,
//     default: 'Stat'
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// // Stats Schema with background image
// const statsSchema = new mongoose.Schema({
//   backgroundImage: {
//     type: String,
//     default: '/images/bg5.PNG'
//   },
//   items: {
//     type: [statItemSchema],
//     default: []
//   }
// });

// // ============================================================
// // VALUE SCHEMA
// // ============================================================

// const valueItemSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaHeart', 'FaLeaf', 'FaShieldAlt', 'FaUsers', 'FaGem', 'FaHands', 'FaSeedling'],
//     default: 'FaHeart'
//   },
//   title: {
//     type: String,
//     trim: true,
//     default: 'Value'
//   },
//   description: {
//     type: String,
//     trim: true,
//     default: 'Description'
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// // ============================================================
// // MILESTONE SCHEMA
// // ============================================================

// const milestoneItemSchema = new mongoose.Schema({
//   year: {
//     type: String,
//     trim: true,
//     default: '2024'
//   },
//   title: {
//     type: String,
//     trim: true,
//     default: 'Milestone'
//   },
//   description: {
//     type: String,
//     trim: true,
//     default: 'Description'
//   },
//   icon: {
//     type: String,
//     enum: ['FaRocket', 'FaStore', 'FaGlobe', 'FaTrophy', 'FaUsers', 'FaCalendarAlt', 'FaMapMarkerAlt'],
//     default: 'FaRocket'
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// // ============================================================
// // STORY IMAGE SCHEMA
// // ============================================================

// const storyImageSchema = new mongoose.Schema({
//   src: {
//     type: String,
//     default: ''
//   },
//   alt: {
//     type: String,
//     default: 'Story image'
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// // ============================================================
// // TRUST INDICATOR SCHEMA
// // ============================================================

// const trustIndicatorSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaCheckCircle', 'FaShippingFast', 'FaGift', 'FaSmile', 'FaStar', 'FaUsers', 'FaAward'],
//     default: 'FaCheckCircle'
//   },
//   label: {
//     type: String,
//     trim: true,
//     default: 'Trust Indicator'
//   }
// });

// // ============================================================
// // STORY SCHEMA
// // ============================================================

// const storySchema = new mongoose.Schema({
//   badge: {
//     type: String,
//     default: 'Our Story'
//   },
//   title: {
//     type: String,
//     default: 'A Journey of Beauty & Trust'
//   },
//   paragraphs: {
//     type: [String],
//     default: []
//   },
//   trustIndicators: {
//     type: [trustIndicatorSchema],
//     default: []
//   },
//   images: {
//     type: [storyImageSchema],
//     default: []
//   }
// });

// // ============================================================
// // HERO SCHEMA
// // ============================================================

// const heroSchema = new mongoose.Schema({
//   image: {
//     type: String,
//     default: '/images/bg1.png'
//   },
//   overlayImage: {
//     type: String,
//     default: '/images/bg2.jpg'
//   },
//   badge: {
//     type: String,
//     default: 'About Us'
//   },
//   title: {
//     type: String,
//     default: 'Redefining Beauty'
//   },
//   highlightedText: {
//     type: String,
//     default: 'for Everyone'
//   },
//   description: {
//     type: String,
//     default: 'We believe beauty is for everyone. Our mission is to bring you the finest beauty products with expert care, fast delivery, and a touch of luxury.'
//   },
//   buttonText: {
//     type: String,
//     default: 'Explore Products'
//   },
//   buttonLink: {
//     type: String,
//     default: '/products'
//   },
//   secondaryButtonText: {
//     type: String,
//     default: 'Get in Touch'
//   },
//   secondaryButtonLink: {
//     type: String,
//     default: '/contact'
//   }
// });

// // ============================================================
// // CTA SCHEMA
// // ============================================================

// const ctaSchema = new mongoose.Schema({
//   image: {
//     type: String,
//     default: '/images/pattern.png'
//   },
//   title: {
//     type: String,
//     default: 'Ready to Start Your Beauty Journey?'
//   },
//   description: {
//     type: String,
//     default: 'Explore our curated collection of premium beauty products and find your perfect match.'
//   },
//   buttonText: {
//     type: String,
//     default: 'Shop Now'
//   },
//   buttonLink: {
//     type: String,
//     default: '/products'
//   },
//   secondaryButtonText: {
//     type: String,
//     default: 'Contact Us'
//   },
//   secondaryButtonLink: {
//     type: String,
//     default: '/contact'
//   }
// });

// // ============================================================
// // MAIN ABOUT SCHEMA
// // ============================================================

// const aboutSchema = new mongoose.Schema({
//   // Hero Section
//   hero: {
//     type: heroSchema,
//     default: () => ({})
//   },

//   // Stats Section (with background image)
//   stats: {
//     type: statsSchema,
//     default: () => ({})
//   },

//   // Story Section
//   story: {
//     type: storySchema,
//     default: () => ({})
//   },

//   // Values Section
//   values: {
//     type: [valueItemSchema],
//     default: []
//   },

//   // Milestones Section
//   milestones: {
//     type: [milestoneItemSchema],
//     default: []
//   },

//   // CTA Section
//   cta: {
//     type: ctaSchema,
//     default: () => ({})
//   },

//   isActive: {
//     type: Boolean,
//     default: true
//   },
  
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // ============================================================
// // INDEXES
// // ============================================================

// aboutSchema.index({ isActive: 1 });
// aboutSchema.index({ updatedAt: -1 });

// // ============================================================
// // EXPORT
// // ============================================================

// module.exports = mongoose.model('About', aboutSchema);

// backend/src/models/About.js
const mongoose = require('mongoose');

// ============================================================
// STATS SCHEMA
// ============================================================

const statItemSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: ['FaAward', 'FaUsers', 'GiLipstick', 'FaStar', 'FaHeart', 'FaLeaf', 'FaShieldAlt'],
    default: 'FaAward'
  },
  value: {
    type: String,
    trim: true,
    default: '0'
  },
  label: {
    type: String,
    trim: true,
    default: 'Stat'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const statsSchema = new mongoose.Schema({
  backgroundImage: {
    type: String,
    default: '/images/bg5.PNG'
  },
  items: {
    type: [statItemSchema],
    default: []
  }
});

// ============================================================
// WHY CHOOSE US SCHEMA
// ============================================================

const whyChooseUsSchema = new mongoose.Schema({
  backgroundImage: {
    type: String,
    default: '/images/bg5.PNG'
  },
  badge: {
    type: String,
    default: 'Why Choose Us'
  },
  title: {
    type: String,
    default: 'Beauty Is Power, A Smile Is Its Word'
  },
  description: {
    type: String,
    default: 'We believe that true beauty starts from within. Our carefully selected products are designed to help you feel confident, radiant, and completely yourself.'
  },
  buttonText: {
    type: String,
    default: 'Explore More'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  cards: [{
    icon: {
      type: String,
      enum: ['FaLeaf', 'FaHeart', 'FaShieldAlt', 'FaTruck', 'FaStar', 'FaUsers', 'FaAward', 'GiSparkles'],
      default: 'FaLeaf'
    },
    title: {
      type: String,
      trim: true,
      default: 'Card Title'
    },
    description: {
      type: String,
      trim: true,
      default: 'Card description'
    }
  }]
});

// ============================================================
// STORY SCHEMA
// ============================================================

const storyImageSchema = new mongoose.Schema({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Story image'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const trustIndicatorSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: ['FaCheckCircle', 'FaShippingFast', 'FaGift', 'FaSmile', 'FaStar', 'FaUsers', 'FaAward'],
    default: 'FaCheckCircle'
  },
  label: {
    type: String,
    trim: true,
    default: 'Trust Indicator'
  }
});

const storySchema = new mongoose.Schema({
  badge: {
    type: String,
    default: 'Our Story'
  },
  title: {
    type: String,
    default: 'A Journey of Beauty & Trust'
  },
  paragraphs: {
    type: [String],
    default: []
  },
  trustIndicators: {
    type: [trustIndicatorSchema],
    default: []
  },
  images: {
    type: [storyImageSchema],
    default: []
  }
});

// ============================================================
// HERO SCHEMA - Simplified (Only Left & Right Images)
// ============================================================

const heroSchema = new mongoose.Schema({
  leftImage: {
    type: String,
    default: '/images/bg1.png'
  },
  rightImage: {
    type: String,
    default: '/images/bg8.png'
  },
  badge: {
    type: String,
    default: 'About Us'
  },
  title: {
    type: String,
    default: 'Redefining Beauty'
  },
  highlightedText: {
    type: String,
    default: 'for Everyone'
  },
  description: {
    type: String,
    default: 'We believe beauty is for everyone. Our mission is to bring you the finest beauty products with expert care, fast delivery, and a touch of luxury.'
  },
  buttonText: {
    type: String,
    default: 'Explore Products'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  secondaryButtonText: {
    type: String,
    default: 'Get in Touch'
  },
  secondaryButtonLink: {
    type: String,
    default: '/contact'
  }
});

// ============================================================
// CURATED FOR YOU SCHEMA
// ============================================================

const curatedForYouSchema = new mongoose.Schema({
  badge: {
    type: String,
    default: 'Curated For You'
  },
  title: {
    type: String,
    default: 'Beauty, Curated For You'
  },
  description: {
    type: String,
    default: 'Discover our handpicked collection of premium beauty products, carefully selected to enhance your natural beauty.'
  },
  buttonText: {
    type: String,
    default: 'View All Products'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ============================================================
// CTA SCHEMA
// ============================================================

const ctaSchema = new mongoose.Schema({
  backgroundImage: {
    type: String,
    default: '/images/cta-bg.jpg'
  },
  title: {
    type: String,
    default: "We're Here to Help"
  },
  description: {
    type: String,
    default: 'Our beauty experts are ready to assist you with any questions about products or orders.'
  },
  buttonText: {
    type: String,
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  secondaryButtonText: {
    type: String,
    default: 'Contact Us'
  },
  secondaryButtonLink: {
    type: String,
    default: '/contact'
  }
});

// ============================================================
// MAIN ABOUT SCHEMA
// ============================================================

const aboutSchema = new mongoose.Schema({
  hero: {
    type: heroSchema,
    default: () => ({})
  },
  stats: {
    type: statsSchema,
    default: () => ({})
  },
  story: {
    type: storySchema,
    default: () => ({})
  },
  whyChooseUs: {
    type: whyChooseUsSchema,
    default: () => ({})
  },
  curatedForYou: {
    type: curatedForYouSchema,
    default: () => ({})
  },
  cta: {
    type: ctaSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

aboutSchema.index({ isActive: 1 });
aboutSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('About', aboutSchema);