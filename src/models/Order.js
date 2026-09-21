

const mongoose = require('mongoose');

// ========== SUB-VARIANT SCHEMA ==========
const subVariantSchema = new mongoose.Schema({
  subVariantId: {
    type: String,
    default: null
  },
  subVariantName: {
    type: String,
    default: null
  },
  subVariantRegularPrice: {
    type: Number,
    default: 0
  },
  subVariantDiscountPrice: {
    type: Number,
    default: 0
  },
  selectedColor: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  }
}, { _id: true });

// ========== VARIANT SCHEMA ==========
const variantDetailSchema = new mongoose.Schema({
  variantId: {
    type: String,
    default: null
  },
  variantName: {
    type: String,
    default: null
  },
  variantType: {
    type: String,
    default: null
  },
  variantRegularPrice: {
    type: Number,
    default: 0
  },
  variantDiscountPrice: {
    type: Number,
    default: 0
  },
  selectedColor: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  },
  subVariants: [subVariantSchema]
}, { _id: true });

// ========== ORDER ITEM SCHEMA - CLEAN VERSION ==========
const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productName: { 
    type: String, 
    required: true 
  },
  productSlug: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  regularPrice: { 
    type: Number, 
    required: true 
  },
  discountPrice: { 
    type: Number, 
    default: 0 
  },
  costPerItem: { 
    type: Number, 
    default: 0 
  },
  buyingPrice: { 
    type: Number, 
    default: 0 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 1 
  },
  stockQuantity: { 
    type: Number, 
    default: 0 
  },
  unit: {  
    type: String,
    default: 'pcs'
  },
  selectedColor: {
    type: String,
    default: null
  },
  colors: [{
    color: String,
    quantity: Number,
    price: Number
  }],
  
  // ============================================================
  // ✅ NESTED STRUCTURE FOR VARIANTS AND SUB-VARIANTS
  // ============================================================
  variantDetails: [variantDetailSchema]
  
  // ❌ REMOVED: All flat fields (variantId, variantName, variantType, 
  // subVariantId, subVariantName, variantRegularPrice, variantDiscountPrice,
  // isSubVariant, isVariant, isBaseProduct)
  // These are no longer needed since we use the nested structure
});

// ========== CUSTOMER INFO SCHEMA ==========
const customerInfoSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: false,
    default: '' 
  },
  phone: { 
    type: String, 
    required: true 
  },
  division: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  zone: { 
    type: String, 
    required: true 
  },
  area: { 
    type: String, 
    default: '' 
  },
  zipCode: { 
    type: String, 
    default: '' 
  },
  country: { 
    type: String, 
    default: 'Bangladesh' 
  },
  note: { 
    type: String, 
    default: '' 
  }
});

// ========== ORDER STATUS HISTORY SCHEMA ==========
const orderStatusHistorySchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['placed', 'follow_up', 'accepted', 'approved', 'ready_to_ship', 'courier_assigned', 'rejected', 'cancelled', 'reminder', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'refunded', 'failed', 'returned', 'partial_delivery', 'hold'],
    required: true 
  },
  note: { 
    type: String, 
    default: '' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  updatedByRole: { 
    type: String,
    enum: ['user','super_admin', 'admin', 'moderator', 'system', 'courier', 'call_center'],
    default: 'system'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: true });

// ========== DELIVERY STATUS HISTORY SCHEMA ==========
const deliveryStatusHistorySchema = new mongoose.Schema({
  status: { 
    type: String,
    required: true 
  },
  message: { 
    type: String, 
    default: '' 
  },
  location: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: true });

