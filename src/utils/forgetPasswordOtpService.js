

// // utils/forgetPasswordOtpService.js
// const { sendEmail, getFromAddress } = require('./emailService');

// // Generate 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

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
//  * Send password reset OTP email using database-stored system email settings
//  * @param {string} email - Recipient email address
//  * @param {string} otp - 6-digit OTP code
//  * @param {string} userName - User's name
//  * @returns {Promise<boolean>}
//  */
// const sendPasswordResetOTP = async (email, otp, userName) => {
//   try {
//     // Get from address from database settings (system type)
//     const from = await getFromAddress('system');
    
//     if (!from.email) {
//       throw new Error('System email not configured. Please set up email settings in admin panel.');
//     }

//     console.log(`📧 Attempting to send password reset OTP to: ${email}`);
//     console.log(`📧 From: ${from.email} (${from.name})`);

//     // Build email HTML
//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
//         </style>
//       </head>
//       <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: ${BEAUTY_BUCKET_COLORS.lightBg};">
//         <div style="max-width: 600px; margin: 20px auto; background-color: ${BEAUTY_BUCKET_COLORS.white}; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(238, 66, 117, 0.12); border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
          
//           <!-- Header with BeautyBucket Branding -->
//           <div style="background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); padding: 35px 20px 30px; text-align: center; position: relative;">
//             <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});"></div>
//             <div style="display: inline-block; background: rgba(255,255,255,0.12); border-radius: 14px; padding: 12px 24px; margin-bottom: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
//               <span style="font-size: 28px; margin-right: 10px;">💖</span>
//               <span style="font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.white}; font-weight: 700; font-size: 22px; letter-spacing: 1px;">BeautyBucket</span>
//             </div>
//             <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px; font-family: 'Playfair Display', 'Georgia', serif; letter-spacing: 2px;">✨ Your Beauty Journey Starts Here ✨</p>
//           </div>
          
//           <!-- Content -->
//           <div style="padding: 40px 30px;">
//             <h2 style="color: ${BEAUTY_BUCKET_COLORS.textDark}; margin-top: 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 24px; font-weight: 700;">
//               Hello, ${userName}! 💖
//             </h2>
            
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; line-height: 1.8; font-size: 16px;">
//               We received a request to reset your password for your BeautyBucket account. Don't worry, we've got you covered!
//             </p>
            
//             <!-- OTP Box with Pink gradient border -->
//             <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border: 2px solid ${BEAUTY_BUCKET_COLORS.primary}; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 4px 20px rgba(238, 66, 117, 0.12);">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin: 0 0 10px 0; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">Password Reset Code</p>
//               <h1 style="font-size: 52px; letter-spacing: 14px; background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 10px 0; font-family: 'Inter', Arial, sans-serif; font-weight: 700;">${otp}</h1>
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin-top: 10px;">Enter this code to reset your password</p>
//             </div>
            
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; line-height: 1.8;">This OTP is valid for <strong style="color: ${BEAUTY_BUCKET_COLORS.primary};">10 minutes</strong>.</p>
            
//             <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary}; padding: 18px 20px; margin: 30px 0; border-radius: 10px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; margin: 0; font-size: 14px; line-height: 1.6;">
//                 <strong style="color: ${BEAUTY_BUCKET_COLORS.primary};">🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account security is important to us.
//               </p>
//             </div>
            
//             <!-- Divider with Pink gradient -->
//             <div style="height: 2px; background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent); margin: 25px 0;"></div>
            
//             <div style="text-align: center; margin-top: 30px; padding: 20px 25px; background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-radius: 14px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 13px; margin: 5px 0;">
//                 💖 Need help? Contact our beauty support team at 
//                 <a href="mailto:${from.email}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">${from.email}</a>
//               </p>
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin-top: 8px; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">💖 Beauty is our passion. Thank you for being part of our beauty community! 💖</p>
//             </div>
//           </div>
          
//           <!-- Footer -->
//           <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; padding: 25px 30px; text-align: center; border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin: 0;">
//               &copy; ${new Date().getFullYear()} BeautyBucket. All rights reserved.<br>
//               <span style="font-size: 11px; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">💖 Beauty is our passion. Thank you for being part of our beauty community! 💖</span>
//             </p>
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 11px; margin-top: 10px;">
//               <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">Visit Our Store</a> | 
//               <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">Support Center</a>
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Plain text version
//     const text = `
//       Hello ${userName},
      
//       We received a request to reset your password for your BeautyBucket account.
      
//       Your password reset OTP is: ${otp}
      
//       This OTP is valid for 10 minutes.
      
//       If you didn't request this password reset, please ignore this email. Your account security is important to us.
      
//       Need help? Contact our beauty support team at: ${from.email}
      
//       Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
//     `;

