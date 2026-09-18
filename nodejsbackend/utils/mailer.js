const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Check if SMTP environment variables are defined
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // If no SMTP configured, use a fallback transport (or create test account)
    // For local dev, also log directly to console
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }

  return transporter;
}

/**
 * Send OTP Email for Seller Registration
 */
async function sendOtpEmail(toEmail, otp, sellerName = 'Seller') {
  console.log('\n======================================================');
  console.log(`📧 [SELLER EMAIL OTP TRIGGER]`);
  console.log(`To: ${toEmail}`);
  console.log(`Seller Name: ${sellerName}`);
  console.log(`🔑 Verification Code (OTP): ${otp}`);
  console.log(`Valid For: 10 Minutes`);
  console.log('======================================================\n');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0c8575; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">🐄 Sohani Dairy — SellerKit</h1>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Seller Account Email Verification</p>
      </div>
      <div style="padding: 28px 24px; color: #2d3748;">
        <h2 style="font-size: 17px; margin-top: 0;">Hello ${sellerName},</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #4a5568;">
          Thank you for joining <strong>Sohani Dairy Farm</strong> as a seller partner. Please use the verification code below to complete your account registration:
        </p>
        <div style="background: #f0fdf4; border: 2px dashed #0c8575; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0c8575; display: inline-block;">
            ${otp}
          </span>
          <div style="font-size: 11.5px; color: #718096; margin-top: 6px;">Valid for 10 minutes</div>
        </div>
        <p style="font-size: 13px; color: #718096; line-height: 1.5;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
      <div style="background: #f7fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #a0aec0;">
        © Sohani Dairy Farm & Marketplace. All rights reserved.
      </div>
    </div>
  `;

  try {
    const mail = await getTransporter();
    const info = await mail.sendMail({
      from: process.env.MAIL_FROM || '"Sohani Dairy SellerKit" <noreply@sohanidairy.in>',
      to: toEmail,
      subject: `[${otp}] Your Sohani Dairy Seller Verification Code`,
      html: htmlContent,
      text: `Your Sohani Dairy SellerKit verification code is: ${otp}. It expires in 10 minutes.`,
    });
    console.log(`✅ Mail delivery attempted. Message ID: ${info?.messageId || 'local-logged'}`);
    return { success: true, messageId: info?.messageId };
  } catch (err) {
    console.warn(`⚠️ SMTP transport warning (OTP was logged to console above): ${err.message}`);
    return { success: true, warning: err.message };
  }
}

module.exports = { sendOtpEmail };
