
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const OrderRestriction = require('../models/OrderRestriction');
const { getCourierIntegration } = require('../lib/couriers/credentials');
const { createCourierOrder, getCourierTracking } = require('../lib/couriers/factory');
const { 
  sendOrderPlacedEmail, 
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdateEmail,
  sendPaymentStatusUpdateEmail
} = require('../utils/orderEmailService');

// ========== HELPER: GET ACCURATE DEVICE INFO ==========
const getAccurateDeviceInfo = (req, clientDeviceInfo = {}) => {
  const userAgent = req.headers['user-agent'] || '';
  
  let os = 'unknown';
  let osVersion = 'unknown';
  
  const osPatterns = [
    { pattern: /windows nt 10.0/i, name: 'Windows', version: '10' },
    { pattern: /windows nt 6.3/i, name: 'Windows', version: '8.1' },
    { pattern: /windows nt 6.2/i, name: 'Windows', version: '8' },
    { pattern: /windows nt 6.1/i, name: 'Windows', version: '7' },
    { pattern: /windows nt 6.0/i, name: 'Windows', version: 'Vista' },
    { pattern: /windows nt 5.1/i, name: 'Windows', version: 'XP' },
    { pattern: /mac os x 10_15_7/i, name: 'macOS', version: 'Catalina' },
    { pattern: /mac os x 10_15/i, name: 'macOS', version: 'Catalina' },
    { pattern: /mac os x 10_14/i, name: 'macOS', version: 'Mojave' },
    { pattern: /mac os x 10_13/i, name: 'macOS', version: 'High Sierra' },
    { pattern: /mac os x 10_12/i, name: 'macOS', version: 'Sierra' },
    { pattern: /mac os x 10_11/i, name: 'macOS', version: 'El Capitan' },
    { pattern: /mac os x/i, name: 'macOS', version: 'Unknown' },
    { pattern: /iphone|ipad|ipod/i, name: 'iOS', version: 'Unknown' },
    { pattern: /android (\d+\.\d+)/i, name: 'Android', version: '$1' },
    { pattern: /android/i, name: 'Android', version: 'Unknown' },
    { pattern: /linux/i, name: 'Linux', version: 'Unknown' },
    { pattern: /chrome os/i, name: 'Chrome OS', version: 'Unknown' },
    { pattern: /ubuntu/i, name: 'Ubuntu', version: 'Unknown' },
    { pattern: /fedora/i, name: 'Fedora', version: 'Unknown' }
  ];
  
  for (const osPattern of osPatterns) {
    if (osPattern.pattern.test(userAgent)) {
      os = osPattern.name;
      if (osPattern.version !== 'Unknown' && osPattern.version !== '$1') {
        osVersion = osPattern.version;
      } else if (osPattern.version === '$1') {
        const match = userAgent.match(osPattern.pattern);
        if (match && match[1]) {
          osVersion = match[1];
        }
      }
      break;
    }
  }
  
  let browser = 'unknown';
  let browserVersion = 'unknown';
  
  const browserPatterns = [
    { pattern: /edg\/(\d+\.\d+)/i, name: 'Edge' },
    { pattern: /opr\/(\d+\.\d+)/i, name: 'Opera' },
    { pattern: /chrome\/(\d+\.\d+)/i, name: 'Chrome' },
    { pattern: /safari\/(\d+\.\d+)/i, name: 'Safari' },
    { pattern: /firefox\/(\d+\.\d+)/i, name: 'Firefox' },
    { pattern: /msie (\d+\.\d+)/i, name: 'Internet Explorer' },
    { pattern: /trident\/.*rv:(\d+\.\d+)/i, name: 'Internet Explorer' }
  ];
  
  for (const browserPattern of browserPatterns) {
    if (browserPattern.pattern.test(userAgent)) {
      browser = browserPattern.name;
      const match = userAgent.match(browserPattern.pattern);
      if (match && match[1]) {
        browserVersion = match[1];
      }
      break;
    }
  }
  
  if (browser === 'Chrome' && /safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  }
  
  let deviceType = 'unknown';
  
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/windows|mac|linux|cros|ubuntu|debian|fedora|centos|arch/i.test(userAgent)) {
    deviceType = 'desktop';
  }
  
  let platform = 'unknown';
  
  if (/windows/i.test(userAgent)) {
    platform = 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    platform = 'Mac';
  } else if (/linux/i.test(userAgent)) {
    platform = 'Linux';
  } else if (/android/i.test(userAgent)) {
    platform = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    platform = 'iOS';
  } else if (/chrome os/i.test(userAgent)) {
    platform = 'Chrome OS';
  }
  
  let ipAddress = req.clientIP || req.publicIP || 
                  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                  req.headers['x-real-ip'] ||
                  req.connection?.remoteAddress ||
                  req.socket?.remoteAddress ||
                  req.ip ||
                  'unknown';
  
  if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
    ipAddress = '127.0.0.1';
  }
  if (ipAddress && ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.replace('::ffff:', '');
  }
  
  const screenResolution = clientDeviceInfo.screenResolution || null;
  const viewportSize = clientDeviceInfo.viewportSize || null;
  const colorDepth = clientDeviceInfo.colorDepth || null;
  const pixelRatio = clientDeviceInfo.pixelRatio || null;
  const timezone = clientDeviceInfo.timezone || null;
  const language = clientDeviceInfo.language || 
                   req.headers['accept-language']?.split(',')[0] || 
                   null;
  const referrer = clientDeviceInfo.referrer || 
                   req.headers['referer'] || 
                   req.headers['referrer'] || 
                   null;
  const doNotTrack = clientDeviceInfo.doNotTrack || null;
  const vendor = clientDeviceInfo.vendor || null;
  
  let connectionType = 'unknown';
  let connectionSpeed = 'unknown';
  
  if (clientDeviceInfo.connection) {
    connectionType = clientDeviceInfo.connection.effectiveType || 'unknown';
    connectionSpeed = clientDeviceInfo.connection.downlink ? 
                      `${clientDeviceInfo.connection.downlink} Mbps` : 
                      'unknown';
  }
  
  const deviceInfo = {
    ipAddress: ipAddress,
    userAgent: userAgent,
    deviceType: deviceType,
    browser: browser,
    browserVersion: browserVersion,
    os: os,
    osVersion: osVersion,
    platform: platform,
    screenResolution: screenResolution,
    viewportSize: viewportSize,
    colorDepth: colorDepth,
    pixelRatio: pixelRatio,
    timezone: timezone,
    language: language,
    referrer: referrer,
    connectionType: connectionType,
    connectionSpeed: connectionSpeed,
    doNotTrack: doNotTrack,
    vendor: vendor
  };
  
  console.log('📱 Accurate Device Info:', {
    ip: deviceInfo.ipAddress,
    deviceType: deviceInfo.deviceType,
    os: deviceInfo.os,
    osVersion: deviceInfo.osVersion,
    browser: deviceInfo.browser,
    browserVersion: deviceInfo.browserVersion,
    platform: deviceInfo.platform,
    connectionType: deviceInfo.connectionType
  });
  
  return deviceInfo;
};

const getClientDeviceInfoFromBody = (req) => {
  const { clientDeviceInfo } = req.body || {};
  
  return {
    screenResolution: clientDeviceInfo?.screenResolution || null,
    viewportSize: clientDeviceInfo?.viewportSize || null,
    colorDepth: clientDeviceInfo?.colorDepth || null,
    pixelRatio: clientDeviceInfo?.pixelRatio || null,
    timezone: clientDeviceInfo?.timezone || null,
    language: clientDeviceInfo?.language || null,
    referrer: clientDeviceInfo?.referrer || null,
    doNotTrack: clientDeviceInfo?.doNotTrack || null,
    vendor: clientDeviceInfo?.vendor || null,
    connection: clientDeviceInfo?.connection || null
  };
};

// ========== CHECK ORDER RESTRICTIONS ==========
const checkOrderRestrictions = async (req, customerInfo) => {
  try {
    const ipAddress = req.clientIP || 
                      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                      req.headers['x-real-ip'] ||
                      req.connection?.remoteAddress ||
                      req.socket?.remoteAddress ||
                      req.ip ||
                      'unknown';
    
    let cleanIp = ipAddress;
    if (cleanIp === '::1' || cleanIp === '::ffff:127.0.0.1') {
      cleanIp = '127.0.0.1';
    }
    if (cleanIp && cleanIp.startsWith('::ffff:')) {
      cleanIp = cleanIp.replace('::ffff:', '');
    }
    
    const restrictions = await OrderRestriction.getRestrictions();
    const violations = [];

    const isIPBlocked = restrictions.ipRestrictions.blockedIPs.some(b => b.ip === cleanIp);
    if (isIPBlocked) {
      violations.push({
        type: 'ip_blocked',
        message: 'Your IP address has been blocked from placing orders'
      });
    }

    if (restrictions.ipRestrictions.timeInterval.enabled) {
      const timeValue = restrictions.ipRestrictions.timeInterval.value;
      const timeUnit = restrictions.ipRestrictions.timeInterval.unit;
      const timeInMs = timeUnit === 'min' ? timeValue * 60 * 1000 : timeValue * 60 * 60 * 1000;
      
      const recentOrder = await Order.findOne({
        'deviceInfo.ipAddress': cleanIp,
        createdAt: { $gte: new Date(Date.now() - timeInMs) }
      }).sort({ createdAt: -1 });

      if (recentOrder) {
        const timeLeft = Math.ceil((timeInMs - (Date.now() - new Date(recentOrder.createdAt).getTime())) / (timeUnit === 'min' ? 60 * 1000 : 60 * 60 * 1000));
        violations.push({
          type: 'ip_time_interval',
          message: `You must wait ${timeLeft} more ${timeUnit === 'min' ? 'minute(s)' : 'hour(s)'} before placing another order from this IP`
        });
      }
    }

    if (customerInfo?.phone) {
      const isPhoneBlocked = restrictions.phoneRestrictions.blockedPhones.some(b => b.phone === customerInfo.phone);
      if (isPhoneBlocked) {
        violations.push({
          type: 'phone_blocked',
          message: 'This phone number has been blocked from placing orders'
        });
      }

      if (restrictions.phoneRestrictions.timeInterval.enabled) {
        const timeValue = restrictions.phoneRestrictions.timeInterval.value;
        const timeUnit = restrictions.phoneRestrictions.timeInterval.unit;
        const timeInMs = timeUnit === 'min' ? timeValue * 60 * 1000 : timeValue * 60 * 60 * 1000;
        
        const recentOrder = await Order.findOne({
          'customerInfo.phone': customerInfo.phone,
          createdAt: { $gte: new Date(Date.now() - timeInMs) }
        }).sort({ createdAt: -1 });

        if (recentOrder) {
          const timeLeft = Math.ceil((timeInMs - (Date.now() - new Date(recentOrder.createdAt).getTime())) / (timeUnit === 'min' ? 60 * 1000 : 60 * 60 * 1000));
          violations.push({
            type: 'phone_time_interval',
            message: `You must wait ${timeLeft} more ${timeUnit === 'min' ? 'minute(s)' : 'hour(s)'} before placing another order with this phone number`
          });
        }
      }
    }

    if (customerInfo?.email) {
      const isEmailBlocked = restrictions.emailRestrictions.blockedEmails.some(b => b.email === customerInfo.email);
      if (isEmailBlocked) {
        violations.push({
          type: 'email_blocked',
          message: 'This email address has been blocked from placing orders'
        });
      }
    }

    return {
      allowed: violations.length === 0,
      violations,
      ipAddress: cleanIp
    };
  } catch (error) {
    console.error('Check order restrictions error:', error);
    return {
      allowed: true,
      violations: [],
      ipAddress: 'unknown'
    };
  }
};