// ========== DELIVERY SERVICE SCHEMA ==========
const deliveryServiceSchema = new mongoose.Schema({
  courierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Courier' 
  },
  courierName: { 
    type: String, 
    default: '' 
  },
  courierSlug: { 
    type: String, 
    default: '' 
  },
  trackingNumber: { 
    type: String, 
    default: null 
  },
  trackingUrl: { 
    type: String, 
    default: '' 
  },
  courierOrderId: { 
    type: String, 
    default: '' 
  },
  labelUrl: { 
    type: String, 
    default: '' 
  },
  invoiceUrl: { 
    type: String, 
    default: '' 
  },
  deliveryStatus: { 
    type: String,
    default: 'pending' 
  },
  deliveryStatusHistory: [deliveryStatusHistorySchema],
  deliveryCharge: { 
    type: Number, 
    default: 0 
  },
  codCharge: { 
    type: Number, 
    default: 0 
  },
  totalDeliveryCharge: { 
    type: Number, 
    default: 0 
  },
  deliveryNote: { 
    type: String, 
    default: '' 
  },
  weight: { 
    type: Number, 
    default: 0 
  },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  estimatedDeliveryDate: { 
    type: Date, 
    default: null 
  },
  actualDeliveryDate: { 
    type: Date, 
    default: null 
  },
  pickedUpDate: { 
    type: Date, 
    default: null 
  },
  courierResponse: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  webhookData: [{
    courier: String,
    timestamp: Date,
    rawData: mongoose.Schema.Types.Mixed,
    rawStatus: String,
    status: String,
    message: String
  }]
}, { _id: false });

// ========== DEVICE INFO SCHEMA ==========
const deviceInfoSchema = new mongoose.Schema({
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  browser: { type: String, default: null },
  browserVersion: { type: String, default: null },
  os: { type: String, default: null },
  osVersion: { type: String, default: null },
  platform: { type: String, default: null },
  screenResolution: { type: String, default: null },
  viewportSize: { type: String, default: null },
  colorDepth: { type: Number, default: null },
  pixelRatio: { type: Number, default: null },
  timezone: { type: String, default: null },
  language: { type: String, default: null },
  referrer: { type: String, default: null },
  connectionType: { type: String, default: null },
  connectionSpeed: { type: String, default: null },
  doNotTrack: { type: String, default: null },
  vendor: { type: String, default: null }
}, { _id: false });

// ========== MAIN ORDER SCHEMA ==========
const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    sparse: true, 
    index: true 
  },
  sessionId: { 
    type: String, 
    sparse: true, 
    index: true 
  },
  items: [orderItemSchema],
  customerInfo: customerInfoSchema,
  subtotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  shippingCost: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  couponCode: { 
    type: String, 
    default: null 
  },
  couponDiscount: { 
    type: Number, 
    default: 0 
  },
  freeShipping: { 
    type: Boolean, 
    default: false 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'online', 'bkash', 'nagad', 'rocket'], 
    required: true, 
    default: 'cod' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'partial'], 
    default: 'pending' 
  },
  paymentDetails: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  transactionId: { 
    type: String, 
    default: null, 
    index: true 
  },
  paymentSession: { 
    sessionKey: String, 
    gatewayUrl: String, 
    initiatedAt: Date 
  },
  orderStatus: { 
    type: String, 
    enum: ['placed', 'follow_up', 'accepted', 'approved', 'ready_to_ship', 'courier_assigned', 'rejected', 'cancelled', 'reminder', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'refunded', 'returned', 'failed', 'partial_delivery', 'hold'],
    default: 'placed' 
  },
  statusHistory: [orderStatusHistorySchema],
  deliveryService: deliveryServiceSchema,
  trackingNumber: { 
    type: String, 
    default: null 
  },
  deliveryNote: { 
    type: String, 
    default: '' 
  },
  deviceInfo: deviceInfoSchema,
  orderNumber: { 
    type: String, 
    unique: true 
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  },
  placedAt: { 
    type: Date, 
    default: Date.now 
  },
  followUpAt: { 
    type: Date, 
    default: null 
  },
  acceptedAt: { 
    type: Date, 
    default: null 
  },
  processingAt: { 
    type: Date, 
    default: null 
  },
  shippedAt: { 
    type: Date, 
    default: null 
  },
  deliveredAt: { 
    type: Date, 
    default: null 
  },
  cancelledAt: { 
    type: Date, 
    default: null 
  },
  reminderAt: { 
    type: Date, 
    default: null 
  },
  approvedAt: { 
    type: Date, 
    default: null 
  },
  returnedAt: { 
    type: Date, 
    default: null 
  },
  rejectionReason: { 
    type: String, 
    default: '' 
  },
  cancellationReason: { 
    type: String, 
    default: '' 
  },
  restrictionViolation: {
    type: String,
    enum: ['ip_blocked', 'phone_blocked', 'email_blocked', 'ip_time_interval', 'phone_time_interval', 'none'],
    default: 'none'
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========== INDEXES ==========
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'deliveryService.trackingNumber': 1 });
orderSchema.index({ 'deliveryService.courierOrderId': 1 });
orderSchema.index({ 'customerInfo.phone': 1 });
orderSchema.index({ placedAt: -1 });