//     // Send email using the system email configuration
//     const result = await sendEmail(
//       email,
//       '🔐 Password Reset Request - BeautyBucket',
//       html,
//       text,
//       'system'  // Use 'system' email type
//     );

//     if (result.success) {
//       console.log(`✅ Password reset OTP sent successfully to ${email}`);
//       console.log(`📧 Message ID: ${result.messageId}`);
//       return true;
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Password reset email error:', error.message);
//     throw error;
//   }
// };

// module.exports = {
//   generateOTP,
//   sendPasswordResetOTP
// };


// utils/forgetPasswordOtpService.js
const { sendEmail, getFromAddress } = require('./emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
 * Send password reset OTP email using database-stored system email settings
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 * @returns {Promise<boolean>}
 */
const sendPasswordResetOTP = async (email, otp, userName) => {
  try {
    // Get from address from database settings (system type)
    const from = await getFromAddress('system');
    
    if (!from.email) {
      throw new Error('System email not configured. Please set up email settings in admin panel.');
    }

    console.log(`📧 Attempting to send password reset OTP to: ${email}`);
    console.log(`📧 From: ${from.email} (${from.name})`);

    // Build email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        </style>
      </head>
      <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: ${BEAUTY_BUCKET_COLORS.lightBg};">
        <div style="max-width: 600px; margin: 20px auto; background-color: ${BEAUTY_BUCKET_COLORS.white}; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(82, 102, 90, 0.12); border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
          
          <!-- Header with BeautyBucket Branding -->
          <div style="background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); padding: 35px 20px 30px; text-align: center; position: relative;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});"></div>
            <div style="display: inline-block; background: rgba(255,255,255,0.12); border-radius: 14px; padding: 12px 24px; margin-bottom: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
              <span style="font-size: 28px; margin-right: 10px;">💖</span>
              <span style="font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.white}; font-weight: 700; font-size: 22px; letter-spacing: 1px;">BeautyBucket</span>
            </div>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px; font-family: 'Playfair Display', 'Georgia', serif; letter-spacing: 2px;">✨ Your Beauty Journey Starts Here ✨</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: ${BEAUTY_BUCKET_COLORS.textDark}; margin-top: 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 24px; font-weight: 700;">
              Hello, ${userName}! 💖
            </h2>
            
            <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; line-height: 1.8; font-size: 16px;">
              We received a request to reset your password for your BeautyBucket account. Don't worry, we've got you covered!
            </p>
            
            <!-- OTP Box with Sage Green gradient border -->
            <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border: 2px solid ${BEAUTY_BUCKET_COLORS.primary}; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 4px 20px rgba(82, 102, 90, 0.12);">
              <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin: 0 0 10px 0; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">Password Reset Code</p>
              <h1 style="font-size: 52px; letter-spacing: 14px; background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 10px 0; font-family: 'Inter', Arial, sans-serif; font-weight: 700;">${otp}</h1>
              <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin-top: 10px;">Enter this code to reset your password</p>
            </div>
            
            <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; line-height: 1.8;">This OTP is valid for <strong style="color: ${BEAUTY_BUCKET_COLORS.primary};">10 minutes</strong>.</p>
            
            <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary}; padding: 18px 20px; margin: 30px 0; border-radius: 10px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
              <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong style="color: ${BEAUTY_BUCKET_COLORS.primary};">🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account security is important to us.
              </p>
            </div>
            
            <!-- Divider with Sage Green gradient -->
            <div style="height: 2px; background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent); margin: 25px 0;"></div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px 25px; background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-radius: 14px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
              <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 13px; margin: 5px 0;">
                💖 Need help? Contact our beauty support team at 
                <a href="mailto:${from.email}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">${from.email}</a>
              </p>
              <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin-top: 8px; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">💖 Beauty is our passion. Thank you for being part of our beauty community! 💖</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; padding: 25px 30px; text-align: center; border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
            <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} BeautyBucket. All rights reserved.<br>
              <span style="font-size: 11px; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">💖 Beauty is our passion. Thank you for being part of our beauty community! 💖</span>
            </p>
            <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 11px; margin-top: 10px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">Visit Our Store</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">Support Center</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const text = `
      Hello ${userName},
      
      We received a request to reset your password for your BeautyBucket account.
      
      Your password reset OTP is: ${otp}
      
      This OTP is valid for 10 minutes.
      
      If you didn't request this password reset, please ignore this email. Your account security is important to us.
      
      Need help? Contact our beauty support team at: ${from.email}
      
      Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
    `;

    // Send email using the system email configuration
    const result = await sendEmail(
      email,
      '🔐 Password Reset Request - BeautyBucket',
      html,
      text,
      'system'  // Use 'system' email type
    );

    if (result.success) {
      console.log(`✅ Password reset OTP sent successfully to ${email}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Password reset email error:', error.message);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendPasswordResetOTP
};