// ========== CREATE ORDER - CLEAN VERSION (FIXED IMAGES) ==========
const createOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      customerInfo,
      couponCode,
      couponDiscount,
      freeShipping,
      orderStatus = 'placed',
      saveOrder = true,
      orderPlatform = 'website',
      clientDeviceInfo = {}
    } = req.body;

    const userId = req.user?._id;
    
    let sessionId = req.headers['x-session-id'] || 
                    req.cookies?.sessionId || 
                    req.body.sessionId || 
                    null;
    
    if (!sessionId && !userId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('🆕 Generated new session ID for guest:', sessionId);
    }

    console.log('📝 Order Creation - Session Info:', {
      userId: userId || 'guest',
      sessionId: sessionId || 'none',
      itemsCount: items?.length || 0
    });

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.division) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer information is incomplete. Full name, phone, address, and division are required.' 
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, error: 'Payment method is required' });
    }

    const restrictionCheck = await checkOrderRestrictions(req, customerInfo);
    
    if (!restrictionCheck.allowed) {
      console.log('🚫 Order restricted:', {
        customer: customerInfo.fullName,
        phone: customerInfo.phone,
        ip: restrictionCheck.ipAddress,
        violations: restrictionCheck.violations
      });
      
      return res.status(403).json({
        success: false,
        error: restrictionCheck.violations[0].message,
        violations: restrictionCheck.violations,
        restrictionType: restrictionCheck.violations[0].type
      });
    }

    // ============================================================
    // ✅ STEP 1: FETCH ALL PRODUCTS - SINGLE SOURCE OF TRUTH
    // ============================================================
    const uniqueProductIds = [...new Set(items.map(i => i.productId.toString()))];
    const productsById = {};
    const productDocs = await Product.find({ _id: { $in: uniqueProductIds } });
    productDocs.forEach(p => { 
      productsById[p._id.toString()] = p; 
    });

    console.log('📦 Fetched products for images:', Object.keys(productsById).map(id => ({
      productId: id,
      productName: productsById[id].productName,
      hasImage: !!(productsById[id].images && productsById[id].images[0]),
      imageUrl: productsById[id].images?.[0]?.url || 'none'
    })));

    // ============================================================
    // ✅ STEP 2: GROUP ITEMS BY PRODUCT WITH AUTHORITATIVE IMAGES
    // ============================================================
    
    const productGroups = {};
    
    items.forEach(item => {
      const productId = item.productId.toString();
      const productDoc = productsById[productId];
      
      if (!productGroups[productId]) {
        productGroups[productId] = {
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug || '',
          // ✅ ALWAYS use the product's OWN base image from database
          image: productDoc?.images?.[0]?.url || item.image || '',
          regularPrice: item.regularPrice || 0,
          discountPrice: item.discountPrice || 0,
          unit: item.unit || 'pcs',
          stockQuantity: item.stockQuantity || 0,
          colors: [],
          variants: [],
          quantity: 0,
          hasVariants: false
        };
      }
      
      // Add colors
      if (item.colors && item.colors.length > 0) {
        item.colors.forEach(color => {
          const existingColor = productGroups[productId].colors.find(c => c.color === color.color);
          if (existingColor) {
            existingColor.quantity += color.quantity;
          } else {
            productGroups[productId].colors.push({
              color: color.color,
              quantity: color.quantity,
              price: color.price
            });
          }
        });
      }
      
      const variantId = item.variantId || null;
      const subVariantId = item.subVariantId || null;
      
      if (variantId && variantId !== 'null' && variantId !== '') {
        productGroups[productId].hasVariants = true;
        
        const existingVariant = productGroups[productId].variants.find(v => v.variantId === variantId);
        
        let variant;
        if (!existingVariant) {
          // ✅ Find variant's OWN data in the product document
          let matchedVariant = null;
          if (productDoc?.variantTypes) {
            for (const vt of productDoc.variantTypes) {
              const found = (vt.variants || []).find(v => v.id === variantId || v._id?.toString() === variantId);
              if (found) { 
                matchedVariant = found; 
                break; 
              }
            }
          }
          
          // ✅ Get the variant's own image from the product document
          let variantImage = '';
          if (matchedVariant?.images && matchedVariant.images[0]) {
            variantImage = matchedVariant.images[0];
          } else if (matchedVariant?.image) {
            variantImage = matchedVariant.image;
          }
          
          const newVariant = {
            variantId: variantId,
            variantName: item.variantName || matchedVariant?.name || 'Variant',
            variantType: item.variantType || 'default',
            variantRegularPrice: item.variantRegularPrice || item.regularPrice || 0,
            variantDiscountPrice: item.variantDiscountPrice || item.discountPrice || 0,
            selectedColor: item.selectedColor || null,
            quantity: 0,
            // ✅ The variant's OWN image from the product doc
            image: variantImage || item.variantImage || '',
            subVariants: []
          };
          productGroups[productId].variants.push(newVariant);
          variant = newVariant;
        } else {
          variant = existingVariant;
        }
        
        if (subVariantId && subVariantId !== 'null' && subVariantId !== '') {
          const existingSubVariant = variant.subVariants.find(sv => sv.subVariantId === subVariantId);
          
          if (existingSubVariant) {
            existingSubVariant.quantity += item.quantity || 0;
          } else {
            // ✅ Find sub-variant's OWN data in the product document
            let matchedSubVariant = null;
            if (productDoc?.variantTypes) {
              outer:
              for (const vt of productDoc.variantTypes) {
                for (const v of vt.variants || []) {
                  if (v.id === variantId || v._id?.toString() === variantId) {
                    matchedSubVariant = (v.subVariants || []).find(sv => sv.id === subVariantId || sv._id?.toString() === subVariantId);
                    break outer;
                  }
                }
              }
            }
            
            // ✅ Get the sub-variant's own image
            let subVariantImage = '';
            if (matchedSubVariant?.images && matchedSubVariant.images[0]) {
              subVariantImage = matchedSubVariant.images[0];
            } else if (matchedSubVariant?.image) {
              subVariantImage = matchedSubVariant.image;
            }
            
            variant.subVariants.push({
              subVariantId: subVariantId,
              subVariantName: item.subVariantName || matchedSubVariant?.name || 'Sub-Variant',
              subVariantRegularPrice: item.variantRegularPrice || item.regularPrice || 0,
              subVariantDiscountPrice: item.variantDiscountPrice || item.discountPrice || 0,
              selectedColor: item.selectedColor || null,
              quantity: item.quantity || 0,
              // ✅ Sub-variant's OWN image
              image: subVariantImage || item.image || ''
            });
          }
        } else {
          variant.quantity += item.quantity || 0;
          if (item.selectedColor) {
            variant.selectedColor = item.selectedColor;
          }
          // ❌ REMOVED: This was overwriting the variant's own image
          // if (item.image) { variant.image = item.image; }
        }
      } else {
        productGroups[productId].quantity += item.quantity || 0;
      }
    });

    // Log grouped data for debugging
    console.log('📊 Grouped Products with images:', Object.values(productGroups).map(group => ({
      productName: group.productName,
      mainImage: group.image ? '✅' : '❌',
      hasVariants: group.hasVariants,
      variantCount: group.variants.length,
      variants: group.variants.map(v => ({
        name: v.variantName,
        image: v.image ? '✅' : '❌',
        subVariantCount: v.subVariants.length,
        subVariants: v.subVariants.map(s => ({
          name: s.subVariantName,
          image: s.image ? '✅' : '❌'
        }))
      }))
    })));

    // Convert to final items array with clean nested structure
    const processedItems = Object.values(productGroups).map(group => {
      // Calculate total quantity
      let totalQuantity = group.quantity || 0;
      
      group.variants.forEach(variant => {
        if (variant.subVariants && variant.subVariants.length > 0) {
          variant.subVariants.forEach(sub => {
            totalQuantity += sub.quantity || 0;
          });
        } else {
          totalQuantity += variant.quantity || 0;
        }
      });
      
      if (group.colors && group.colors.length > 0) {
        const colorTotal = group.colors.reduce((sum, c) => sum + (c.quantity || 0), 0);
        if (colorTotal > 0) {
          totalQuantity = colorTotal;
        }
      }
      
      const hasVariants = group.hasVariants || group.variants.length > 0;
      
      // Build the item with clean structure
      return {
        productId: group.productId,
        productName: group.productName,
        productSlug: group.productSlug || '',
        // ✅ Use the main product image (from database, not overwritten)
        image: group.image || '',
        regularPrice: group.regularPrice || 0,
        discountPrice: group.discountPrice || 0,
        costPerItem: 0,
        buyingPrice: 0,
        quantity: totalQuantity || 1,
        stockQuantity: group.stockQuantity || 0,
        unit: group.unit || 'pcs',
        selectedColor: null,
        colors: group.colors || [],
        // ✅ Nested variant structure with their own images
        variantDetails: group.variants.map(variant => ({
          variantId: variant.variantId,
          variantName: variant.variantName,
          variantType: variant.variantType,
          variantRegularPrice: variant.variantRegularPrice,
          variantDiscountPrice: variant.variantDiscountPrice,
          selectedColor: variant.selectedColor,
          quantity: variant.quantity,
          // ✅ Use variant's own image
          image: variant.image || '',
          subVariants: (variant.subVariants || []).map(sub => ({
            subVariantId: sub.subVariantId,
            subVariantName: sub.subVariantName,
            subVariantRegularPrice: sub.subVariantRegularPrice,
            subVariantDiscountPrice: sub.subVariantDiscountPrice,
            selectedColor: sub.selectedColor,
            quantity: sub.quantity,
            // ✅ Use sub-variant's own image
            image: sub.image || ''
          }))
        }))
      };
    });

    // Log final items for debugging
    console.log('📦 Final Items with images:', processedItems.map(item => ({
      productName: item.productName,
      mainImage: item.image ? '✅' : '❌',
      quantity: item.quantity,
      variantCount: item.variantDetails?.length || 0,
      variants: item.variantDetails?.map(v => ({
        name: v.variantName,
        image: v.image ? '✅' : '❌',
        subVariants: v.subVariants?.map(s => ({
          name: s.subVariantName,
          image: s.image ? '✅' : '❌'
        }))
      }))
    })));

    // Fetch product costs and validate
    const processedItemsWithCost = await Promise.all(processedItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      const costPerItem = product?.costPerItem || product?.buyingPrice || 0;
      
      // Validate stock
      if (product && product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}. Available: ${product.stockQuantity}`);
      }
      
      return {
        ...item,
        costPerItem: costPerItem,
        buyingPrice: costPerItem
      };
    }));

    const clientInfo = getClientDeviceInfoFromBody(req);
    const deviceInfo = getAccurateDeviceInfo(req, clientInfo);

    // For online payment, prepare order data without saving
    if (paymentMethod === 'online' && !saveOrder) {
      const orderData = {
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        items: processedItemsWithCost,
        customerInfo: {
          fullName: customerInfo.fullName,
          email: customerInfo.email || '',
          phone: customerInfo.phone,
          division: customerInfo.division,
          address: customerInfo.address,
          city: customerInfo.city,
          zone: customerInfo.zone,
          area: customerInfo.area || '',
          zipCode: customerInfo.zipCode || '',
          country: customerInfo.country || 'Bangladesh',
          note: customerInfo.note || ''
        },
        subtotal,
        shippingCost,
        discount: discount || 0,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'placed',
         orderPlatform: orderPlatform || 'website',
        couponCode: couponCode || null,
        couponDiscount: couponDiscount || 0,
        freeShipping: freeShipping || false,
        orderDate: new Date(),
        deviceInfo: deviceInfo,
        restrictionViolation: 'none'
      };
      
      return res.status(200).json({
        success: true,
        data: orderData,
        message: 'Order data prepared',
        sessionId: sessionId
      });
    }

    // Create and save the order
    const order = new Order({
      userId: userId || null,
      sessionId: userId ? null : sessionId,
      items: processedItemsWithCost,
      customerInfo: {
        fullName: customerInfo.fullName,
        email: customerInfo.email || '',
        phone: customerInfo.phone,
        division: customerInfo.division,
        address: customerInfo.address,
        city: customerInfo.city,
        zone: customerInfo.zone,
        area: customerInfo.area || '',
        zipCode: customerInfo.zipCode || '',
        country: customerInfo.country || 'Bangladesh',
        note: customerInfo.note || ''
      },
      subtotal,
      shippingCost,
      discount: discount || 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: orderStatus === 'pending' ? 'placed' : orderStatus,
      orderPlatform: orderPlatform || 'website', 
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      freeShipping: freeShipping || false,
      orderDate: new Date(),
      placedAt: new Date(),
      deviceInfo: deviceInfo,
      restrictionViolation: 'none'
    });

    await order.save();

    console.log('✅ Order saved with orderNumber:', order.orderNumber);
    console.log('📊 Order items images (final):', order.items.map(item => ({
      productName: item.productName,
      image: item.image ? '✅' : '❌',
      variantDetails: item.variantDetails?.map(v => ({
        variantName: v.variantName,
        image: v.image ? '✅' : '❌',
        subVariants: v.subVariants?.map(s => ({
          subVariantName: s.subVariantName,
          image: s.image ? '✅' : '❌'
        }))
      }))
    })));

    // Update stock
    for (const item of processedItemsWithCost) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity, purchaseCount: item.quantity } }
      );
    }

    // Clear cart
    if (userId) {
      await Cart.findOneAndDelete({ userId });
      console.log('🗑️ Cart cleared for user:', userId);
    } else if (sessionId) {
      const deletedCart = await Cart.findOneAndDelete({ sessionId });
      console.log('🗑️ Cart cleared for session:', sessionId, deletedCart ? '✅' : '❌ Not found');
    }

    // Handle coupon
    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
        if (coupon) {
          coupon.totalUsedCount = (coupon.totalUsedCount || 0) + 1;
          coupon.usageRecords = coupon.usageRecords || [];
          coupon.usageRecords.push({
            userId: userId || null,
            orderId: order._id,
            usedAt: new Date(),
            discountAmount: couponDiscount || discount
          });
          await coupon.save();
        }
      } catch (couponError) {
        console.error('Error recording coupon usage:', couponError);
      }
    }

    // Send emails
    if (order.customerInfo.email && order.customerInfo.email.trim() !== '') {
      try {
        await sendOrderPlacedEmail(order, order.customerInfo.email);
        console.log('✅ Order placed email sent to customer:', order.customerInfo.email);
      } catch (emailError) {
        console.error('❌ Customer email error:', emailError.message);
      }
    }

    try {
      await sendOrderNotificationToAdmin(order, 'new');
      console.log('✅ Admin notification sent for order:', order.orderNumber);
    } catch (emailError) {
      console.error('❌ Admin email error:', emailError.message);
    }

    res.status(201).json({
      success: true,
      data: order,
      orderId: order._id,
      sessionId: sessionId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== PREPARE ORDER - CLEAN VERSION ==========
// const prepareOrder = async (req, res) => {
//   try {
//     const {
//       items,
//       subtotal,
//       shippingCost,
//       discount,
//       total,
//       paymentMethod,
//       customerInfo,
//       couponCode,
//       couponDiscount,
//       freeShipping,
//       clientDeviceInfo = {}
//     } = req.body;

//     const userId = req.user?._id;
//     const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ success: false, error: 'No items in order' });
//     }

//     if (!customerInfo || !customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.division) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Customer information is incomplete. Full name, phone, address, and division are required.' 
//       });
//     }

//     // Group items by product with nested variants
//     const productGroups = {};
    
//     items.forEach(item => {
//       const productId = item.productId.toString();
      
//       if (!productGroups[productId]) {
//         productGroups[productId] = {
//           productId: item.productId,
//           productName: item.productName,
//           productSlug: item.productSlug || '',
//           image: item.image || '',
//           regularPrice: item.regularPrice || 0,
//           discountPrice: item.discountPrice || 0,
//           unit: item.unit || 'pcs',
//           stockQuantity: item.stockQuantity || 0,
//           colors: [],
//           variants: [],
//           quantity: 0,
//           hasVariants: false
//         };
//       }
      
//       if (item.colors && item.colors.length > 0) {
//         item.colors.forEach(color => {
//           const existingColor = productGroups[productId].colors.find(c => c.color === color.color);
//           if (existingColor) {
//             existingColor.quantity += color.quantity;
//           } else {
//             productGroups[productId].colors.push({
//               color: color.color,
//               quantity: color.quantity,
//               price: color.price
//             });
//           }
//         });
//       }
      
//       const variantId = item.variantId || null;
//       const subVariantId = item.subVariantId || null;
      
//       if (variantId && variantId !== 'null' && variantId !== '') {
//         productGroups[productId].hasVariants = true;
        
//         const existingVariant = productGroups[productId].variants.find(v => v.variantId === variantId);
        
//         let variant;
//         if (!existingVariant) {
//           const newVariant = {
//             variantId: variantId,
//             variantName: item.variantName || 'Variant',
//             variantType: item.variantType || 'default',
//             variantRegularPrice: item.variantRegularPrice || item.regularPrice || 0,
//             variantDiscountPrice: item.variantDiscountPrice || item.discountPrice || 0,
//             selectedColor: item.selectedColor || null,
//             quantity: 0,
//             image: item.image || '',
//             subVariants: []
//           };
//           productGroups[productId].variants.push(newVariant);
//           variant = newVariant;
//         } else {
//           variant = existingVariant;
//         }
        
//         if (subVariantId && subVariantId !== 'null' && subVariantId !== '') {
//           const existingSubVariant = variant.subVariants.find(sv => sv.subVariantId === subVariantId);
          
//           if (existingSubVariant) {
//             existingSubVariant.quantity += item.quantity || 0;
//           } else {
//             variant.subVariants.push({
//               subVariantId: subVariantId,
//               subVariantName: item.subVariantName || 'Sub-Variant',
//               subVariantRegularPrice: item.variantRegularPrice || item.regularPrice || 0,
//               subVariantDiscountPrice: item.variantDiscountPrice || item.discountPrice || 0,
//               selectedColor: item.selectedColor || null,
//               quantity: item.quantity || 0,
//               image: item.image || ''
//             });
//           }
//         } else {
//           variant.quantity += item.quantity || 0;
//           if (item.selectedColor) {
//             variant.selectedColor = item.selectedColor;
//           }
//           if (item.image) {
//             variant.image = item.image;
//           }
//         }
//       } else {
//         productGroups[productId].quantity += item.quantity || 0;
//       }
//     });

//     const processedItems = Object.values(productGroups).map(group => {
//       let totalQuantity = group.quantity || 0;
      
//       group.variants.forEach(variant => {
//         if (variant.subVariants && variant.subVariants.length > 0) {
//           variant.subVariants.forEach(sub => {
//             totalQuantity += sub.quantity || 0;
//           });
//         } else {
//           totalQuantity += variant.quantity || 0;
//         }
//       });
      
//       if (group.colors && group.colors.length > 0) {
//         const colorTotal = group.colors.reduce((sum, c) => sum + (c.quantity || 0), 0);
//         if (colorTotal > 0) {
//           totalQuantity = colorTotal;
//         }
//       }
      
//       return {
//         productId: group.productId,
//         productName: group.productName,
//         productSlug: group.productSlug || '',
//         image: group.image || '',
//         regularPrice: group.regularPrice || 0,
//         discountPrice: group.discountPrice || 0,
//         costPerItem: 0,
//         buyingPrice: 0,
//         quantity: totalQuantity || 1,
//         stockQuantity: group.stockQuantity || 0,
//         unit: group.unit || 'pcs',
//         selectedColor: null,
//         colors: group.colors || [],
//         variantDetails: group.variants.map(variant => ({
//           variantId: variant.variantId,
//           variantName: variant.variantName,
//           variantType: variant.variantType,
//           variantRegularPrice: variant.variantRegularPrice,
//           variantDiscountPrice: variant.variantDiscountPrice,
//           selectedColor: variant.selectedColor,
//           quantity: variant.quantity,
//           image: variant.image,
//           subVariants: (variant.subVariants || []).map(sub => ({
//             subVariantId: sub.subVariantId,
//             subVariantName: sub.subVariantName,
//             subVariantRegularPrice: sub.subVariantRegularPrice,
//             subVariantDiscountPrice: sub.subVariantDiscountPrice,
//             selectedColor: sub.selectedColor,
//             quantity: sub.quantity,
//             image: sub.image
//           }))
//         }))
//       };
//     });

//     const processedItemsWithCost = await Promise.all(processedItems.map(async (item) => {
//       const product = await Product.findById(item.productId);
//       const costPerItem = product?.costPerItem || product?.buyingPrice || 0;
//       return { ...item, costPerItem, buyingPrice: costPerItem };
//     }));

//     const clientInfo = getClientDeviceInfoFromBody(req);
//     const deviceInfo = getAccurateDeviceInfo(req, clientInfo);

//     const orderData = {
//       userId: userId || null,
//       sessionId: userId ? null : sessionId,
//       items: processedItemsWithCost,
//       customerInfo: {
//         fullName: customerInfo.fullName,
//         email: customerInfo.email || '',
//         phone: customerInfo.phone,
//         division: customerInfo.division,
//         address: customerInfo.address,
//         city: customerInfo.city,
//         zone: customerInfo.zone,
//         area: customerInfo.area || '',
//         zipCode: customerInfo.zipCode || '',
//         country: customerInfo.country || 'Bangladesh',
//         note: customerInfo.note || ''
//       },
//       subtotal,
//       shippingCost,
//       discount: discount || 0,
//       total,
//       paymentMethod,
//       paymentStatus: 'pending',
//       orderStatus: 'placed',
//       couponCode: couponCode || null,
//       couponDiscount: couponDiscount || 0,
//       freeShipping: freeShipping || false,
//       orderDate: new Date(),
//       deviceInfo: deviceInfo
//     };
    
//     res.json({
//       success: true,
//       data: orderData,
//       message: 'Order data prepared'
//     });
    
//   } catch (error) {
//     console.error('Prepare order error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// ========== PREPARE ORDER - CLEAN VERSION (FIXED IMAGES) ==========
const prepareOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      customerInfo,
      couponCode,
      couponDiscount,
      freeShipping,
      clientDeviceInfo = {}
    } = req.body;

    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.division) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer information is incomplete. Full name, phone, address, and division are required.' 
      });
    }

    // ============================================================
    // ✅ STEP 1: FETCH ALL PRODUCTS - SINGLE SOURCE OF TRUTH
    // ============================================================
    const uniqueProductIds = [...new Set(items.map(i => i.productId.toString()))];
    const productsById = {};
    const productDocs = await Product.find({ _id: { $in: uniqueProductIds } });
    productDocs.forEach(p => { 
      productsById[p._id.toString()] = p; 
    });

    console.log('📦 [prepareOrder] Fetched products for images:', Object.keys(productsById).map(id => ({
      productId: id,
      productName: productsById[id].productName,
      hasImage: !!(productsById[id].images && productsById[id].images[0]),
      imageUrl: productsById[id].images?.[0]?.url || 'none'
    })));

    // ============================================================
    // ✅ STEP 2: GROUP ITEMS BY PRODUCT WITH AUTHORITATIVE IMAGES
    // ============================================================
    const productGroups = {};
    
    items.forEach(item => {
      const productId = item.productId.toString();
      const productDoc = productsById[productId];
      
      if (!productGroups[productId]) {
        productGroups[productId] = {
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug || '',
          // ✅ ALWAYS use the product's OWN base image from database
          image: productDoc?.images?.[0]?.url || item.image || '',
          regularPrice: item.regularPrice || 0,
          discountPrice: item.discountPrice || 0,
          unit: item.unit || 'pcs',
          stockQuantity: item.stockQuantity || 0,
          colors: [],
          variants: [],
          quantity: 0,
          hasVariants: false
        };
      }
      
      if (item.colors && item.colors.length > 0) {
        item.colors.forEach(color => {
          const existingColor = productGroups[productId].colors.find(c => c.color === color.color);
          if (existingColor) {
            existingColor.quantity += color.quantity;
          } else {
            productGroups[productId].colors.push({
              color: color.color,
              quantity: color.quantity,
              price: color.price
            });
          }
        });
      }
      
      const variantId = item.variantId || null;
      const subVariantId = item.subVariantId || null;
      
      if (variantId && variantId !== 'null' && variantId !== '') {
        productGroups[productId].hasVariants = true;
        
        const existingVariant = productGroups[productId].variants.find(v => v.variantId === variantId);
        
        let variant;
        if (!existingVariant) {
          // ✅ Find variant's OWN data in the product document
          let matchedVariant = null;
          if (productDoc?.variantTypes) {
            for (const vt of productDoc.variantTypes) {
              const found = (vt.variants || []).find(v => v.id === variantId || v._id?.toString() === variantId);
              if (found) { 
                matchedVariant = found; 
                break; 
              }
            }
          }
          
          // ✅ Get the variant's own image from the product document
          let variantImage = '';
          if (matchedVariant?.images && matchedVariant.images[0]) {
            variantImage = matchedVariant.images[0];
          } else if (matchedVariant?.image) {
            variantImage = matchedVariant.image;
          }
          
          const newVariant = {
            variantId: variantId,
            variantName: item.variantName || matchedVariant?.name || 'Variant',
            variantType: item.variantType || 'default',
            variantRegularPrice: item.variantRegularPrice || item.regularPrice || 0,
            variantDiscountPrice: item.variantDiscountPrice || item.discountPrice || 0,
            selectedColor: item.selectedColor || null,
            quantity: 0,
            // ✅ The variant's OWN image from the product doc
            image: variantImage || item.variantImage || '',
            subVariants: []
          };
          productGroups[productId].variants.push(newVariant);
          variant = newVariant;
        } else {
          variant = existingVariant;
        }
        
        if (subVariantId && subVariantId !== 'null' && subVariantId !== '') {
          const existingSubVariant = variant.subVariants.find(sv => sv.subVariantId === subVariantId);
          
          if (existingSubVariant) {
            existingSubVariant.quantity += item.quantity || 0;
          } else {
            // ✅ Find sub-variant's OWN data in the product document
            let matchedSubVariant = null;
            if (productDoc?.variantTypes) {
              outer:
              for (const vt of productDoc.variantTypes) {
                for (const v of vt.variants || []) {
                  if (v.id === variantId || v._id?.toString() === variantId) {
                    matchedSubVariant = (v.subVariants || []).find(sv => sv.id === subVariantId || sv._id?.toString() === subVariantId);
                    break outer;
                  }
                }
              }
            }
            
            // ✅ Get the sub-variant's own image
            let subVariantImage = '';
            if (matchedSubVariant?.images && matchedSubVariant.images[0]) {
              subVariantImage = matchedSubVariant.images[0];
            } else if (matchedSubVariant?.image) {
              subVariantImage = matchedSubVariant.image;
            }
            
            variant.subVariants.push({
              subVariantId: subVariantId,
              subVariantName: item.subVariantName || matchedSubVariant?.name || 'Sub-Variant',
              subVariantRegularPrice: item.variantRegularPrice || item.regularPrice || 0,
              subVariantDiscountPrice: item.variantDiscountPrice || item.discountPrice || 0,
              selectedColor: item.selectedColor || null,
              quantity: item.quantity || 0,
              // ✅ Sub-variant's OWN image
              image: subVariantImage || item.image || ''
            });
          }
        } else {
          variant.quantity += item.quantity || 0;
          if (item.selectedColor) {
            variant.selectedColor = item.selectedColor;
          }
          // ❌ REMOVED: This was overwriting the variant's own image
          // if (item.image) { variant.image = item.image; }
        }
      } else {
        productGroups[productId].quantity += item.quantity || 0;
      }
    });

    // Convert to final items array with clean nested structure
    const processedItems = Object.values(productGroups).map(group => {
      let totalQuantity = group.quantity || 0;
      
      group.variants.forEach(variant => {
        if (variant.subVariants && variant.subVariants.length > 0) {
          variant.subVariants.forEach(sub => {
            totalQuantity += sub.quantity || 0;
          });
        } else {
          totalQuantity += variant.quantity || 0;
        }
      });
      
      if (group.colors && group.colors.length > 0) {
        const colorTotal = group.colors.reduce((sum, c) => sum + (c.quantity || 0), 0);
        if (colorTotal > 0) {
          totalQuantity = colorTotal;
        }
      }
      
      return {
        productId: group.productId,
        productName: group.productName,
        productSlug: group.productSlug || '',
        // ✅ Use the main product image (from database, not overwritten)
        image: group.image || '',
        regularPrice: group.regularPrice || 0,
        discountPrice: group.discountPrice || 0,
        costPerItem: 0,
        buyingPrice: 0,
        quantity: totalQuantity || 1,
        stockQuantity: group.stockQuantity || 0,
        unit: group.unit || 'pcs',
        selectedColor: null,
        colors: group.colors || [],
        // ✅ Nested variant structure with their own images
        variantDetails: group.variants.map(variant => ({
          variantId: variant.variantId,
          variantName: variant.variantName,
          variantType: variant.variantType,
          variantRegularPrice: variant.variantRegularPrice,
          variantDiscountPrice: variant.variantDiscountPrice,
          selectedColor: variant.selectedColor,
          quantity: variant.quantity,
          // ✅ Use variant's own image
          image: variant.image || '',
          subVariants: (variant.subVariants || []).map(sub => ({
            subVariantId: sub.subVariantId,
            subVariantName: sub.subVariantName,
            subVariantRegularPrice: sub.subVariantRegularPrice,
            subVariantDiscountPrice: sub.subVariantDiscountPrice,
            selectedColor: sub.selectedColor,
            quantity: sub.quantity,
            // ✅ Use sub-variant's own image
            image: sub.image || ''
          }))
        }))
      };
    });

    const processedItemsWithCost = await Promise.all(processedItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      const costPerItem = product?.costPerItem || product?.buyingPrice || 0;
      return { ...item, costPerItem, buyingPrice: costPerItem };
    }));

    const clientInfo = getClientDeviceInfoFromBody(req);
    const deviceInfo = getAccurateDeviceInfo(req, clientInfo);

    const orderData = {
      userId: userId || null,
      sessionId: userId ? null : sessionId,
      items: processedItemsWithCost,
      customerInfo: {
        fullName: customerInfo.fullName,
        email: customerInfo.email || '',
        phone: customerInfo.phone,
        division: customerInfo.division,
        address: customerInfo.address,
        city: customerInfo.city,
        zone: customerInfo.zone,
        area: customerInfo.area || '',
        zipCode: customerInfo.zipCode || '',
        country: customerInfo.country || 'Bangladesh',
        note: customerInfo.note || ''
      },
      subtotal,
      shippingCost,
      discount: discount || 0,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      freeShipping: freeShipping || false,
      orderDate: new Date(),
      deviceInfo: deviceInfo
    };
    
    res.json({
      success: true,
      data: orderData,
      message: 'Order data prepared'
    });
    
  } catch (error) {
    console.error('Prepare order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== TRACK ORDER BY PHONE ==========
const trackOrderByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }
    
    const orders = await Order.find({
      'customerInfo.phone': phone
    })
    .sort({ createdAt: -1 })
    .select('_id orderNumber orderStatus items subtotal shippingCost discount total customerInfo createdAt deliveredAt cancelledAt statusHistory trackingNumber paymentMethod paymentStatus deliveryService');
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No orders found for this phone number' 
      });
    }
    
    const statusLabels = {
      'placed': 'Order Placed',
      'follow_up': 'Follow Up',
      'accepted': 'Accepted',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'reminder': 'Reminder',
      'refunded': 'Refunded',
      'failed': 'Failed'
    };
    
    const formattedOrders = orders.map(order => {
      const timeline = order.statusHistory ? order.statusHistory.map(entry => ({
        status: entry.status,
        label: statusLabels[entry.status] || entry.status,
        note: entry.note,
        timestamp: entry.timestamp,
        formattedDate: entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-BD', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null
      })) : [];
      
      if (timeline.length === 0) {
        timeline.push({
          status: order.orderStatus,
          label: statusLabels[order.orderStatus] || order.orderStatus,
          note: `Order ${order.orderStatus}`,
          timestamp: order.createdAt,
          formattedDate: new Date(order.createdAt).toLocaleString('en-BD', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        
        if (order.deliveredAt) {
          timeline.push({
            status: 'delivered',
            label: 'Delivered',
            note: 'Order delivered',
            timestamp: order.deliveredAt,
            formattedDate: new Date(order.deliveredAt).toLocaleString('en-BD', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }
        
        if (order.cancelledAt) {
          timeline.push({
            status: 'cancelled',
            label: 'Cancelled',
            note: order.cancellationReason || 'Order cancelled',
            timestamp: order.cancelledAt,
            formattedDate: new Date(order.cancelledAt).toLocaleString('en-BD', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }
      }
      
      timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Include items with nested variants
      const itemsSummary = order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        name: item.productName,
        quantity: item.quantity,
        price: item.discountPrice || item.regularPrice,
        regularPrice: item.regularPrice,
        discountPrice: item.discountPrice,
        image: item.image,
        unit: item.unit || 'pcs',
        stockQuantity: item.stockQuantity,
        selectedColor: item.selectedColor,
        colors: item.colors || [],
        productSlug: item.productSlug,
        costPerItem: item.costPerItem,
        buyingPrice: item.buyingPrice,
        variantDetails: item.variantDetails || []
      }));
      
      let deliveryService = null;
      if (order.deliveryService) {
        deliveryService = {
          courierName: order.deliveryService.courierName || null,
          courierSlug: order.deliveryService.courierSlug || null,
          trackingNumber: order.deliveryService.trackingNumber || null,
          trackingUrl: order.deliveryService.trackingUrl || null,
          courierOrderId: order.deliveryService.courierOrderId || null,
          deliveryStatus: order.deliveryService.deliveryStatus || null,
          deliveryNote: order.deliveryService.deliveryNote || null,
          deliveryStatusHistory: order.deliveryService.deliveryStatusHistory || []
        };
      }
      
      return {
        _id: order._id,
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        statusLabel: statusLabels[order.orderStatus] || order.orderStatus,
        customerName: order.customerInfo?.fullName,
        total: order.total,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discount: order.discount,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt || null,
        cancelledAt: order.cancelledAt || null,
        trackingNumber: order.trackingNumber || null,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items: itemsSummary,
        timeline: timeline,
        statusHistory: order.statusHistory || [],
        deliveryService: deliveryService
      };
    });
    
    res.json({
      success: true,
      data: {
        phone: phone,
        totalOrders: formattedOrders.length,
        orders: formattedOrders
      },
      message: `Found ${formattedOrders.length} order(s) for this phone number`
    });
    
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET ORDER BY ID ==========
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    const order = await Order.findById(id)
     .populate('statusHistory.updatedBy', 'email name contactPerson');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const hasPermission = (userId && order.userId && order.userId.toString() === userId.toString()) ||
                         (sessionId && order.sessionId === sessionId);
    
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this order' });
    }
    
    res.json({ success: true, data: order });
    
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET USER ORDERS ==========
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    const { page = 1, limit = 10, orderStatus, paymentStatus, paymentMethod, search } = req.query;
    
    const query = {};
    
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return res.status(200).json({ 
        success: true, 
        data: [], 
        pagination: { total: 0, page: 1, pages: 0, limit: 10 }
      });
    }
    
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customerInfo.fullName': searchRegex },
        { 'customerInfo.email': searchRegex },
        { 'customerInfo.phone': searchRegex },
        { 'customerInfo.division': searchRegex },
        { 'customerInfo.city': searchRegex },
        { 'items.productName': searchRegex }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// // ========== UPDATE ORDER STATUS ==========
// const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { 
//       orderStatus, 
//       trackingNumber, 
//       deliveryNote, 
//       cancellationReason, 
//       rejectionReason,
//       courierService 
//     } = req.body;
    
//     const order = await Order.findById(id);
    
//     if (!order) {
//       return res.status(404).json({ success: false, error: 'Order not found' });
//     }
    
//     if (order.orderStatus === 'cancelled') {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Order is cancelled. No further actions can be performed.' 
//       });
//     }
    
//     if (order.orderStatus === 'delivered') {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Order is already delivered. Status cannot be changed.' 
//       });
//     }
    
//     if (order.orderStatus === 'returned') {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Order is already returned. Status cannot be changed.' 
//       });
//     }
    
//     const allowedTransitions = {
//       'placed': ['follow_up', 'approved', 'hold', 'processing', 'cancelled'],
//       'follow_up': ['accepted', 'rejected', 'cancelled', 'reminder'],
//       'reminder': ['accepted', 'rejected', 'cancelled'],
//       'accepted': ['approved', 'processing', 'hold', 'cancelled'],
//       'approved': ['processing', 'hold', 'cancelled', 'courier_assigned'],
//       'hold': ['approved', 'processing', 'cancelled', 'courier_assigned'],
//       'processing': ['hold', 'cancelled', 'courier_assigned'],
//       'courier_assigned': ['ready_to_ship', 'partial_delivery', 'delivered', 'returned', 'cancelled'],
//       'partial_delivery': ['delivered', 'returned', 'cancelled', 'partial_delivery'],
//       'ready_to_ship': ['delivered', 'partial_delivery', 'returned', 'cancelled'],
//       'rejected': ['cancelled'],
//       'shipped': [],
//       'out_for_delivery': [],
//        'delivered': ['partial_delivery'], // ✅ NEW: allow reverting to partial
//   'returned': ['partial_delivery'],
//       'delivered': [],
//       'returned': [],
//       'cancelled': []
//     };
    
//     const currentStatus = order.orderStatus;
//     const newStatus = orderStatus;
//     const userRole = req.user?.role || 'admin';
    
//     if (currentStatus !== newStatus) {
//       const allowedNext = allowedTransitions[currentStatus] || [];
//       if (!allowedNext.includes(newStatus)) {
//         return res.status(400).json({ 
//           success: false, 
//           error: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowedNext.join(', ')}` 
//         });
//       }
//     }
    
//     const oldStatus = order.orderStatus;

//       if (orderStatus === 'partial_delivery') {
//       if (!order.deliveryItems || order.deliveryItems.length === 0) {
//         order.initializeDeliveryItems();
//       }
//     }

//     // ============================================================
//     // ✅ BLOCK 2: Reverting from 'delivered' to any other status
//     // ============================================================
//     if (oldStatus === 'delivered' && orderStatus !== 'delivered') {
//       order.deliveredAt = null;
//       console.log(`↩️ Order ${order.orderNumber} reverted from delivered to ${orderStatus}`);

//       // Optional: revert COD payment back to pending
//       // Uncomment if your business rule requires it
//       // if (order.paymentMethod === 'cod' && order.paymentStatus === 'paid') {
//       //   order.paymentStatus = 'pending';
//       //   if (order.paymentDetails) {
//       //     order.paymentDetails.paidAt = null;
//       //     order.paymentDetails.paidBy = null;
//       //   }
//       // }
//     }
    
//     if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
//       order.cancelledAt = new Date();
//       if (cancellationReason) {
//         order.cancellationReason = cancellationReason;
//       }
      
//       for (const item of order.items) {
//         await Product.findByIdAndUpdate(
//           item.productId,
//           { $inc: { stockQuantity: item.quantity } }
//         );
//       }
//     }
    
//     if (orderStatus === 'rejected' && order.orderStatus !== 'rejected') {
//       order.cancelledAt = new Date();
//       if (rejectionReason) {
//         order.rejectionReason = rejectionReason;
//       }
      
//       for (const item of order.items) {
//         await Product.findByIdAndUpdate(
//           item.productId,
//           { $inc: { stockQuantity: item.quantity } }
//         );
//       }
//     }
    
//     if (orderStatus === 'delivered' && order.orderStatus !== 'delivered') {
//       order.deliveredAt = new Date();
      
//       if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
//         order.paymentStatus = 'paid';
//         console.log(`✅ COD order ${order.orderNumber} - Payment auto-updated to Paid on delivery`);
        
//         if (!order.paymentDetails) {
//           order.paymentDetails = {};
//         }
//         order.paymentDetails.paidAt = new Date();
//         order.paymentDetails.paidBy = 'System (Auto-updated on delivery by admin)';
//       }
//     }
    
//     if (orderStatus === 'returned' && order.orderStatus !== 'returned') {
//       order.cancelledAt = new Date();
//       order.rejectionReason = 'Order returned by courier';
      
//       for (const item of order.items) {
//         await Product.findByIdAndUpdate(
//           item.productId,
//           { $inc: { stockQuantity: item.quantity } }
//         );
//       }
//     }
    
//     if (orderStatus === 'courier_assigned' && courierService) {
//       order.setDeliveryService({
//         courierName: courierService,
//         courierSlug: courierService.toLowerCase(),
//         deliveryStatus: 'processing',
//         trackingNumber: trackingNumber || null
//       });
//     }
    
//     if (orderStatus) order.orderStatus = orderStatus;
//     if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
//     if (deliveryNote !== undefined) order.deliveryNote = deliveryNote;
    
//     const timestampMap = {
//       'placed': 'placedAt',
//       'follow_up': 'followUpAt',
//       'accepted': 'acceptedAt',
//       'approved': 'approvedAt',
//       'hold': 'approvedAt',
//       'ready_to_ship': 'shippedAt',
//       'courier_assigned': 'shippedAt',
//       'rejected': 'cancelledAt',
//       'cancelled': 'cancelledAt',
//       'reminder': 'reminderAt',
//       'delivered': 'deliveredAt',
//       'returned': 'cancelledAt',
//       'partial_delivery': 'deliveredAt'
//     };
    
//     if (timestampMap[orderStatus]) {
//       order[timestampMap[orderStatus]] = new Date();
//     }
    
//     const userId = req.user?._id;
//     let userRoleMapped = userRole;
    
//     if (userRoleMapped === 'call_center_agent') {
//       userRoleMapped = 'call_center';
//     }
//     if (userRoleMapped === 'customer') {
//       userRoleMapped = 'user';
//     }
    
//     let statusNote = `Status updated from ${oldStatus} to ${orderStatus}`;
    
//     if (orderStatus === 'cancelled' && cancellationReason) {
//       statusNote = `Cancelled: ${cancellationReason}`;
//     }
    
//     if (orderStatus === 'rejected' && rejectionReason) {
//       statusNote = `Rejected: ${rejectionReason}`;
//     }
    
//     if (orderStatus === 'delivered') {
//       statusNote = 'Order delivered successfully';
//       if (order.paymentMethod === 'cod' && order.paymentStatus === 'paid') {
//         statusNote += ' - Payment auto-updated to Paid';
//       }
//     }
    
//     if (orderStatus === 'returned') {
//       statusNote = 'Order returned by courier';
//     }
    
//     if (orderStatus === 'courier_assigned') {
//       statusNote = `Order assigned to ${courierService || 'courier'}`;
//     }
    
//     if (orderStatus === 'follow_up') {
//       statusNote = 'Order sent to call center for follow up';
//     }
    
//     if (orderStatus === 'accepted') {
//       statusNote = 'Order accepted';
//     }
    
//     if (orderStatus === 'approved') {
//       statusNote = 'Order approved';
//     }
    
//     if (orderStatus === 'ready_to_ship') {
//       statusNote = 'Order ready to ship';
//     }
    
//     if (orderStatus === 'reminder') {
//       statusNote = 'Reminder sent to customer';
//     }
    
//     order.addStatusHistory(orderStatus, statusNote, userId, userRoleMapped);
    
//     await order.save();
    
//     const shouldSendEmail = ['cancelled', 'delivered'].includes(orderStatus);
    
//     if (shouldSendEmail) {
//       if (order.customerInfo.email && order.customerInfo.email.trim() !== '') {
//         try {
//           await sendOrderStatusUpdateEmail(order, order.customerInfo.email, oldStatus, orderStatus);
//           console.log(`✅ Status update email sent to customer for ${orderStatus} - Order: ${order.orderNumber}`);
//         } catch (emailError) {
//           console.error('❌ Customer email error:', emailError.message);
//         }
//       }

//       try {
//         await sendOrderNotificationToAdmin(order, 'status_update');
//         console.log(`✅ Admin notification sent for ${orderStatus} - Order: ${order.orderNumber}`);
//       } catch (emailError) {
//         console.error('❌ Admin notification error:', emailError.message);
//       }
//     } else {
//       console.log(`📧 Skipping email for status: ${orderStatus} (Order: ${order.orderNumber})`);
//     }
    
//     let responseMessage = `Order status updated to ${orderStatus}`;
//     if (orderStatus === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'paid') {
//       responseMessage = `Order delivered and payment marked as Paid`;
//     }
    
//     res.json({
//       success: true,
//       data: order,
//       message: responseMessage
//     });
    
//   } catch (error) {
//     console.error('Update order status error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// ========== UPDATE ORDER STATUS ==========
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderStatus,
      trackingNumber,
      deliveryNote,
      cancellationReason,
      rejectionReason,
      courierService
    } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order is cancelled. No further actions can be performed.'
      });
    }

    // ✅ Allow 'delivered' → 'partial_delivery' revert only
    if (order.orderStatus === 'delivered' && orderStatus !== 'partial_delivery') {
      return res.status(400).json({
        success: false,
        error: 'Order is already delivered. Only partial_delivery revert is allowed.'
      });
    }

    if (order.orderStatus === 'returned') {
      return res.status(400).json({
        success: false,
        error: 'Order is already returned. Status cannot be changed.'
      });
    }

    // ============================================================
    // ALLOWED TRANSITIONS MAP
    // ============================================================
    const allowedTransitions = {
      'placed': ['follow_up', 'approved', 'hold', 'processing', 'cancelled'],
      'follow_up': ['accepted', 'rejected', 'cancelled', 'reminder'],
      'reminder': ['accepted', 'rejected', 'cancelled'],
      'accepted': ['approved', 'processing', 'hold', 'cancelled'],
      'approved': ['processing', 'hold', 'cancelled', 'courier_assigned'],
      'hold': ['approved', 'processing', 'cancelled', 'courier_assigned'],
      'processing': ['hold', 'cancelled', 'courier_assigned'],
      'courier_assigned': ['ready_to_ship', 'partial_delivery', 'delivered', 'returned', 'cancelled'],
      'partial_delivery': ['delivered', 'returned', 'cancelled', 'partial_delivery'],
      'ready_to_ship': ['delivered', 'partial_delivery', 'returned', 'cancelled'],
      'rejected': ['cancelled'],
      'shipped': [],
      'out_for_delivery': [],
      'delivered': ['partial_delivery'], // ✅ revert allowed
      'returned': [],
      'cancelled': []
    };

    const currentStatus = order.orderStatus;
    const newStatus = orderStatus;
    const userRole = req.user?.role || 'admin';

    if (currentStatus !== newStatus) {
      const allowedNext = allowedTransitions[currentStatus] || [];
      if (!allowedNext.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowedNext.join(', ')}`
        });
      }
    }

    const oldStatus = order.orderStatus;

    // ============================================================
    // ✅ BLOCK 1: Initialize deliveryItems when moving to partial_delivery
    // ============================================================
    if (orderStatus === 'partial_delivery') {
      if (!order.deliveryItems || order.deliveryItems.length === 0) {
        order.initializeDeliveryItems();
      }
    }

    // ============================================================
    // ✅ BLOCK 2: Reverting from 'delivered' to any other status
    // ============================================================
    if (oldStatus === 'delivered' && orderStatus !== 'delivered') {
      order.deliveredAt = null;
      console.log(`↩️ Order ${order.orderNumber} reverted from delivered to ${orderStatus}`);

      // Revert COD payment since delivery is no longer complete
      if (order.paymentMethod === 'cod' && order.paymentStatus === 'paid') {
        order.paymentStatus = 'pending';
        order.paidAmount = 0;
        if (order.paymentDetails) {
          order.paymentDetails.paidAt = null;
          order.paymentDetails.paidBy = null;
        }
      }
    }

    // ============================================================
    // CANCELLED HANDLING (restore stock)
    // ============================================================
    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      order.cancelledAt = new Date();
      if (cancellationReason) {
        order.cancellationReason = cancellationReason;
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: item.quantity } }
        );
      }
    }

    // ============================================================
    // REJECTED HANDLING (restore stock)
    // ============================================================
    if (orderStatus === 'rejected' && order.orderStatus !== 'rejected') {
      order.cancelledAt = new Date();
      if (rejectionReason) {
        order.rejectionReason = rejectionReason;
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: item.quantity } }
        );
      }
    }

    // ============================================================
    // DELIVERED HANDLING (auto-pay COD + set paidAmount)
    // ============================================================
    if (orderStatus === 'delivered' && order.orderStatus !== 'delivered') {
      order.deliveredAt = new Date();

      if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paidAmount = order.total;
        order.returnedAmount = 0;
        order.refundableAmount = 0;
        console.log(`✅ COD order ${order.orderNumber} - Payment auto-updated to Paid on delivery`);

        if (!order.paymentDetails) {
          order.paymentDetails = {};
        }
        order.paymentDetails.paidAt = new Date();
        order.paymentDetails.paidBy = 'System (Auto-updated on delivery by admin)';
      }
    }

    // ============================================================
    // RETURNED HANDLING (restore stock + reset payment)
    // ============================================================
    if (orderStatus === 'returned' && order.orderStatus !== 'returned') {
      order.cancelledAt = new Date();
      order.returnedAt = new Date();
      order.rejectionReason = 'Order returned by courier';

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: item.quantity } }
        );
      }

      // Nothing delivered → nothing to collect
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'pending';
        order.paidAmount = 0;
      }
      order.returnedAmount = order.subtotal || 0;
      order.refundableAmount = order.subtotal || 0;
    }

    // ============================================================
    // COURIER ASSIGNED HANDLING
    // ============================================================
    if (orderStatus === 'courier_assigned' && courierService) {
      order.setDeliveryService({
        courierName: courierService,
        courierSlug: courierService.toLowerCase(),
        deliveryStatus: 'processing',
        trackingNumber: trackingNumber || null
      });
    }

    // ============================================================
    // APPLY STATUS / TRACKING / NOTE
    // ============================================================
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (deliveryNote !== undefined) order.deliveryNote = deliveryNote;

    // ============================================================
    // TIMESTAMP MAP
    // ============================================================
    const timestampMap = {
      'placed': 'placedAt',
      'follow_up': 'followUpAt',
      'accepted': 'acceptedAt',
      'approved': 'approvedAt',
      'hold': 'approvedAt',
      'ready_to_ship': 'shippedAt',
      'courier_assigned': 'shippedAt',
      'rejected': 'cancelledAt',
      'cancelled': 'cancelledAt',
      'reminder': 'reminderAt',
      'delivered': 'deliveredAt',
      'returned': 'returnedAt',
      'partial_delivery': 'deliveredAt'
    };

    if (timestampMap[orderStatus]) {
      order[timestampMap[orderStatus]] = new Date();
    }

    // ============================================================
    // STATUS HISTORY NOTE
    // ============================================================
    const userId = req.user?._id;
    let userRoleMapped = userRole;

    if (userRoleMapped === 'call_center_agent') {
      userRoleMapped = 'call_center';
    }
    if (userRoleMapped === 'customer') {
      userRoleMapped = 'user';
    }

    let statusNote = `Status updated from ${oldStatus} to ${orderStatus}`;

    if (orderStatus === 'cancelled' && cancellationReason) {
      statusNote = `Cancelled: ${cancellationReason}`;
    }
    if (orderStatus === 'rejected' && rejectionReason) {
      statusNote = `Rejected: ${rejectionReason}`;
    }
    if (orderStatus === 'delivered') {
      statusNote = 'Order delivered successfully';
      if (order.paymentMethod === 'cod' && order.paymentStatus === 'paid') {
        statusNote += ' - Payment auto-updated to Paid';
      }
    }
    if (orderStatus === 'returned') {
      statusNote = 'Order returned by courier';
    }
    if (orderStatus === 'courier_assigned') {
      statusNote = `Order assigned to ${courierService || 'courier'}`;
    }
    if (orderStatus === 'follow_up') {
      statusNote = 'Order sent to call center for follow up';
    }
    if (orderStatus === 'accepted') {
      statusNote = 'Order accepted';
    }
    if (orderStatus === 'approved') {
      statusNote = 'Order approved';
    }
    if (orderStatus === 'ready_to_ship') {
      statusNote = 'Order ready to ship';
    }
    if (orderStatus === 'reminder') {
      statusNote = 'Reminder sent to customer';
    }
    if (orderStatus === 'partial_delivery') {
      statusNote = `Partial delivery initiated`;
      if (order.paidAmount > 0) {
        statusNote += ` | Paid: ৳${order.paidAmount.toFixed(2)}`;
      }
      if (order.returnedAmount > 0) {
        statusNote += ` | Returned: ৳${order.returnedAmount.toFixed(2)}`;
      }
    }

    order.addStatusHistory(orderStatus, statusNote, userId, userRoleMapped);

    await order.save();

    // ============================================================
    // EMAILS
    // ============================================================
    const shouldSendEmail = ['cancelled', 'delivered'].includes(orderStatus);

    if (shouldSendEmail) {
      if (order.customerInfo.email && order.customerInfo.email.trim() !== '') {
        try {
          await sendOrderStatusUpdateEmail(order, order.customerInfo.email, oldStatus, orderStatus);
          console.log(`✅ Status update email sent to customer for ${orderStatus} - Order: ${order.orderNumber}`);
        } catch (emailError) {
          console.error('❌ Customer email error:', emailError.message);
        }
      }

      try {
        await sendOrderNotificationToAdmin(order, 'status_update');
        console.log(`✅ Admin notification sent for ${orderStatus} - Order: ${order.orderNumber}`);
      } catch (emailError) {
        console.error('❌ Admin notification error:', emailError.message);
      }
    } else {
      console.log(`📧 Skipping email for status: ${orderStatus} (Order: ${order.orderNumber})`);
    }

    // ============================================================
    // RESPONSE
    // ============================================================
    let responseMessage = `Order status updated to ${orderStatus}`;
    if (orderStatus === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'paid') {
      responseMessage = `Order delivered and payment marked as Paid`;
    }
    if (orderStatus === 'partial_delivery') {
      responseMessage = `Order moved to partial delivery. Payment: ${order.paymentStatus} (৳${order.paidAmount.toFixed(2)})`;
    }

    res.json({
      success: true,
      data: order,
      message: responseMessage
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE PAYMENT STATUS ==========
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { paymentStatus, paymentDetails } = req.body;
    
//     const order = await Order.findById(id);
    
//     if (!order) {
//       return res.status(404).json({ success: false, error: 'Order not found' });
//     }

//     if (order.orderStatus === 'cancelled') {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Cannot update payment status for a cancelled order' 
//       });
//     }
    
//     const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
//     if (!validStatuses.includes(paymentStatus)) {
//       return res.status(400).json({ success: false, error: 'Invalid payment status' });
//     }
    
//     const oldStatus = order.paymentStatus;
//     const currentStatus = order.paymentStatus;
    
//     if (currentStatus === 'pending') {
//       if (!['paid', 'failed'].includes(paymentStatus)) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Pending status can only be changed to Paid or Failed' 
//         });
//       }
//     } else if (currentStatus === 'failed') {
//       if (paymentStatus !== 'paid') {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Failed status can only be changed to Paid' 
//         });
//       }
//     } else if (currentStatus === 'paid') {
//       if (paymentStatus !== 'refunded') {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Paid status can only be changed to Refunded' 
//         });
//       }
//     } else if (currentStatus === 'refunded') {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Refunded status cannot be changed further' 
//       });
//     }
    
//     order.paymentStatus = paymentStatus;
//     if (paymentDetails) {
//       order.paymentDetails = { ...order.paymentDetails, ...paymentDetails };
//     }
    
//     await order.save();
    
//     if (oldStatus !== paymentStatus) {
//       if (order.customerInfo.email && order.customerInfo.email.trim() !== '') {
//         try {
//           await sendPaymentStatusUpdateEmail(order, order.customerInfo.email, oldStatus, paymentStatus);
//           console.log('✅ Payment status update email sent to customer for order:', order.orderNumber);
//         } catch (emailError) {
//           console.error('❌ Payment status update email error:', emailError.message);
//         }
//       }

//       try {
//         await sendOrderNotificationToAdmin(order, 'payment_update');
//         console.log('✅ Payment status update notification sent to admin for order:', order.orderNumber);
//       } catch (emailError) {
//         console.error('❌ Admin notification error on payment update:', emailError.message);
//       }
//     }
    
//     res.json({
//       success: true,
//       data: order,
//       message: `Payment status updated to ${paymentStatus}`
//     });
    
//   } catch (error) {
//     console.error('Update payment status error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// ========== UPDATE PAYMENT STATUS ==========
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentDetails } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // ✅ Block payment changes for cancelled orders
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update payment status for a cancelled order'
      });
    }

    // ✅ Valid statuses now include 'partial'
    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'partial'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid payment status' });
    }

    const oldStatus = order.paymentStatus;
    const currentStatus = order.paymentStatus;

    // ============================================================
    // TRANSITION RULES
    // ============================================================
    if (currentStatus === 'pending') {
      if (!['paid', 'failed', 'partial'].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          error: 'Pending status can only be changed to Paid, Partial, or Failed'
        });
      }
    } else if (currentStatus === 'failed') {
      if (!['paid', 'partial'].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          error: 'Failed status can only be changed to Paid or Partial'
        });
      }
    } else if (currentStatus === 'partial') {
      if (!['paid', 'refunded'].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          error: 'Partial status can only be changed to Paid or Refunded'
        });
      }
    } else if (currentStatus === 'paid') {
      if (paymentStatus !== 'refunded') {
        return res.status(400).json({
          success: false,
          error: 'Paid status can only be changed to Refunded'
        });
      }
    } else if (currentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        error: 'Refunded status cannot be changed further'
      });
    }

    // ============================================================
    // APPLY NEW STATUS
    // ============================================================
    order.paymentStatus = paymentStatus;

    // ✅ Sync paidAmount based on manual payment status change
    if (paymentStatus === 'paid') {
      order.paidAmount = order.total;
    } else if (paymentStatus === 'pending') {
      order.paidAmount = 0;
    } else if (paymentStatus === 'refunded') {
      order.paidAmount = 0;
      order.refundableAmount = 0;
    }
    // 'partial' keeps whatever was computed from deliveryItems
    // 'failed' keeps existing paidAmount (usually 0)

    // Merge any additional payment details passed in
    if (paymentDetails) {
      order.paymentDetails = { ...order.paymentDetails, ...paymentDetails };
    }

    // ============================================================
    // RECOMPUTE FROM DELIVERY IF ORDER IS PARTIAL DELIVERY
    // ============================================================
    if (
      order.orderStatus === 'partial_delivery' &&
      order.deliveryItems &&
      order.deliveryItems.length > 0 &&
      paymentStatus === 'partial'
    ) {
      order.recomputePaymentFromDelivery();
    }

    await order.save();

    // ============================================================
    // EMAILS
    // ============================================================
    if (oldStatus !== paymentStatus) {
      if (order.customerInfo.email && order.customerInfo.email.trim() !== '') {
        try {
          await sendPaymentStatusUpdateEmail(order, order.customerInfo.email, oldStatus, paymentStatus);
          console.log('✅ Payment status update email sent to customer for order:', order.orderNumber);
        } catch (emailError) {
          console.error('❌ Payment status update email error:', emailError.message);
        }
      }

      try {
        await sendOrderNotificationToAdmin(order, 'payment_update');
        console.log('✅ Payment status update notification sent to admin for order:', order.orderNumber);
      } catch (emailError) {
        console.error('❌ Admin notification error on payment update:', emailError.message);
      }
    }

    res.json({
      success: true,
      data: order,
      message: `Payment status updated to ${paymentStatus}` + (
        order.paidAmount > 0 ? ` (Paid: ৳${order.paidAmount.toFixed(2)})` : ''
      )
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CANCEL ORDER ==========
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const hasPermission = (userId && order.userId && order.userId.toString() === userId.toString()) ||
                         (sessionId && order.sessionId === sessionId) ||
                         ['admin', 'moderator'].includes(userRole);
    
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this order' });
    }
    
    const isAdminOrModerator = ['admin', 'moderator'].includes(userRole);
    
    if (!isAdminOrModerator) {
      if (order.orderStatus !== 'placed') {
        return res.status(400).json({ 
          success: false, 
          error: `Order cannot be cancelled. Current status: ${order.orderStatus}. Only 'Placed' orders can be cancelled by customer.` 
        });
      }
    } else {
      const cancelableStatuses = ['placed', 'follow_up', 'accepted', 'processing', 'shipped', 'out_for_delivery'];
      
      if (!cancelableStatuses.includes(order.orderStatus)) {
        return res.status(400).json({ 
          success: false, 
          error: `Order cannot be cancelled. Current status: ${order.orderStatus}. Only 'Placed', 'Follow Up', 'Accepted', 'Processing', 'Shipped', or 'Out for Delivery' orders can be cancelled.` 
        });
      }
    }
    
    const oldStatus = order.orderStatus;
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = cancellationReason || (isAdminOrModerator ? 'Cancelled by admin' : 'Cancelled by customer');
    
    order.addStatusHistory(
      'cancelled', 
      cancellationReason || 'Order cancelled',
      userId,
      isAdminOrModerator ? userRole : 'user'
    );
    
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: item.quantity } }
      );
    }
    
    await order.save();
    
    if (order.customerInfo.email && order.customerInfo.email.trim() !== '') {
      try {
        await sendOrderStatusUpdateEmail(order, order.customerInfo.email, oldStatus, 'cancelled');
        console.log('✅ Cancellation email sent to customer for order:', order.orderNumber);
      } catch (emailError) {
        console.error('❌ Cancellation email error:', emailError.message);
      }
    }

    try {
      await sendOrderNotificationToAdmin(order, 'status_update');
      console.log('✅ Cancellation notification sent to admin for order:', order.orderNumber);
    } catch (emailError) {
      console.error('❌ Admin notification error on cancellation:', emailError.message);
    }
    
    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET ALL ORDERS ==========
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderStatus,
      paymentStatus,
      orderPlatform, 
      search,
      startDate,
      endDate,
      sort = '-createdAt'
    } = req.query;
    
    const query = {};
    
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderPlatform) query.orderPlatform = orderPlatform; 
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: searchRegex },  
        { 'customerInfo.fullName': searchRegex },
        { 'customerInfo.email': searchRegex },
        { 'customerInfo.phone': searchRegex },
        { 'customerInfo.division': searchRegex },
        { 'customerInfo.city': searchRegex },
        { 'customerInfo.zone': searchRegex },
        { 'items.productName': searchRegex }
      ];
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortOption = {};
    switch (sort) {
      case 'createdAt_asc': sortOption = { createdAt: 1 }; break;
      case 'createdAt_desc': sortOption = { createdAt: -1 }; break;
      case 'total_asc': sortOption = { total: 1 }; break;
      case 'total_desc': sortOption = { total: -1 }; break;
      case '-createdAt': sortOption = { createdAt: -1 }; break;
      case '-total': sortOption = { total: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .populate('statusHistory.updatedBy', 'email name contactPerson')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET ORDER STATISTICS ==========
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const userRole = req.user?.role || 'admin';
    
    let statusQuery = {};
    
    if (['super_admin', 'admin', 'moderator'].includes(userRole)) {
      statusQuery = {};
    } else if (userRole === 'call_center_agent') {
      statusQuery = {
        orderStatus: { $in: ['follow_up', 'reminder', 'accepted', 'cancelled'] }
      };
    } else {
      statusQuery = {
        orderStatus: { $in: ['placed', 'follow_up', 'reminder', 'accepted'] }
      };
    }
    
    const [
      totalOrders,
      pendingPayment,
      placedOrders,
      followUpOrders,
      reminderOrders,
      acceptedOrders,
      approvedOrders,
      holdOrders,
      readyToShipOrders,
      courierAssignedOrders,
      rejectedOrders,
      processingOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      partialDeliveryOrders,
      todayOrders,
      monthOrders,
      totalRevenue,
      monthRevenue
    ] = await Promise.all([
      Order.countDocuments(statusQuery),
      Order.countDocuments({ ...statusQuery, paymentStatus: 'pending' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'placed' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'follow_up' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'reminder' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'accepted' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'approved' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'hold' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'ready_to_ship' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'courier_assigned' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'rejected' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'processing' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'shipped' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'out_for_delivery' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'delivered' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'cancelled' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'returned' }),
      Order.countDocuments({ ...statusQuery, orderStatus: 'partial_delivery' }),
      Order.countDocuments({ ...statusQuery, createdAt: { $gte: today } }),
      Order.countDocuments({ ...statusQuery, createdAt: { $gte: thisMonth } }),
      Order.aggregate([{ $match: statusQuery }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { ...statusQuery, createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);
    
    const statusDistribution = await Order.aggregate([
      { $match: statusQuery },
      { $group: { _id: '$orderStatus', count: { $sum: 1 }, totalValue: { $sum: '$total' } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        pendingPayment,
        placedOrders,
        followUpOrders,
        reminderOrders,
        acceptedOrders,
        approvedOrders,
        holdOrders,
        readyToShipOrders,
        courierAssignedOrders,
        rejectedOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        partialDeliveryOrders,
        todayOrders,
        monthOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        statusDistribution
      }
    });
    
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET FILTERED ORDER STATS ==========
const getFilteredOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const [
      totalOrders,
      placedOrders,
      followUpOrders,
      reminderOrders,
      acceptedOrders,
      approvedOrders,
      holdOrders,
      readyToShipOrders,
      courierAssignedOrders,
      rejectedOrders,
      processingOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      partialDeliveryOrders,
      pendingPayment,
      todayOrders,
      monthOrders,
      totalRevenue,
      monthRevenue
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, orderStatus: 'placed' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'follow_up' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'reminder' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'accepted' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'approved' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'hold' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'ready_to_ship' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'courier_assigned' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'rejected' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'processing' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'shipped' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'out_for_delivery' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'delivered' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'cancelled' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'returned' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'partial_delivery' }),
      Order.countDocuments({ ...dateFilter, paymentStatus: 'pending' }),
      Order.countDocuments({ ...dateFilter, createdAt: { $gte: new Date().setHours(0,0,0,0) } }),
      Order.countDocuments({ ...dateFilter, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            ...dateFilter, 
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        placedOrders,
        followUpOrders,
        reminderOrders,
        acceptedOrders,
        approvedOrders,
        holdOrders,
        readyToShipOrders,
        courierAssignedOrders,
        rejectedOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        partialDeliveryOrders,
        pendingPayment,
        todayOrders,
        monthOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get filtered order stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET AGENT ORDERS ==========
const getAgentOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderStatus,
      search,
      sort = '-createdAt'
    } = req.query;
    
    const query = {
      orderStatus: { $in: ['follow_up', 'reminder', 'accepted', 'cancelled'] }
    };
    
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: searchRegex },  
        { 'customerInfo.fullName': searchRegex },
        { 'customerInfo.email': searchRegex },
        { 'customerInfo.phone': searchRegex },
        { 'customerInfo.division': searchRegex },
        { 'customerInfo.city': searchRegex },
        { 'customerInfo.zone': searchRegex },
        { 'items.productName': searchRegex }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortOption = {};
    switch (sort) {
      case 'createdAt_asc':
        sortOption = { createdAt: 1 };
        break;
      case 'createdAt_desc':
        sortOption = { createdAt: -1 };
        break;
      case 'total_asc':
        sortOption = { total: 1 };
        break;
      case 'total_desc':
        sortOption = { total: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get agent orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE AGENT ORDER STATUS ==========
const updateAgentOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, cancellationReason, statusNote } = req.body;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (!['follow_up', 'reminder', 'accepted', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is not in agent-accessible status' 
      });
    }
    
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is already rejected. No further changes allowed.' 
      });
    }
    
    if (order.orderStatus === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is already accepted. No further changes allowed.' 
      });
    }
    
    const allowedTransitions = {
      'follow_up': ['accepted', 'cancelled', 'reminder'],
      'reminder': ['accepted', 'cancelled']
    };
    
    const currentStatus = order.orderStatus;
    
    if (currentStatus !== orderStatus) {
      const allowedNext = allowedTransitions[currentStatus] || [];
      if (!allowedNext.includes(orderStatus)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid status transition from "${currentStatus}" to "${orderStatus}". Allowed: ${allowedNext.join(', ')}` 
        });
      }
    }
    
    const oldStatus = order.orderStatus;
    
    if (orderStatus === 'cancelled') {
      if (!cancellationReason) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cancellation reason is required' 
        });
      }
      order.cancelledAt = new Date();
      order.cancellationReason = cancellationReason;
      
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: item.quantity } }
        );
      }
    }
    
    order.orderStatus = orderStatus;
    
    switch(orderStatus) {
      case 'follow_up':
        order.followUpAt = new Date();
        break;
      case 'accepted':
        order.acceptedAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        break;
      case 'reminder':
        order.reminderAt = new Date();
        break;
    }
    
    const userId = req.user?._id;
    let userRole = req.user?.role || 'call_center';
    if (userRole === 'call_center_agent') {
      userRole = 'call_center';
    }
    
    let statusNoteText = `Status updated from ${oldStatus} to ${orderStatus}`;
    
    if (orderStatus === 'cancelled' && cancellationReason) {
      statusNoteText = `Rejected: ${cancellationReason}`;
    }
    
    if (orderStatus === 'accepted') {
      statusNoteText = 'Order accepted by call center agent';
    }
    
    if (orderStatus === 'reminder') {
      statusNoteText = 'Reminder set by call center agent';
    }
    
    if (statusNote && statusNote.trim() !== '') {
      statusNoteText += ` | Note: ${statusNote.trim()}`;
    }
    
    order.addStatusHistory(orderStatus, statusNoteText, userId, userRole);
    
    await order.save();
    
    console.log(`📧 Skipping email for agent status change from ${oldStatus} to ${orderStatus} - Order: ${order.orderNumber}`);
    
    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${orderStatus}`
    });
    
  } catch (error) {
    console.error('Update agent order status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET AGENT DASHBOARD ==========
const getAgentDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateFilter = {
        createdAt: { $gte: startDate, $lte: endDate }
      };
    } else {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      dateFilter = {
        createdAt: { $gte: startDate, $lte: endDate }
      };
    }
    
    const agentStatuses = ['follow_up', 'reminder', 'accepted', 'cancelled'];
    const query = {
      orderStatus: { $in: agentStatuses },
      ...dateFilter
    };
    
    const allOrders = await Order.find(query);
    
    const stats = {
      total: allOrders.length,
      followUp: allOrders.filter(o => o.orderStatus === 'follow_up').length,
      reminder: allOrders.filter(o => o.orderStatus === 'reminder').length,
      accepted: allOrders.filter(o => o.orderStatus === 'accepted').length,
      cancelled: allOrders.filter(o => o.orderStatus === 'cancelled').length
    };
    
    const followUpOrders = await Order.find({
      orderStatus: 'follow_up',
      ...dateFilter
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    const reminderOrders = await Order.find({
      orderStatus: 'reminder',
      ...dateFilter
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({
      success: true,
      stats,
      followUpOrders,
      reminderOrders,
      filter: {
        month: parseInt(month) || new Date().getMonth() + 1,
        year: parseInt(year) || new Date().getFullYear()
      }
    });
    
  } catch (error) {
    console.error('Get agent dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== DELETE ORDER ==========
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (!['cancelled', 'delivered'].includes(order.orderStatus)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: item.quantity } }
        );
      }
    }
    
    await order.deleteOne();
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE ORDER ==========
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerInfo, trackingNumber, deliveryNote } = req.body;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const editableStatuses = ['placed', 'follow_up', 'reminder', 'accepted', 'approved', 'ready_to_ship'];
    
    if (!editableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order status is '${order.orderStatus}'. Cannot update order details at this stage.`
      });
    }
    
    if (customerInfo) {
      order.customerInfo = {
        ...order.customerInfo.toObject ? order.customerInfo.toObject() : order.customerInfo,
        ...customerInfo
      };
    }
    
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (deliveryNote !== undefined) order.deliveryNote = deliveryNote;
    
    await order.save();
    
    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
    
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CREATE DELIVERY ORDER ==========
const createDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { courierSlug, deliveryNote, weight } = req.body;
    
    if (!courierSlug) {
      return res.status(400).json({ success: false, error: 'Courier slug is required' });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is cancelled. Cannot create delivery.' 
      });
    }
    
    if (order.deliveryService && order.deliveryService.courierOrderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order already has a delivery service assigned' 
      });
    }
    
    const allowedStatuses = ['accepted', 'approved', 'hold', 'processing', 'ready_to_ship'];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: `Order status is ${order.orderStatus}. Only 'Accepted', 'Approved', 'On Hold', 'Processing', or 'Ready to Ship' orders can create delivery.` 
      });
    }
    
    const { getCourierIntegration } = require('../lib/couriers/credentials');
    const integration = await getCourierIntegration(courierSlug);
    
    if (!integration || !integration.creds || !integration.apiEnabled) {
      return res.status(400).json({ 
        success: false, 
        error: 'Courier is not configured or disabled' 
      });
    }

    const normalizeItemQuantity = (item) => {
  if (typeof item.quantity === 'number' && item.quantity > 0) return item.quantity;

  if (Array.isArray(item.colors) && item.colors.length > 0) {
    const q = item.colors.reduce((s, c) => s + (Number(c.quantity) || 0), 0);
    if (q > 0) return q;
  }

  if (Array.isArray(item.variantDetails) && item.variantDetails.length > 0) {
    let q = 0;
    item.variantDetails.forEach(v => {
      if (Array.isArray(v.subVariants) && v.subVariants.length > 0) {
        v.subVariants.forEach(sv => { q += Number(sv.quantity) || 0; });
      } else {
        q += Number(v.quantity) || 0;
      }
    });
    if (q > 0) return q;
  }

  return 1;
};

