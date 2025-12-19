import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: parseInt(process.env.SMTP_PORT as string),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"DawaLocate" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Email Verification - DawaLocate",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #0AA6C8 0%, #0886A2 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
                color: #333333;
              }
              .content h2 {
                color: #0AA6C8;
                margin-top: 0;
                font-size: 24px;
              }
              .content p {
                line-height: 1.6;
                color: #555555;
                font-size: 16px;
              }
              .code-container {
                background-color: #f8f9fa;
                border: 2px dashed #0AA6C8;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .code {
                font-size: 36px;
                font-weight: bold;
                color: #0AA6C8;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
              }
              .expiry {
                color: #dc3545;
                font-weight: 600;
                font-size: 14px;
                margin-top: 15px;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #888888;
                font-size: 14px;
                border-top: 1px solid #e0e0e0;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning p {
                margin: 0;
                color: #856404;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DawaLocate</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hello,</p>
                <p>Thank you for signing up with DawaLocate! To complete your registration, please verify your email address using the code below:</p>
                
                <div class="code-container">
                  <div class="code">${code}</div>
                  <p class="expiry">⏰ This code expires in 15 minutes</p>
                </div>
                
                <p>Enter this code on the verification page to activate your account and start using DawaLocate.</p>
                
                <div class="warning">
                  <p><strong>⚠️ Security Note:</strong> If you didn't request this verification code, please ignore this email. Your account is secure.</p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} DawaLocate. All rights reserved.</p>
                <p>Connecting patients with medications across Lebanon 🇱🇧</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        DawaLocate - Email Verification
        
        Hello,
        
        Thank you for signing up with DawaLocate! To complete your registration, please verify your email address.
        
        Your verification code is: ${code}
        
        This code expires in 15 minutes.
        
        If you didn't request this verification code, please ignore this email.
        
        © ${new Date().getFullYear()} DawaLocate. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    return false;
  }
}

/**
 * Verify transporter configuration (optional - for testing)
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}

