

// // utils/welcomeEmailService.js
// const { sendEmail, getFromAddress } = require('./emailService');

// // BeautyBucket Brand Colors - Pink/Magenta Beauty Theme
// const BEAUTY_BUCKET_COLORS = {
//   primary: '#EE4275',        // Bold Pink
//   secondary: '#FF6B9D',      // Light Pink
//   accent: '#FF6B9D',         // Pink accent
//   darkPink: '#D63A6A',       // Darker Pink
//   textDark: '#2D1B2E',       // Dark Purple-Black
//   textLight: '#8B7A8C',      // Muted Purple
//   white: '#FFFFFF',          // White
//   lightBg: '#FFF5F6',        // Very Light Pink background
//   border: '#FFD2DB',         // Light Pink border
//   success: '#4CAF50',        // Green for success
//   warning: '#FF8C00',        // Orange for warnings
//   gold: '#FFD700'            // Gold for accent
// };

// /**
//  * Send welcome email to newly registered customer (Regular Signup)
//  * @param {string} email - Customer email
//  * @param {string} name - Customer name (contactPerson)
//  */
// const sendWelcomeEmail = async (email, name) => {
//   console.log('📧 Sending welcome email to:', email);
  
//   try {
//     // Get from address from database settings (system type)
//     const from = await getFromAddress('system');
    
//     if (!from.email) {
//       throw new Error('System email not configured. Please set up email settings in admin panel.');
//     }

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     const currentYear = new Date().getFullYear();