// ========== PRE-SAVE HOOK ==========
orderSchema.pre('save', async function() {
  // if (!this.orderNumber) {
  //   try {
  //     const now = new Date();
  //     const year = now.getFullYear().toString().slice(-2);
  //     const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
  //     const Order = mongoose.model('Order');
      
  //     const lastOrder = await Order.findOne({
  //       orderNumber: { $regex: `^BB${year}${month}` }
  //     })
  //     .sort({ orderNumber: -1 })
  //     .lean();
      
  //     let sequenceNumber = 1;
      
  //     if (lastOrder && lastOrder.orderNumber) {
  //       const match = lastOrder.orderNumber.match(/BB\d{4}(\d{4})/);
  //       if (match) {
  //         sequenceNumber = parseInt(match[1]) + 1;
  //       }
  //     }
      
  //     const paddedNumber = sequenceNumber.toString().padStart(4, '0');
  //     const newOrderNumber = `BB${year}${month}${paddedNumber}`;
      
  //     const existingOrder = await Order.findOne({ orderNumber: newOrderNumber });
  //     if (existingOrder) {
  //       const nextSeq = sequenceNumber + 1;
  //       const nextPadded = nextSeq.toString().padStart(4, '0');
  //       this.orderNumber = `BB${year}${month}${nextPadded}`;
  //     } else {
  //       this.orderNumber = newOrderNumber;
  //     }
      
  //     console.log(`✅ Generated Order Number: ${this.orderNumber}`);
  //   } catch (error) {
  //     console.error('Error generating order number:', error);
  //     const timestamp = Date.now().toString().slice(-6);
  //     this.orderNumber = `BB${timestamp}`;
  //   }
  // }

  if (!this.orderNumber) {
  try {
    const Order = mongoose.model('Order');
    
    // Find the last order number starting with "BB" (excluding legacy YYMM format)
    // Sort by numeric suffix descending
    const lastOrder = await Order.findOne({
      orderNumber: { $regex: /^BB\d{4,}$/ }
    })
    .sort({ orderNumber: -1 })
    .lean();
    
    let nextSequence = 1001; // ✅ Start from 1001
    
    if (lastOrder && lastOrder.orderNumber) {
      // Extract trailing digits after "BB"
      const match = lastOrder.orderNumber.match(/^BB(\d+)$/);
      if (match) {
        const lastSeq = parseInt(match[1], 10);
        // Guard against legacy YYMMNNNN numbers (8 digits) — ignore those
        if (lastSeq >= 1001 && lastSeq < 100000) {
          nextSequence = lastSeq + 1;
        }
      }
    }
    
    let newOrderNumber = `BB${nextSequence}`;
    
    // ✅ Ensure uniqueness (retry if collision from race conditions)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await Order.findOne({ orderNumber: newOrderNumber }).lean();
      if (!existing) break;
      nextSequence += 1;
      newOrderNumber = `BB${nextSequence}`;
      attempts += 1;
    }
    
    this.orderNumber = newOrderNumber;
    console.log(`✅ Generated Order Number: ${this.orderNumber}`);
    
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback: timestamp-based but still BB-prefixed
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `BB${timestamp}`;
  }
}
  
  if (this.isNew && this.orderStatus === 'placed') {
    this.placedAt = new Date();
  }
  
  if (this.isNew && this.orderStatus) {
    this.addStatusHistory(
      this.orderStatus, 
      'Order placed successfully', 
      this.userId || null, 
      'system'
    );
  }
  
  if (this.isModified('orderStatus')) {
    const previousStatus = this._originalStatus || this.orderStatus;
    if (previousStatus !== this.orderStatus) {
      this.addStatusHistory(
        this.orderStatus, 
        `Status changed from ${previousStatus} to ${this.orderStatus}`,
        this.userId || null,
        'system'
      );
    }
  }
  
  this._originalStatus = this.orderStatus;
});