const orderData = {
  ...order.toObject(),
  orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8)}`,
  items: order.items.map(item => ({
    ...item,
    productName: item.productName || 'Product',
    quantity: normalizeItemQuantity(item),   // ✅ always a number
    weight: weight ? weight / order.items.length : 0.5
  }))
};
    
    // const orderData = {
    //   ...order.toObject(),
    //   orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8)}`,
    //   items: order.items.map(item => ({
    //     ...item,
    //      productName: item.productName || 'Product',
    //     weight: weight ? weight / order.items.length : 0.5
    //   }))
    // };
    console.log('📦 Sending to courier:', JSON.stringify({
  orderNumber: orderData.orderNumber,
  items: orderData.items.map(i => ({
    productName: i.productName,
    quantity: i.quantity,
    variantDetails: i.variantDetails?.length || 0
  }))
}, null, 2));
    
    const { createCourierOrder } = require('../lib/couriers/factory');
    const result = await createCourierOrder(
      courierSlug,
      integration.creds,
      integration.storeConfig,
      orderData
    );
    
    console.log('✅ Courier API result:', {
      success: result.success,
      courierOrderId: result.courierOrderId,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      message: result.message
    });
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message || 'Failed to create delivery order' 
      });
    }
    
    const oldStatus = order.orderStatus;
    
    order.deliveryService = {
      courierId: integration.id,
      courierName: courierSlug.charAt(0).toUpperCase() + courierSlug.slice(1),
      courierSlug: courierSlug,
      trackingNumber: result.trackingNumber || null,
      trackingUrl: result.trackingUrl || '',
      courierOrderId: result.courierOrderId || null,
      courierResponse: {
        ...result.fullResponse,
        tracking_number: result.trackingNumber || result.fullResponse?.tracking_id,
        invoice_number: result.fullResponse?.invoice_number || order.orderNumber,
      },
      deliveryStatus: 'processing',
      labelUrl: result.labelUrl || '',
      invoiceUrl: result.invoiceUrl || '',
      deliveryNote: deliveryNote || '',
      weight: weight || 0.5,
      deliveryStatusHistory: [
        {
          status: 'processing',
          message: `Delivery order created with ${courierSlug} courier service`,
          timestamp: new Date()
        }
      ]
    };
    
    order.trackingNumber = result.trackingNumber || null;
    order.orderStatus = 'courier_assigned';
    order.processingAt = new Date();
    
    order.addStatusHistory(
      'courier_assigned', 
      `Order assigned to ${courierSlug} courier for delivery (from ${oldStatus})`,
      req.user?._id,
      req.user?.role || 'admin'
    );
    
    await order.save();
    
    console.log(`📧 Skipping email for courier assignment - Order: ${order.orderNumber}`);
    
    res.json({
      success: true,
      data: {
        order,
        deliveryResult: result
      },
      message: `Delivery order created successfully with ${courierSlug}`
    });
  } catch (error) {
    console.error('❌ Create delivery order error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create delivery order' 
    });
  }
};