//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
//           body { 
//             font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
//             line-height: 1.6; 
//             color: ${BEAUTY_BUCKET_COLORS.textDark}; 
//             margin: 0;
//             padding: 0;
//             background-color: ${BEAUTY_BUCKET_COLORS.lightBg};
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: ${BEAUTY_BUCKET_COLORS.white};
//             border-radius: 20px;
//             overflow: hidden;
//             box-shadow: 0 8px 40px rgba(238, 66, 117, 0.12);
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .header {
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             padding: 40px 20px 35px;
//             text-align: center;
//             position: relative;
//           }
//           .header::after {
//             content: '';
//             position: absolute;
//             bottom: 0;
//             left: 0;
//             right: 0;
//             height: 4px;
//             background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});
//           }
//           .header h1 {
//             color: ${BEAUTY_BUCKET_COLORS.white};
//             margin: 0;
//             font-size: 30px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 12px;
//             font-weight: 700;
//             font-family: 'Playfair Display', 'Georgia', serif;
//             letter-spacing: 1px;
//           }
//           .header h1 span:first-child {
//             font-size: 36px;
//           }
//           .header .subtitle {
//             color: rgba(255,255,255,0.9);
//             margin: 10px 0 0;
//             font-size: 15px;
//             font-family: 'Playfair Display', 'Georgia', serif;
//             letter-spacing: 2px;
//           }
//           .content {
//             padding: 35px 30px;
//             text-align: left;
//           }
//           .welcome-message {
//             font-size: 16px;
//             margin-bottom: 25px;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//           }
//           .welcome-message strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .welcome-message .highlight {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             font-weight: 700;
//           }
//           .benefits-box {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary};
//             padding: 20px 25px;
//             margin: 25px 0;
//             border-radius: 14px;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .benefits-box h3 {
//             margin: 0 0 15px 0;
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             font-size: 17px;
//             font-weight: 700;
//             font-family: 'Playfair Display', 'Georgia', serif;
//           }
//           .benefits-list {
//             list-style: none;
//             padding: 0;
//             margin: 0;
//           }
//           .benefits-list li {
//             padding: 10px 0;
//             display: flex;
//             align-items: center;
//             gap: 14px;
//             border-bottom: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             font-size: 14px;
//           }
//           .benefits-list li:last-child {
//             border-bottom: none;
//           }
//           .benefits-list li span:first-child {
//             font-size: 24px;
//           }
//           .benefits-list li strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .btn-primary {
//             display: inline-block;
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             color: #FFFFFF !important;
//             padding: 14px 40px;
//             text-decoration: none;
//             border-radius: 50px;
//             font-weight: 600;
//             margin: 20px 0;
//             text-align: center;
//             font-size: 14px;
//             letter-spacing: 0.5px;
//             box-shadow: 0 4px 20px rgba(238, 66, 117, 0.3);
//             transition: all 0.3s ease;
//           }
//           .btn-primary:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 30px rgba(238, 66, 117, 0.4);
//           }
//           .footer {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 25px;
//             text-align: center;
//             font-size: 12px;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .social-links {
//             margin: 15px 0;
//           }
//           .social-links a {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             text-decoration: none;
//             margin: 0 12px;
//             font-weight: 600;
//             font-size: 13px;
//             transition: color 0.3s ease;
//           }
//           .social-links a:hover {
//             color: ${BEAUTY_BUCKET_COLORS.darkPink};
//           }
//           .support-box {
//             margin-top: 25px;
//             padding: 20px 25px;
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             border-radius: 14px;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .support-box p {
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             margin: 0 0 10px 0;
//             font-size: 14px;
//           }
//           .support-box a {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             text-decoration: none;
//             font-weight: 500;
//             transition: color 0.3s ease;
//           }
//           .support-box a:hover {
//             color: ${BEAUTY_BUCKET_COLORS.darkPink};
//           }
//           .support-box strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .divider {
//             height: 2px;
//             background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent);
//             margin: 20px 0;
//           }
//           .footer-links a {
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             text-decoration: none;
//             margin: 0 8px;
//             transition: color 0.3s ease;
//           }
//           .footer-links a:hover {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>💖</span>
//               <span>Welcome to BeautyBucket!</span>
//               <span>✨</span>
//             </h1>
//             <p class="subtitle">✨ Your Beauty Journey Starts Here ✨</p>
//           </div>
          
//           <div class="content">
//             <div class="welcome-message">
//               <p>Dear <strong>${name}</strong>,</p>
//               <p>🎉 <span class="highlight">Welcome to the BeautyBucket family!</span> We're absolutely thrilled to have you on board!</p>
//               <p>Your account has been successfully created and verified. Get ready for an amazing experience with premium beauty products, exclusive deals, and personalized service!</p>
//             </div>
            
//             <div class="benefits-box">
//               <h3>
//                 <span>💄</span>
//                 <span>What Awaits You at BeautyBucket</span>
//               </h3>
//               <ul class="benefits-list">
//                 <li><span>💄</span> <span><strong>Premium Beauty Products</strong> - Curated selection of top-quality cosmetics</span></li>
//                 <li><span>✨</span> <span><strong>Genuine Authenticity</strong> - 100% authentic beauty products guaranteed</span></li>
//                 <li><span>🚚</span> <span><strong>Fast Delivery</strong> - Quick shipping across Bangladesh</span></li>
//                 <li><span>💝</span> <span><strong>Expert Support</strong> - Our beauty experts are here for you</span></li>
//                 <li><span>🎯</span> <span><strong>Exclusive Offers</strong> - Special discounts for our members</span></li>
//               </ul>
//             </div>
            
//             <div style="text-align: center;">
//               <a href="${frontendUrl}/customer/dashboard" class="btn-primary" style="color: #FFFFFF !important; text-decoration: none; display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #EE4275, #FF6B9D); border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(238, 66, 117, 0.3);">
//                 💖 Go to Your Dashboard →
//               </a>
//             </div>
            
//             <div class="divider"></div>
            
//             <div class="support-box">
//               <p><strong>💖 Need Help?</strong></p>
//               <p>Our friendly beauty team is here for you!</p>
//               <p style="margin: 10px 0 0 0;">
//                 📧 <a href="mailto:${from.email}">${from.email}</a><br>
//                 📞 +880 1234 567890
//               </p>
//             </div>
//           </div>
          
//           <div class="footer">
//             <p style="margin: 5px 0;">&copy; ${currentYear} BeautyBucket. All rights reserved.</p>
//             <p style="margin: 5px 0; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">
//               💖 Beauty is our passion. Thank you for being part of our beauty community! 💖
//             </p>
//             <div class="footer-links">
//               <a href="${frontendUrl}/privacy">Privacy Policy</a> | 
//               <a href="${frontendUrl}/terms">Terms of Service</a>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Send email using system configuration
//     const result = await sendEmail(
//       email,
//       `💖 Welcome to BeautyBucket, ${name}! ✨`,
//       htmlContent,
//       null,
//       'system'
//     );

//     if (result.success) {
//       console.log('✅ Welcome email sent to:', email, 'Message ID:', result.messageId);
//       return { success: true, messageId: result.messageId };
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Welcome email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send welcome email for Google signup users
//  * @param {string} email - Customer email
//  * @param {string} name - Customer name
//  * @param {boolean} requiresProfileCompletion - Whether profile needs completion
//  */
// const sendGoogleWelcomeEmail = async (email, name, requiresProfileCompletion = true) => {
//   console.log('📧 Sending Google welcome email to:', email);
  
//   try {
//     // Get from address from database settings (system type)
//     const from = await getFromAddress('system');
    
//     if (!from.email) {
//       throw new Error('System email not configured. Please set up email settings in admin panel.');
//     }

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//     const currentYear = new Date().getFullYear();

//     const profileNote = requiresProfileCompletion ? `
//       <div style="margin: 25px 0; padding: 20px 25px; background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary}; border-radius: 14px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//         <h3 style="margin: 0 0 10px 0; color: ${BEAUTY_BUCKET_COLORS.primary}; display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; font-family: 'Playfair Display', 'Georgia', serif;">
//           <span>📝</span>
//           <span>Complete Your Profile</span>
//         </h3>
//         <p style="margin: 0; font-size: 14px; color: ${BEAUTY_BUCKET_COLORS.textLight};">Please visit your dashboard to complete your profile information so we can personalize your beauty recommendations and provide the best experience for you!</p>
//       </div>
//     ` : '';

//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
//           body { 
//             font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
//             line-height: 1.6; 
//             color: ${BEAUTY_BUCKET_COLORS.textDark}; 
//             margin: 0;
//             padding: 0;
//             background-color: ${BEAUTY_BUCKET_COLORS.lightBg};
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: ${BEAUTY_BUCKET_COLORS.white};
//             border-radius: 20px;
//             overflow: hidden;
//             box-shadow: 0 8px 40px rgba(238, 66, 117, 0.12);
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .header {
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             padding: 40px 20px 35px;
//             text-align: center;
//             position: relative;
//           }
//           .header::after {
//             content: '';
//             position: absolute;
//             bottom: 0;
//             left: 0;
//             right: 0;
//             height: 4px;
//             background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});
//           }
//           .header h1 {
//             color: ${BEAUTY_BUCKET_COLORS.white};
//             margin: 0;
//             font-size: 30px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 12px;
//             font-weight: 700;
//             font-family: 'Playfair Display', 'Georgia', serif;
//             letter-spacing: 1px;
//           }
//           .header h1 span:first-child {
//             font-size: 36px;
//           }
//           .header .subtitle {
//             color: rgba(255,255,255,0.9);
//             margin: 10px 0 0;
//             font-size: 15px;
//             font-family: 'Playfair Display', 'Georgia', serif;
//             letter-spacing: 2px;
//           }
//           .content {
//             padding: 35px 30px;
//             text-align: left;
//           }
//           .welcome-message {
//             font-size: 16px;
//             margin-bottom: 25px;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//           }
//           .welcome-message strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .welcome-message .highlight {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             font-weight: 700;
//           }
//           .google-badge {
//             display: inline-flex;
//             align-items: center;
//             gap: 10px;
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 10px 20px;
//             border-radius: 50px;
//             font-size: 13px;
//             margin: 10px 0 15px;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//           }
//           .google-badge strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .benefits-box {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary};
//             padding: 20px 25px;
//             margin: 25px 0;
//             border-radius: 14px;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .benefits-box h3 {
//             margin: 0 0 15px 0;
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             font-size: 17px;
//             font-weight: 700;
//             font-family: 'Playfair Display', 'Georgia', serif;
//           }
//           .benefits-list {
//             list-style: none;
//             padding: 0;
//             margin: 0;
//           }
//           .benefits-list li {
//             padding: 10px 0;
//             display: flex;
//             align-items: center;
//             gap: 14px;
//             border-bottom: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             font-size: 14px;
//           }
//           .benefits-list li:last-child {
//             border-bottom: none;
//           }
//           .benefits-list li span:first-child {
//             font-size: 24px;
//           }
//           .benefits-list li strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .btn-primary {
//             display: inline-block;
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             color: #FFFFFF !important;
//             padding: 14px 40px;
//             text-decoration: none;
//             border-radius: 50px;
//             font-weight: 600;
//             margin: 20px 0;
//             text-align: center;
//             font-size: 14px;
//             letter-spacing: 0.5px;
//             box-shadow: 0 4px 20px rgba(238, 66, 117, 0.3);
//             transition: all 0.3s ease;
//           }
//           .btn-primary:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 30px rgba(238, 66, 117, 0.4);
//           }
//           .footer {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 25px;
//             text-align: center;
//             font-size: 12px;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .social-links {
//             margin: 15px 0;
//           }
//           .social-links a {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             text-decoration: none;
//             margin: 0 12px;
//             font-weight: 600;
//             font-size: 13px;
//             transition: color 0.3s ease;
//           }
//           .social-links a:hover {
//             color: ${BEAUTY_BUCKET_COLORS.darkPink};
//           }
//           .support-box {
//             margin-top: 25px;
//             padding: 20px 25px;
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             border-radius: 14px;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .support-box p {
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             margin: 0 0 10px 0;
//             font-size: 14px;
//           }
//           .support-box a {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             text-decoration: none;
//             font-weight: 500;
//             transition: color 0.3s ease;
//           }
//           .support-box a:hover {
//             color: ${BEAUTY_BUCKET_COLORS.darkPink};
//           }
//           .support-box strong {
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .divider {
//             height: 2px;
//             background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent);
//             margin: 20px 0;
//           }
//           .footer-links a {
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//             text-decoration: none;
//             margin: 0 8px;
//             transition: color 0.3s ease;
//           }
//           .footer-links a:hover {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>🔐</span>
//               <span>Welcome to BeautyBucket!</span>
//               <span>✨</span>
//             </h1>
//             <p class="subtitle">✨ Your Beauty Journey Starts Here ✨</p>
//           </div>
          
//           <div class="content">
//             <div class="welcome-message">
//               <p>Dear <strong>${name}</strong>,</p>
//               <div class="google-badge">
//                 <span>🔐</span>
//                 <span>You've signed up with <strong>Google</strong></span>
//               </div>
//               <p>🎉 <span class="highlight">Welcome to the BeautyBucket family!</span> We're so excited to have you join our beauty community!</p>
//               <p>Your account has been successfully created with Google Sign-In. Get ready to explore our curated collection of premium beauty products!</p>
//             </div>
            
//             ${profileNote}
            
//             <div class="benefits-box">
//               <h3>
//                 <span>💄</span>
//                 <span>Your BeautyBucket Benefits</span>
//               </h3>
//               <ul class="benefits-list">
//                 <li><span>💄</span> <span><strong>Premium Beauty Products</strong> - Curated selection of top-quality cosmetics</span></li>
//                 <li><span>✨</span> <span><strong>Genuine Authenticity</strong> - 100% authentic beauty products guaranteed</span></li>
//                 <li><span>🚚</span> <span><strong>Fast Delivery</strong> - Quick shipping across Bangladesh</span></li>
//                 <li><span>💝</span> <span><strong>Expert Support</strong> - Our beauty experts are here for you</span></li>
//                 <li><span>🎯</span> <span><strong>Exclusive Offers</strong> - Special discounts for our members</span></li>
//               </ul>
//             </div>
            
//             <div style="text-align: center;">
//               <a href="${frontendUrl}/customer/dashboard" class="btn-primary" style="color: #FFFFFF !important; text-decoration: none; display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #EE4275, #FF6B9D); border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(238, 66, 117, 0.3);">
//                 💖 Go to Your Dashboard →
//               </a>
//             </div>
            
//             <div class="divider"></div>
            
//             <div class="support-box">
//               <p><strong>💖 Need Help?</strong></p>
//               <p>Our friendly beauty team is here for you!</p>
//               <p style="margin: 10px 0 0 0;">
//                 📧 <a href="mailto:${from.email}">${from.email}</a><br>
//                 📞 +880 1234 567890
//               </p>
//             </div>
//           </div>
          
//           <div class="footer">
//             <div class="social-links">
//               <a href="#">Facebook</a> | 
//               <a href="#">Instagram</a> | 
//               <a href="#">YouTube</a>
//             </div>
//             <p style="margin: 5px 0;">&copy; ${currentYear} BeautyBucket. All rights reserved.</p>
//             <p style="margin: 5px 0; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">
//               💖 Beauty is our passion. Thank you for being part of our beauty community! 💖
//             </p>
//             <div class="footer-links">
//               <a href="${frontendUrl}/privacy">Privacy Policy</a> | 
//               <a href="${frontendUrl}/terms">Terms of Service</a>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Send email using system configuration
//     const result = await sendEmail(
//       email,
//       `💖 Welcome to BeautyBucket, ${name}! ✨`,
//       htmlContent,
//       null,
//       'system'
//     );

//     if (result.success) {
//       console.log('✅ Google welcome email sent to:', email, 'Message ID:', result.messageId);
//       return { success: true, messageId: result.messageId };
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Google welcome email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// module.exports = {
//   sendWelcomeEmail,
//   sendGoogleWelcomeEmail
// };


// utils/welcomeEmailService.js
const { sendEmail, getFromAddress } = require('./emailService');

// BeautyBucket Brand Colors - Sage Green Beauty Theme
const BEAUTY_BUCKET_COLORS = {
  primary: '#52665a',        // Sage Green
  secondary: '#71816F',      // Light Sage Green
  accent: '#71816F',         // Sage accent
  darkPink: '#405347',       // Darker Sage
  textDark: '#29362f',       // Deep Green-Black
  textLight: '#85827B',      // Muted Green-Gray
  white: '#FFFFFF',          // White
  lightBg: '#f7f4ef',        // Very Light Cream background
  border: '#e2e3dd',         // Light Green-Gray border
  success: '#4CAF50',        // Green for success
  warning: '#FF8C00',        // Orange for warnings
  gold: '#B88C8D'            // Muted Rose for accent
};

/**
 * Send welcome email to newly registered customer (Regular Signup)
 * @param {string} email - Customer email
 * @param {string} name - Customer name (contactPerson)
 */
const sendWelcomeEmail = async (email, name) => {
  console.log('📧 Sending welcome email to:', email);
  
  try {
    // Get from address from database settings (system type)
    const from = await getFromAddress('system');
    
    if (!from.email) {
      throw new Error('System email not configured. Please set up email settings in admin panel.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: ${BEAUTY_BUCKET_COLORS.textDark}; 
            margin: 0;
            padding: 0;
            background-color: ${BEAUTY_BUCKET_COLORS.lightBg};
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: ${BEAUTY_BUCKET_COLORS.white};
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(82, 102, 90, 0.12);
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .header {
            background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
            padding: 40px 20px 35px;
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});
          }
          .header h1 {
            color: ${BEAUTY_BUCKET_COLORS.white};
            margin: 0;
            font-size: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-weight: 700;
            font-family: 'Playfair Display', 'Georgia', serif;
            letter-spacing: 1px;
          }
          .header h1 span:first-child {
            font-size: 36px;
          }
          .header .subtitle {
            color: rgba(255,255,255,0.9);
            margin: 10px 0 0;
            font-size: 15px;
            font-family: 'Playfair Display', 'Georgia', serif;
            letter-spacing: 2px;
          }
          .content {
            padding: 35px 30px;
            text-align: left;
          }
          .welcome-message {
            font-size: 16px;
            margin-bottom: 25px;
            color: ${BEAUTY_BUCKET_COLORS.textLight};
          }
          .welcome-message strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .welcome-message .highlight {
            color: ${BEAUTY_BUCKET_COLORS.primary};
            font-weight: 700;
          }
          .benefits-box {
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary};
            padding: 20px 25px;
            margin: 25px 0;
            border-radius: 14px;
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .benefits-box h3 {
            margin: 0 0 15px 0;
            color: ${BEAUTY_BUCKET_COLORS.primary};
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 17px;
            font-weight: 700;
            font-family: 'Playfair Display', 'Georgia', serif;
          }
          .benefits-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .benefits-list li {
            padding: 10px 0;
            display: flex;
            align-items: center;
            gap: 14px;
            border-bottom: 1px solid ${BEAUTY_BUCKET_COLORS.border};
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            font-size: 14px;
          }
          .benefits-list li:last-child {
            border-bottom: none;
          }
          .benefits-list li span:first-child {
            font-size: 24px;
          }
          .benefits-list li strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
            color: #FFFFFF !important;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            font-size: 14px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 20px rgba(82, 102, 90, 0.3);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(82, 102, 90, 0.4);
          }
          .footer {
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .social-links {
            margin: 15px 0;
          }
          .social-links a {
            color: ${BEAUTY_BUCKET_COLORS.primary};
            text-decoration: none;
            margin: 0 12px;
            font-weight: 600;
            font-size: 13px;
            transition: color 0.3s ease;
          }
          .social-links a:hover {
            color: ${BEAUTY_BUCKET_COLORS.darkPink};
          }
          .support-box {
            margin-top: 25px;
            padding: 20px 25px;
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            border-radius: 14px;
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .support-box p {
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            margin: 0 0 10px 0;
            font-size: 14px;
          }
          .support-box a {
            color: ${BEAUTY_BUCKET_COLORS.primary};
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          .support-box a:hover {
            color: ${BEAUTY_BUCKET_COLORS.darkPink};
          }
          .support-box strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent);
            margin: 20px 0;
          }
          .footer-links a {
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            text-decoration: none;
            margin: 0 8px;
            transition: color 0.3s ease;
          }
          .footer-links a:hover {
            color: ${BEAUTY_BUCKET_COLORS.primary};
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>💖</span>
              <span>Welcome to BeautyBucket!</span>
              <span>✨</span>
            </h1>
            <p class="subtitle">✨ Your Beauty Journey Starts Here ✨</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <p>Dear <strong>${name}</strong>,</p>
              <p>🎉 <span class="highlight">Welcome to the BeautyBucket family!</span> We're absolutely thrilled to have you on board!</p>
              <p>Your account has been successfully created and verified. Get ready for an amazing experience with premium beauty products, exclusive deals, and personalized service!</p>
            </div>
            
            <div class="benefits-box">
              <h3>
                <span>💄</span>
                <span>What Awaits You at BeautyBucket</span>
              </h3>
              <ul class="benefits-list">
                <li><span>💄</span> <span><strong>Premium Beauty Products</strong> - Curated selection of top-quality cosmetics</span></li>
                <li><span>✨</span> <span><strong>Genuine Authenticity</strong> - 100% authentic beauty products guaranteed</span></li>
                <li><span>🚚</span> <span><strong>Fast Delivery</strong> - Quick shipping across Bangladesh</span></li>
                <li><span>💝</span> <span><strong>Expert Support</strong> - Our beauty experts are here for you</span></li>
                <li><span>🎯</span> <span><strong>Exclusive Offers</strong> - Special discounts for our members</span></li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/customer/dashboard" class="btn-primary" style="color: #FFFFFF !important; text-decoration: none; display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #52665a, #71816F); border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(82, 102, 90, 0.3);">
                💖 Go to Your Dashboard →
              </a>
            </div>
            
            <div class="divider"></div>
            
            <div class="support-box">
              <p><strong>💖 Need Help?</strong></p>
              <p>Our friendly beauty team is here for you!</p>
              <p style="margin: 10px 0 0 0;">
                📧 <a href="mailto:${from.email}">${from.email}</a><br>
                📞 +880 1234 567890
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">&copy; ${currentYear} BeautyBucket. All rights reserved.</p>
            <p style="margin: 5px 0; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">
              💖 Beauty is our passion. Thank you for being part of our beauty community! 💖
            </p>
            <div class="footer-links">
              <a href="${frontendUrl}/privacy">Privacy Policy</a> | 
              <a href="${frontendUrl}/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using system configuration
    const result = await sendEmail(
      email,
      `💖 Welcome to BeautyBucket, ${name}! ✨`,
      htmlContent,
      null,
      'system'
    );

    if (result.success) {
      console.log('✅ Welcome email sent to:', email, 'Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email for Google signup users
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {boolean} requiresProfileCompletion - Whether profile needs completion
 */
const sendGoogleWelcomeEmail = async (email, name, requiresProfileCompletion = true) => {
  console.log('📧 Sending Google welcome email to:', email);
  
  try {
    // Get from address from database settings (system type)
    const from = await getFromAddress('system');
    
    if (!from.email) {
      throw new Error('System email not configured. Please set up email settings in admin panel.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();

    const profileNote = requiresProfileCompletion ? `
      <div style="margin: 25px 0; padding: 20px 25px; background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary}; border-radius: 14px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
        <h3 style="margin: 0 0 10px 0; color: ${BEAUTY_BUCKET_COLORS.primary}; display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; font-family: 'Playfair Display', 'Georgia', serif;">
          <span>📝</span>
          <span>Complete Your Profile</span>
        </h3>
        <p style="margin: 0; font-size: 14px; color: ${BEAUTY_BUCKET_COLORS.textLight};">Please visit your dashboard to complete your profile information so we can personalize your beauty recommendations and provide the best experience for you!</p>
      </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: ${BEAUTY_BUCKET_COLORS.textDark}; 
            margin: 0;
            padding: 0;
            background-color: ${BEAUTY_BUCKET_COLORS.lightBg};
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: ${BEAUTY_BUCKET_COLORS.white};
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(82, 102, 90, 0.12);
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .header {
            background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
            padding: 40px 20px 35px;
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});
          }
          .header h1 {
            color: ${BEAUTY_BUCKET_COLORS.white};
            margin: 0;
            font-size: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-weight: 700;
            font-family: 'Playfair Display', 'Georgia', serif;
            letter-spacing: 1px;
          }
          .header h1 span:first-child {
            font-size: 36px;
          }
          .header .subtitle {
            color: rgba(255,255,255,0.9);
            margin: 10px 0 0;
            font-size: 15px;
            font-family: 'Playfair Display', 'Georgia', serif;
            letter-spacing: 2px;
          }
          .content {
            padding: 35px 30px;
            text-align: left;
          }
          .welcome-message {
            font-size: 16px;
            margin-bottom: 25px;
            color: ${BEAUTY_BUCKET_COLORS.textLight};
          }
          .welcome-message strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .welcome-message .highlight {
            color: ${BEAUTY_BUCKET_COLORS.primary};
            font-weight: 700;
          }
          .google-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            padding: 10px 20px;
            border-radius: 50px;
            font-size: 13px;
            margin: 10px 0 15px;
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
            color: ${BEAUTY_BUCKET_COLORS.textLight};
          }
          .google-badge strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .benefits-box {
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary};
            padding: 20px 25px;
            margin: 25px 0;
            border-radius: 14px;
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .benefits-box h3 {
            margin: 0 0 15px 0;
            color: ${BEAUTY_BUCKET_COLORS.primary};
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 17px;
            font-weight: 700;
            font-family: 'Playfair Display', 'Georgia', serif;
          }
          .benefits-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .benefits-list li {
            padding: 10px 0;
            display: flex;
            align-items: center;
            gap: 14px;
            border-bottom: 1px solid ${BEAUTY_BUCKET_COLORS.border};
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            font-size: 14px;
          }
          .benefits-list li:last-child {
            border-bottom: none;
          }
          .benefits-list li span:first-child {
            font-size: 24px;
          }
          .benefits-list li strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
            color: #FFFFFF !important;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            font-size: 14px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 20px rgba(82, 102, 90, 0.3);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(82, 102, 90, 0.4);
          }
          .footer {
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .social-links {
            margin: 15px 0;
          }
          .social-links a {
            color: ${BEAUTY_BUCKET_COLORS.primary};
            text-decoration: none;
            margin: 0 12px;
            font-weight: 600;
            font-size: 13px;
            transition: color 0.3s ease;
          }
          .social-links a:hover {
            color: ${BEAUTY_BUCKET_COLORS.darkPink};
          }
          .support-box {
            margin-top: 25px;
            padding: 20px 25px;
            background: ${BEAUTY_BUCKET_COLORS.lightBg};
            border-radius: 14px;
            border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
          }
          .support-box p {
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            margin: 0 0 10px 0;
            font-size: 14px;
          }
          .support-box a {
            color: ${BEAUTY_BUCKET_COLORS.primary};
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          .support-box a:hover {
            color: ${BEAUTY_BUCKET_COLORS.darkPink};
          }
          .support-box strong {
            color: ${BEAUTY_BUCKET_COLORS.textDark};
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent);
            margin: 20px 0;
          }
          .footer-links a {
            color: ${BEAUTY_BUCKET_COLORS.textLight};
            text-decoration: none;
            margin: 0 8px;
            transition: color 0.3s ease;
          }
          .footer-links a:hover {
            color: ${BEAUTY_BUCKET_COLORS.primary};
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>🔐</span>
              <span>Welcome to BeautyBucket!</span>
              <span>✨</span>
            </h1>
            <p class="subtitle">✨ Your Beauty Journey Starts Here ✨</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <p>Dear <strong>${name}</strong>,</p>
              <div class="google-badge">
                <span>🔐</span>
                <span>You've signed up with <strong>Google</strong></span>
              </div>
              <p>🎉 <span class="highlight">Welcome to the BeautyBucket family!</span> We're so excited to have you join our beauty community!</p>
              <p>Your account has been successfully created with Google Sign-In. Get ready to explore our curated collection of premium beauty products!</p>
            </div>
            
            ${profileNote}
            
            <div class="benefits-box">
              <h3>
                <span>💄</span>
                <span>Your BeautyBucket Benefits</span>
              </h3>
              <ul class="benefits-list">
                <li><span>💄</span> <span><strong>Premium Beauty Products</strong> - Curated selection of top-quality cosmetics</span></li>
                <li><span>✨</span> <span><strong>Genuine Authenticity</strong> - 100% authentic beauty products guaranteed</span></li>
                <li><span>🚚</span> <span><strong>Fast Delivery</strong> - Quick shipping across Bangladesh</span></li>
                <li><span>💝</span> <span><strong>Expert Support</strong> - Our beauty experts are here for you</span></li>
                <li><span>🎯</span> <span><strong>Exclusive Offers</strong> - Special discounts for our members</span></li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/customer/dashboard" class="btn-primary" style="color: #FFFFFF !important; text-decoration: none; display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #52665a, #71816F); border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(82, 102, 90, 0.3);">
                💖 Go to Your Dashboard →
              </a>
            </div>
            
            <div class="divider"></div>
            
            <div class="support-box">
              <p><strong>💖 Need Help?</strong></p>
              <p>Our friendly beauty team is here for you!</p>
              <p style="margin: 10px 0 0 0;">
                📧 <a href="mailto:${from.email}">${from.email}</a><br>
                📞 +880 1234 567890
              </p>
            </div>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="#">Facebook</a> | 
              <a href="#">Instagram</a> | 
              <a href="#">YouTube</a>
            </div>
            <p style="margin: 5px 0;">&copy; ${currentYear} BeautyBucket. All rights reserved.</p>
            <p style="margin: 5px 0; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">
              💖 Beauty is our passion. Thank you for being part of our beauty community! 💖
            </p>
            <div class="footer-links">
              <a href="${frontendUrl}/privacy">Privacy Policy</a> | 
              <a href="${frontendUrl}/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using system configuration
    const result = await sendEmail(
      email,
      `💖 Welcome to BeautyBucket, ${name}! ✨`,
      htmlContent,
      null,
      'system'
    );

    if (result.success) {
      console.log('✅ Google welcome email sent to:', email, 'Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Google welcome email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendGoogleWelcomeEmail
};