// ========== METHODS ==========

orderSchema.methods.addStatusHistory = function(status, note = '', updatedBy = null, updatedByRole = 'system') {
  if (!this.statusHistory) {
    this.statusHistory = [];
  }
  
  const lastEntry = this.statusHistory[this.statusHistory.length - 1];
  if (lastEntry && lastEntry.status === status && lastEntry.note === note) {
    return this;
  }

  let validRole = updatedByRole || 'system';
  
  if (validRole === 'call_center_agent') {
    validRole = 'call_center';
  }
  
  const validRoles = ['user', 'admin', 'moderator', 'super_admin', 'system', 'courier', 'call_center'];
  if (!validRoles.includes(validRole)) {
    validRole = 'system';
  }
  
  this.statusHistory.push({
    status,
    note: note || `Status: ${status}`,
    updatedBy,
    updatedByRole: validRole,
    timestamp: new Date()
  });
  
  return this;
};

orderSchema.methods.updateOrderStatus = function(newStatus, note = '', updatedBy = null, updatedByRole = 'system') {
  const oldStatus = this.orderStatus;
  
  if (oldStatus === newStatus) {
    return this;
  }
  
  this.orderStatus = newStatus;
  
  const timestampMap = {
    'placed': 'placedAt',
    'follow_up': 'followUpAt',
    'accepted': 'acceptedAt',
    'approved': 'approvedAt',
    'ready_to_ship': 'shippedAt',
    'courier_assigned': 'shippedAt',
    'rejected': 'cancelledAt',
    'cancelled': 'cancelledAt',
    'reminder': 'reminderAt',
    'delivered': 'deliveredAt'
  };
  
  if (timestampMap[newStatus]) {
    this[timestampMap[newStatus]] = new Date();
  }
  
  this.addStatusHistory(newStatus, note || `Status changed from ${oldStatus} to ${newStatus}`, updatedBy, updatedByRole);
  
  return this;
};

orderSchema.methods.updateDeliveryStatus = function(status, message = '', location = '') {
  if (!this.deliveryService) {
    this.deliveryService = {};
  }
  
  const oldStatus = this.deliveryService.deliveryStatus || 'pending';
  
  this.deliveryService.deliveryStatus = status;
  
  if (!this.deliveryService.deliveryStatusHistory) {
    this.deliveryService.deliveryStatusHistory = [];
  }
  
  this.deliveryService.deliveryStatusHistory.push({
    status: status,
    message: message || `Status updated to ${status}`,
    location: location || '',
    timestamp: new Date()
  });
  
  if (status === 'delivered') {
    this.orderStatus = 'delivered';
    this.deliveredAt = new Date();
    this.addStatusHistory('delivered', 'Order delivered by courier', null, 'courier');
    
    if (this.paymentMethod === 'cod' && this.paymentStatus !== 'paid') {
      this.paymentStatus = 'paid';
      console.log(`✅ COD order ${this.orderNumber} - Payment auto-updated to Paid on delivery`);
      
      if (!this.paymentDetails) {
        this.paymentDetails = {};
      }
      this.paymentDetails.paidAt = new Date();
      this.paymentDetails.paidBy = 'System (Auto-updated via webhook)';
    }
  }
  
  if (status === 'picked_up' && !this.deliveryService.pickedUpDate) {
    this.deliveryService.pickedUpDate = new Date();
  }
  
  if (status === 'delivered') {
    this.deliveryService.actualDeliveryDate = new Date();
  }
  
  return this;
};