// ========== GET ORDER TRACKING ==========
const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (!order.deliveryService || !order.deliveryService.courierSlug) {
      return res.status(400).json({ 
        success: false, 
        error: 'No delivery service assigned to this order' 
      });
    }
    
    const { courierSlug, trackingNumber } = order.deliveryService;
    
    const { getCourierIntegration } = require('../lib/couriers/credentials');
    const integration = await getCourierIntegration(courierSlug);
    
    if (!integration || !integration.creds) {
      return res.json({
        success: true,
        data: {
          ...order.deliveryService.toObject(),
          status: 'Not available',
          message: 'Courier not configured',
          trackingNumber: order.deliveryService.trackingNumber,
          courierName: order.deliveryService.courierName,
          courierSlug: order.deliveryService.courierSlug,
          trackingUrl: order.deliveryService.trackingUrl,
          deliveryStatus: order.deliveryService.deliveryStatus || 'pending',
          history: order.deliveryService.deliveryStatusHistory || []
        }
      });
    }
    
    const { getCourierTracking } = require('../lib/couriers/factory');
    const result = await getCourierTracking(
      courierSlug,
      integration.creds,
      trackingNumber
    );
    
    console.log('📦 Raw tracking result:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.log('⚠️ Tracking failed:', result.message);
      
      return res.json({
        success: true,
        data: {
          trackingNumber: order.deliveryService.trackingNumber,
          courierName: order.deliveryService.courierName,
          courierSlug: order.deliveryService.courierSlug,
          trackingUrl: order.deliveryService.trackingUrl,
          deliveryStatus: order.deliveryService.deliveryStatus || 'pending',
          history: order.deliveryService.deliveryStatusHistory || [],
          courierOrderId: order.deliveryService.courierOrderId,
          labelUrl: order.deliveryService.labelUrl,
          invoiceUrl: order.deliveryService.invoiceUrl,
          weight: order.deliveryService.weight,
          deliveryNote: order.deliveryService.deliveryNote,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          trackingStatus: order.deliveryService.deliveryStatus || 'pending',
          trackingMessage: result.message || 'Tracking info not available',
          error: result.message
        }
      });
    }
    
    let courierStatus = order.deliveryService.deliveryStatus || 'pending';
    
    if (result.status) {
      courierStatus = result.status;
    } else if (result.data?.status) {
      courierStatus = result.data.status;
    } else if (result.data?.delivery_status) {
      courierStatus = result.data.delivery_status;
    } else if (result.fullResponse?.status) {
      courierStatus = result.fullResponse.status;
    } else if (result.fullResponse?.data?.status) {
      courierStatus = result.fullResponse.data.status;
    } else if (result.trackingStatus) {
      courierStatus = result.trackingStatus;
    }
    
    console.log(`📌 Extracted courier status: ${courierStatus}`);
    
    const invalidStatuses = ['processing', 'pending', 'unknown'];
    const isValidStatus = !invalidStatuses.includes(courierStatus);
    
    if (courierStatus !== order.deliveryService.deliveryStatus && isValidStatus) {
      console.log(`📦 Updating order ${order.orderNumber} status from ${order.deliveryService.deliveryStatus} to ${courierStatus}`);
      
      order.deliveryService.deliveryStatus = courierStatus;
      
      if (!order.deliveryService.deliveryStatusHistory) {
        order.deliveryService.deliveryStatusHistory = [];
      }
      
      order.deliveryService.deliveryStatusHistory.push({
        status: courierStatus,
        message: result.message || `Status updated to ${courierStatus}`,
        location: result.location || '',
        timestamp: new Date()
      });
      
      if (courierStatus === 'delivered') {
        order.orderStatus = 'delivered';
        order.deliveredAt = new Date();
        
        if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          console.log(`💰 Order ${order.orderNumber}: Payment auto-updated to Paid`);
        }
      }
      
      await order.save();
      console.log(`✅ Order ${order.orderNumber} status updated to ${courierStatus} in database`);
    } else if (!isValidStatus && courierStatus !== order.deliveryService.deliveryStatus) {
      console.log(`⚠️ Not updating order ${order.orderNumber} - invalid status '${courierStatus}' received from courier`);
    }
    
    const responseData = {
      trackingNumber: order.deliveryService.trackingNumber,
      courierName: order.deliveryService.courierName,
      courierSlug: order.deliveryService.courierSlug,
      trackingUrl: order.deliveryService.trackingUrl,
      deliveryStatus: order.deliveryService.deliveryStatus || 'pending',
      history: order.deliveryService.deliveryStatusHistory || [],
      courierOrderId: order.deliveryService.courierOrderId,
      labelUrl: order.deliveryService.labelUrl,
      invoiceUrl: order.deliveryService.invoiceUrl,
      weight: order.deliveryService.weight,
      deliveryNote: order.deliveryService.deliveryNote,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingStatus: courierStatus,
      trackingMessage: result.message,
      trackingHistory: result.history || [],
      currentLocation: result.location,
      estimatedDelivery: result.estimatedDelivery
    };
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Get tracking error:', error);
    
    try {
      const order = await Order.findById(req.params.id);
      if (order && order.deliveryService) {
        return res.json({
          success: true,
          data: {
            trackingNumber: order.deliveryService.trackingNumber,
            courierName: order.deliveryService.courierName,
            courierSlug: order.deliveryService.courierSlug,
            trackingUrl: order.deliveryService.trackingUrl,
            deliveryStatus: order.deliveryService.deliveryStatus || 'pending',
            history: order.deliveryService.deliveryStatusHistory || [],
            error: error.message
          }
        });
      }
    } catch (e) {
      // Ignore
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ========== GET PUBLIC ORDER ==========
const getPublicOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
    
  } catch (error) {
    console.error('Get public order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE DELIVERY STATUS ==========
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, location } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const hasPermission = (userId && order.userId && order.userId.toString() === userId.toString()) ||
                         (sessionId && order.sessionId === sessionId) ||
                         ['admin', 'moderator', 'super_admin'].includes(req.user?.role);
    
    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Unauthorized to update this order' });
    }
    
    if (!order.deliveryService) {
      return res.status(400).json({ success: false, error: 'No delivery service found for this order' });
    }
    
    const oldDeliveryStatus = order.deliveryService.deliveryStatus;
    const oldPaymentStatus = order.paymentStatus;
    
    order.updateDeliveryStatus(status, message || `Status updated to ${status}`, location || '');
    
    await order.save();
    
    console.log(`📦 Order ${order.orderNumber}: Delivery status ${oldDeliveryStatus} → ${status}`);
    if (oldPaymentStatus !== order.paymentStatus) {
      console.log(`💰 Order ${order.orderNumber}: Payment status ${oldPaymentStatus} → ${order.paymentStatus} (Auto-updated on delivery)`);
    }
    
    res.json({
      success: true,
      data: {
        deliveryStatus: order.deliveryService.deliveryStatus,
        deliveryStatusHistory: order.deliveryService.deliveryStatusHistory,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      },
      message: `Delivery status updated to ${status}${order.paymentStatus === 'paid' ? ' and payment marked as Paid' : ''}`
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== BULK TRACKING STATUSES ==========
const getBulkTrackingStatuses = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order IDs are required' 
      });
    }
    
    const orders = await Order.find({
      _id: { $in: orderIds },
      'deliveryService.courierOrderId': { $exists: true, $ne: null }
    }).select('_id deliveryService orderStatus');
    
    const trackingStatuses = {};
    
    for (const order of orders) {
      if (!order.deliveryService || !order.deliveryService.courierSlug || !order.deliveryService.trackingNumber) {
        trackingStatuses[order._id] = {
          deliveryStatus: order.deliveryService?.deliveryStatus || 'pending',
          trackingNumber: order.deliveryService?.trackingNumber || null,
          courierName: order.deliveryService?.courierName || null,
          error: 'No tracking information available'
        };
        continue;
      }
      
      try {
        const { getCourierIntegration } = require('../lib/couriers/credentials');
        const integration = await getCourierIntegration(order.deliveryService.courierSlug);
        
        if (integration && integration.creds && integration.apiEnabled) {
          const { getCourierTracking } = require('../lib/couriers/factory');
          const result = await getCourierTracking(
            order.deliveryService.courierSlug,
            integration.creds,
            order.deliveryService.trackingNumber
          );
          
          const trackingStatus = (result.status || result.data?.status || '').toLowerCase();
          
          let mappedStatus = 'processing';
          if (['delivered', 'completed', 'success'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'delivered';
          } else if (['picked up', 'pickup', 'collected'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'picked_up';
          } else if (['in transit', 'transit', 'on the way'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'in_transit';
          } else if (['out for delivery', 'out for delivery', 'with courier'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'out_for_delivery';
          } else if (['returned', 'return'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'returned';
          } else if (['cancelled', 'cancel'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'cancelled';
          } else if (['failed'].some(k => trackingStatus.includes(k))) {
            mappedStatus = 'failed';
          }
          
          if (mappedStatus === 'delivered' && order.deliveryService.deliveryStatus !== 'delivered') {
            order.updateDeliveryStatus('delivered', result.message || 'Order delivered successfully', result.location || '');
            await order.save();
          }
          
          trackingStatuses[order._id] = {
            deliveryStatus: mappedStatus,
            trackingNumber: order.deliveryService.trackingNumber,
            courierName: order.deliveryService.courierName,
            trackingUrl: order.deliveryService.trackingUrl,
            lastUpdated: new Date().toISOString(),
            statusMessage: result.message || result.data?.status || result.status,
            location: result.location || result.data?.location || null,
            estimatedDelivery: result.estimatedDelivery || null
          };
        } else {
          trackingStatuses[order._id] = {
            deliveryStatus: order.deliveryService.deliveryStatus || 'pending',
            trackingNumber: order.deliveryService.trackingNumber,
            courierName: order.deliveryService.courierName,
            error: 'Courier not configured'
          };
        }
      } catch (error) {
        console.error(`Error fetching tracking for order ${order._id}:`, error);
        trackingStatuses[order._id] = {
          deliveryStatus: order.deliveryService?.deliveryStatus || 'pending',
          trackingNumber: order.deliveryService?.trackingNumber,
          courierName: order.deliveryService?.courierName,
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      data: trackingStatuses
    });
    
  } catch (error) {
    console.error('Bulk tracking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== SEARCH PRODUCTS FOR ORDER ==========
const searchProductsForOrder = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.length < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const products = await Product.find({
      $or: [
        { productName: searchRegex },
        { skuCode: searchRegex },
        { barcode: searchRegex },
        { brand: searchRegex },
        { fullDescription: searchRegex }
      ],
      isActive: true
    })
    .limit(parseInt(limit))
    .select('_id productName skuCode brand regularPrice discountPrice images unit stockQuantity colors');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== ADD PRODUCT TO ORDER ==========
const addProductToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity, selectedColor } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Valid quantity is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const nonEditableStatuses = [
      'courier_assigned', 'ready_to_ship', 'shipped', 'out_for_delivery',
      'delivered', 'partial_delivery', 'cancelled', 'rejected', 'refunded', 'returned'
    ];
    
    if (nonEditableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order status is '${order.orderStatus}'. Products cannot be added at this stage.`
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.stockQuantity}`
      });
    }

    const existingItem = order.items.find(item => {
      const sameProduct = item.productId.toString() === productId.toString();
      const sameColor = item.selectedColor === selectedColor || 
                       (!item.selectedColor && !selectedColor);
      return sameProduct && sameColor;
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stockQuantity: -quantity } }
      );
    } else {
      const newItem = {
        productId: product._id,
        productName: product.productName,
        productSlug: product.slug,
        image: product.images[0]?.url || '',
        regularPrice: product.regularPrice,
        discountPrice: product.discountPrice || 0,
        costPerItem: product.costPerItem || 0,
        buyingPrice: product.buyingPrice || 0,
        quantity: quantity,
        stockQuantity: product.stockQuantity,
        unit: product.unit || 'pcs',
        selectedColor: selectedColor || null,
        colors: [],
        variantDetails: []
      };

      order.items.push(newItem);

      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stockQuantity: -quantity } }
      );
    }

    let newSubtotal = 0;
    order.items.forEach(item => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.regularPrice;
      newSubtotal += price * item.quantity;
    });

    order.subtotal = newSubtotal;
    order.total = newSubtotal + order.shippingCost - (order.discount || 0);

    order.addStatusHistory(
      order.orderStatus,
      `Product "${product.productName}" added to order by admin (Quantity: ${quantity})`,
      req.user?._id,
      req.user?.role || 'admin'
    );

    await order.save();

    await order.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'statusHistory.updatedBy', select: 'email name contactPerson' }
    ]);

    res.json({
      success: true,
      data: order,
      message: `Product "${product.productName}" added to order`
    });

  } catch (error) {
    console.error('Add product to order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REMOVE PRODUCT FROM ORDER ==========
const removeProductFromOrder = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const nonEditableStatuses = [
      'courier_assigned', 'ready_to_ship', 'shipped', 'out_for_delivery',
      'delivered', 'partial_delivery', 'cancelled', 'rejected', 'refunded', 'returned'
    ];
    
    if (nonEditableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order status is '${order.orderStatus}'. Products cannot be removed at this stage.`
      });
    }

    const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in order' });
    }

    const removedItem = order.items[itemIndex];
    const productName = removedItem.productName;
    const quantity = removedItem.quantity;

    await Product.findByIdAndUpdate(
      removedItem.productId,
      { $inc: { stockQuantity: quantity } }
    );

    order.items.splice(itemIndex, 1);

    let newSubtotal = 0;
    order.items.forEach(item => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.regularPrice;
      newSubtotal += price * item.quantity;
    });

    order.subtotal = newSubtotal;
    order.total = newSubtotal + order.shippingCost - (order.discount || 0);

    order.addStatusHistory(
      order.orderStatus,
      `Product "${productName}" removed from order by admin (Quantity: ${quantity})`,
      req.user?._id,
      req.user?.role || 'admin'
    );

    await order.save();

    await order.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'statusHistory.updatedBy', select: 'email name contactPerson' }
    ]);

    res.json({
      success: true,
      data: order,
      message: `Product "${productName}" removed from order`
    });

  } catch (error) {
    console.error('Remove product from order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE ORDER DISCOUNT ==========
const updateOrderDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount, discountNote } = req.body;

    if (discount === undefined || discount === null) {
      return res.status(400).json({ success: false, error: 'Discount amount is required' });
    }

    if (discount < 0) {
      return res.status(400).json({ success: false, error: 'Discount cannot be negative' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const nonEditableStatuses = [
      'courier_assigned', 'ready_to_ship', 'shipped', 'out_for_delivery',
      'delivered', 'partial_delivery', 'cancelled', 'rejected', 'refunded', 'returned'
    ];
    
    if (nonEditableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order status is '${order.orderStatus}'. Discount cannot be updated at this stage.`
      });
    }

    const oldDiscount = order.discount || 0;
    order.discount = discount;
    order.total = order.subtotal + order.shippingCost - discount;

    order.addStatusHistory(
      order.orderStatus,
      `Order discount updated from ৳${oldDiscount.toFixed(2)} to ৳${discount.toFixed(2)}${discountNote ? ` (${discountNote})` : ''}`,
      req.user?._id,
      req.user?.role || 'admin'
    );

    await order.save();

    await order.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'statusHistory.updatedBy', select: 'email name contactPerson' }
    ]);

    res.json({
      success: true,
      data: order,
      message: `Discount updated to ৳${discount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Update order discount error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== BULK UPDATE ORDER - CLEAN VERSION (FIXED IMAGES) ==========
const bulkUpdateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customerInfo, 
      items, 
      discount, 
      discountNote, 
      deliveryNote 
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const nonEditableStatuses = [
      'courier_assigned', 'ready_to_ship', 'shipped', 'out_for_delivery',
      'delivered', 'partial_delivery', 'cancelled', 'rejected', 'refunded', 'returned'
    ];
    
    if (nonEditableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order status is '${order.orderStatus}'. Cannot update at this stage.`
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order must have at least one item' 
      });
    }

    const productIds = items.map(item => item.productId).filter(id => id);
    
    // ============================================================
    // ✅ STEP 1: FETCH ALL PRODUCTS - SINGLE SOURCE OF TRUTH
    // ============================================================
    const products = await Product.find({
      _id: { $in: productIds }
    });
    
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });

    // Validate stock
    for (const item of items) {
      if (!item.productId) continue;
      
      const product = productMap[item.productId.toString()];
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: `Product "${item.productName}" not found` 
        });
      }
      
      const totalQuantityForProduct = items
        .filter(i => i.productId && i.productId.toString() === item.productId.toString())
        .reduce((sum, i) => sum + (i.quantity || 0), 0);
      
      if (totalQuantityForProduct > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          error: `"${product.productName}": Total quantity (${totalQuantityForProduct}) exceeds available stock (${product.stockQuantity})`
        });
      }
    }

    if (customerInfo) {
      order.customerInfo = {
        ...order.customerInfo.toObject ? order.customerInfo.toObject() : order.customerInfo,
        ...customerInfo
      };
    }

    if (deliveryNote !== undefined) {
      order.deliveryNote = deliveryNote;
    }

    // ============================================================
    // ✅ STEP 2: PROCESS ITEMS WITH AUTHORITATIVE IMAGES
    // ============================================================
    const processedItems = items.map(item => {
      const productData = item.productId ? 
        productMap[item.productId.toString()] : 
        null;
      
      let productSlug = item.productSlug;
      if (!productSlug && item.productName) {
        productSlug = item.productName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (!productSlug) {
        productSlug = 'unknown-product';
      }
      
      const isSubVariant = !!(item.subVariantId && item.subVariantId !== 'null' && item.subVariantId !== '');
      const isVariant = !!(item.variantId && item.variantId !== 'null' && item.variantId !== '');
      
      let finalRegularPrice = item.regularPrice || productData?.regularPrice || 0;
      let finalDiscountPrice = item.discountPrice || productData?.discountPrice || 0;
      
      if (isSubVariant) {
        if (item.variantDiscountPrice && item.variantDiscountPrice > 0) {
          finalDiscountPrice = item.variantDiscountPrice;
          finalRegularPrice = item.variantRegularPrice || item.regularPrice || productData?.regularPrice || 0;
        } else if (item.variantRegularPrice && item.variantRegularPrice > 0) {
          finalRegularPrice = item.variantRegularPrice;
        }
      } else if (isVariant) {
        if (item.variantDiscountPrice && item.variantDiscountPrice > 0) {
          finalDiscountPrice = item.variantDiscountPrice;
          finalRegularPrice = item.variantRegularPrice || item.regularPrice || productData?.regularPrice || 0;
        } else if (item.variantRegularPrice && item.variantRegularPrice > 0) {
          finalRegularPrice = item.variantRegularPrice;
        }
      }
      
      // ✅ Get the main product image from the product document
      let mainImage = productData?.images?.[0]?.url || item.image || '';
      
      // ✅ Get variant and sub-variant images from the product document
      let variantImage = '';
      let subVariantImage = '';
      
      if (isVariant || isSubVariant) {
        // Find the variant in the product document
        let matchedVariant = null;
        if (productData?.variantTypes) {
          for (const vt of productData.variantTypes) {
            const found = (vt.variants || []).find(v => 
              v.id === item.variantId || v._id?.toString() === item.variantId
            );
            if (found) {
              matchedVariant = found;
              break;
            }
          }
        }
        
        if (matchedVariant) {
          // Get variant image
          if (matchedVariant.images && matchedVariant.images[0]) {
            variantImage = matchedVariant.images[0];
          } else if (matchedVariant.image) {
            variantImage = matchedVariant.image;
          }
          
          // If sub-variant, find it and get its image
          if (isSubVariant && matchedVariant.subVariants) {
            const matchedSubVariant = matchedVariant.subVariants.find(sv => 
              sv.id === item.subVariantId || sv._id?.toString() === item.subVariantId
            );
            if (matchedSubVariant) {
              if (matchedSubVariant.images && matchedSubVariant.images[0]) {
                subVariantImage = matchedSubVariant.images[0];
              } else if (matchedSubVariant.image) {
                subVariantImage = matchedSubVariant.image;
              }
            }
          }
        }
      }
      
      // Build nested variant details with proper images
      const variantDetails = [];
      if (isVariant || isSubVariant) {
        const variantDetail = {
          variantId: item.variantId || null,
          variantName: item.variantName || null,
          variantType: item.variantType || null,
          variantRegularPrice: finalRegularPrice,
          variantDiscountPrice: finalDiscountPrice,
          selectedColor: item.selectedColor || null,
          quantity: item.quantity || 0,
          // ✅ Use variant's own image
          image: variantImage || item.variantImage || '',
          subVariants: []
        };
        
        if (isSubVariant) {
          variantDetail.subVariants.push({
            subVariantId: item.subVariantId,
            subVariantName: item.subVariantName,
            subVariantRegularPrice: finalRegularPrice,
            subVariantDiscountPrice: finalDiscountPrice,
            selectedColor: item.selectedColor || null,
            quantity: item.quantity || 0,
            // ✅ Use sub-variant's own image
            image: subVariantImage || item.image || ''
          });
        }
        
        variantDetails.push(variantDetail);
      }
      
      return {
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        productSlug: productSlug,
        // ✅ Use the main product image from database
        image: mainImage,
        regularPrice: finalRegularPrice,
        discountPrice: finalDiscountPrice,
        costPerItem: item.costPerItem || productData?.costPerItem || 0,
        buyingPrice: item.buyingPrice || productData?.buyingPrice || 0,
        quantity: item.quantity || 1,
        stockQuantity: item.stockQuantity || productData?.stockQuantity || 0,
        unit: item.unit || productData?.unit || 'pcs',
        selectedColor: item.selectedColor || null,
        colors: item.colors || [],
        variantDetails: variantDetails
      };
    });

    order.items = processedItems;

    const oldDiscount = order.discount || 0;
    order.discount = discount || 0;

    let subtotal = 0;
    order.items.forEach(item => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.regularPrice;
      subtotal += price * (item.quantity || 0);
    });

    order.subtotal = subtotal;
    const calculatedTotal = subtotal + (order.shippingCost || 0) - (order.discount || 0);
    order.total = Math.max(0, calculatedTotal);

    let statusNote = `Order updated by admin: `;
    if (items.length !== (order.items ? order.items.length : 0)) {
      statusNote += `Items updated (${items.length} items). `;
    }
    if (discount !== oldDiscount) {
      statusNote += `Discount changed from ৳${oldDiscount.toFixed(2)} to ৳${(discount || 0).toFixed(2)}. `;
    }
    if (discountNote) {
      statusNote += `Note: ${discountNote}`;
    }

    order.addStatusHistory(
      order.orderStatus,
      statusNote,
      req.user?._id,
      req.user?.role || 'admin'
    );

    await order.save();

    await order.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'statusHistory.updatedBy', select: 'email name contactPerson' }
    ]);

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Bulk update order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE PARTIAL DELIVERY ==========
const updatePartialDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryItems, note } = req.body;

    if (!deliveryItems || !Array.isArray(deliveryItems) || deliveryItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'deliveryItems array is required'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const allowedStatuses = [
      'courier_assigned',
      'ready_to_ship',
      'delivered',
      'partial_delivery'
    ];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot update partial delivery from status "${order.orderStatus}"`
      });
    }

    if (!order.deliveryItems || order.deliveryItems.length === 0) {
      order.initializeDeliveryItems();
    }

    const deliveryMap = new Map();
    order.deliveryItems.forEach((di) => {
      deliveryMap.set(di._id.toString(), di);
    });

    // Apply updates
    for (const update of deliveryItems) {
      const di = deliveryMap.get(update._id?.toString());
      if (!di) continue;

      const delivered = Math.max(0, Number(update.deliveredQuantity) || 0);
      const returned = Math.max(0, Number(update.returnedQuantity) || 0);
      const pending = Math.max(0, Number(update.pendingQuantity) || 0);

      const total = delivered + returned + pending;
      if (total !== di.orderedQuantity) {
        return res.status(400).json({
          success: false,
          error: `For "${di.productName}${di.variantName ? ' - ' + di.variantName : ''}${di.subVariantName ? ' - ' + di.subVariantName : ''}": delivered (${delivered}) + returned (${returned}) + pending (${pending}) must equal ordered quantity (${di.orderedQuantity})`
        });
      }

      di.deliveredQuantity = delivered;
      di.returnedQuantity = returned;
      di.pendingQuantity = pending;
      di.note = update.note || di.note || '';
      di.markedBy = req.user?._id || null;
      di.markedAt = new Date();

      if (delivered === di.orderedQuantity) {
        di.deliveryStatus = 'delivered';
      } else if (returned === di.orderedQuantity) {
        di.deliveryStatus = 'returned';
      } else if (pending === di.orderedQuantity) {
        di.deliveryStatus = 'pending';
      } else {
        di.deliveryStatus = 'partial';
      }
    }

    // Compute overall status from delivery items
    const oldStatus = order.orderStatus;
    const newStatus = order.recomputeStatusFromDeliveryItems();

    if (order.orderStatus === 'delivered' && newStatus !== 'delivered') {
      order.deliveredAt = null;
    }

    order.orderStatus = newStatus;

    // ✅ NEW: Recompute payment
    order.recomputePaymentFromDelivery();

    // If fully delivered → COD auto-paid to full amount
    if (newStatus === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        order.paidAmount = order.total;
        order.returnedAmount = 0;
        order.refundableAmount = 0;
        if (!order.paymentDetails) order.paymentDetails = {};
        order.paymentDetails.paidAt = new Date();
        order.paymentDetails.paidBy = 'System (Auto-updated on full delivery)';
      }
    } else if (newStatus === 'returned') {
      order.returnedAt = new Date();
      // Nothing delivered → nothing to pay
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'pending';
        order.paidAmount = 0;
      }
    } else if (newStatus === 'partial_delivery') {
      // recomputePaymentFromDelivery already set 'partial' or 'pending' or 'paid'
    }

    // Build summary for history
    const summary = order.deliveryItems
      .filter(di => di.deliveredQuantity > 0 || di.returnedQuantity > 0)
      .map(di => {
        const label = [di.productName, di.variantName, di.subVariantName].filter(Boolean).join(' / ');
        return `${label}: D${di.deliveredQuantity} R${di.returnedQuantity} P${di.pendingQuantity}`;
      })
      .join('; ');

    let historyNote = `Partial delivery updated. ${summary}`;
    if (note) historyNote += ` | Note: ${note}`;
    historyNote += ` | Paid: ৳${order.paidAmount.toFixed(2)}`;
    if (order.returnedAmount > 0) {
      historyNote += ` | Returned value: ৳${order.returnedAmount.toFixed(2)}`;
    }

    order.addStatusHistory(
      newStatus,
      historyNote,
      req.user?._id,
      req.user?.role || 'admin'
    );

    await order.save();

    // Email if fully delivered or returned
    if (['delivered', 'returned'].includes(newStatus) && oldStatus !== newStatus) {
      if (order.customerInfo?.email && order.customerInfo.email.trim() !== '') {
        try {
          const { sendOrderStatusUpdateEmail } = require('../utils/orderEmailService');
          await sendOrderStatusUpdateEmail(order, order.customerInfo.email, oldStatus, newStatus);
        } catch (e) {
          console.error('Email error:', e.message);
        }
      }
    }

    res.json({
      success: true,
      data: order,
      message: `Partial delivery saved. Order is now "${newStatus}". Paid: ৳${order.paidAmount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Update partial delivery error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET PARTIAL DELIVERY ITEMS ==========
const getPartialDeliveryItems = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!order.deliveryItems || order.deliveryItems.length === 0) {
      order.initializeDeliveryItems();
      await order.save();
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paidAmount: order.paidAmount || 0,
        returnedAmount: order.returnedAmount || 0,
        refundableAmount: order.refundableAmount || 0,
        total: order.total,
        deliveryItems: order.deliveryItems
      }
    });
  } catch (error) {
    console.error('Get partial delivery items error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== EXPORTS ==========
module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  prepareOrder,
  deleteOrder,
  updateOrder,
  createDeliveryOrder,
  getOrderTracking,
  trackOrderByPhone,
  getPublicOrder,
  getAgentOrders,
  updateAgentOrderStatus,
  getAgentDashboard,
  checkOrderRestrictions,
  updateDeliveryStatus,
  getFilteredOrderStats,
  addProductToOrder,
  removeProductFromOrder,
  updateOrderDiscount,
  searchProductsForOrder,
  bulkUpdateOrder,
  getBulkTrackingStatuses,
  updatePartialDelivery,
  getPartialDeliveryItems
};