orderSchema.methods.setDeliveryService = function(courierData) {
  this.deliveryService = {
    courierId: courierData.courierId || null,
    courierName: courierData.courierName || '',
    courierSlug: courierData.courierSlug || '',
    trackingNumber: courierData.trackingNumber || null,
    trackingUrl: courierData.trackingUrl || '',
    courierOrderId: courierData.courierOrderId || '',
    labelUrl: courierData.labelUrl || '',
    invoiceUrl: courierData.invoiceUrl || '',
    deliveryStatus: courierData.deliveryStatus || 'processing',
    deliveryCharge: courierData.deliveryCharge || 0,
    codCharge: courierData.codCharge || 0,
    totalDeliveryCharge: courierData.totalDeliveryCharge || 0,
    weight: courierData.weight || 0,
    dimensions: courierData.dimensions || { length: 0, width: 0, height: 0 },
    estimatedDeliveryDate: courierData.estimatedDeliveryDate || null,
    courierResponse: courierData.courierResponse || {},
    deliveryStatusHistory: [
      {
        status: 'processing',
        message: `Delivery order created with ${courierData.courierName}`,
        timestamp: new Date()
      }
    ]
  };
  
  this.trackingNumber = courierData.trackingNumber || null;
  
  return this;
};

// ========== VIRTUALS ==========
// orderSchema.virtual('formattedOrderNumber').get(function() {
//   if (this.orderNumber) {
//     const match = this.orderNumber.match(/(BB)(\d{2})(\d{2})(\d{4})/);
//     if (match) {
//       return `${match[1]}-${match[2]}${match[3]}-${match[4]}`;
//     }
//   }
//   return this.orderNumber;
// });

orderSchema.virtual('formattedOrderNumber').get(function() {
  if (this.orderNumber) {
    const match = this.orderNumber.match(/^BB(\d+)$/);
    if (match) {
      // Optional: pad to 4 digits and show as BB-1001
      return `BB-${match[1].padStart(4, '0')}`;
    }
  }
  return this.orderNumber;
});

orderSchema.virtual('hasDeliveryService').get(function() {
  return !!(this.deliveryService && this.deliveryService.courierOrderId);
});

orderSchema.virtual('isDelivered').get(function() {
  return this.orderStatus === 'delivered';
});

orderSchema.virtual('isCancelled').get(function() {
  return this.orderStatus === 'cancelled';
});

orderSchema.virtual('canCreateDelivery').get(function() {
  const canCreateStatuses = ['accepted', 'approved', 'hold', 'processing', 'ready_to_ship'];
  return canCreateStatuses.includes(this.orderStatus) && 
         !this.deliveryService?.courierOrderId;
});

orderSchema.virtual('statusLabels').get(function() {
  const statusMap = {
    'placed': 'Order Placed',
    'follow_up': 'Follow Up',
    'accepted': 'Accepted',
    'approved': 'Approved',
    'hold': 'On Hold',  
    'ready_to_ship': 'Ready to Ship',
    'courier_assigned': 'Courier Assigned',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'reminder': 'Reminder',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'returned': 'Returned',
    'partial_delivery': 'Partial Delivery'
  };
  return statusMap[this.orderStatus] || this.orderStatus;
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);