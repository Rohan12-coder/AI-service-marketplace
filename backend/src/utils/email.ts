import nodemailer, { Transporter } from 'nodemailer';
import env from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️   SMTP credentials not configured — emails will not be sent');
    throw new Error('Email service not configured');
  }

  transporter = nodemailer.createTransport({
    host:   env.SMTP_HOST,
    port:   env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
};

// ── Base HTML wrapper ─────────────────────────────────────────────────────────
const baseTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Smart Service Marketplace</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', Arial, sans-serif; background: #0A0A0F; color: #F5F5F5; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #1A1A26; border: 1px solid rgba(212,175,55,0.2); border-radius: 16px; padding: 40px; }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo span { font-size: 24px; font-weight: 700; color: #D4AF37; letter-spacing: -0.5px; }
    .logo small { display: block; color: #9090A0; font-size: 12px; margin-top: 4px; }
    .divider { height: 1px; background: rgba(212,175,55,0.15); margin: 24px 0; }
    h1 { font-size: 24px; font-weight: 700; color: #F5F5F5; margin-bottom: 12px; }
    p { color: #C8C8D8; line-height: 1.6; margin-bottom: 16px; font-size: 15px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D4AF37, #F0D060); color: #0A0A0F;
           font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px;
           font-size: 15px; margin: 8px 0; }
    .info-box { background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2);
                border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-box p { margin: 0; color: #F0D060; }
    .footer { text-align: center; margin-top: 32px; color: #55556A; font-size: 12px; line-height: 1.6; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 13px; font-weight: 600; }
    .badge-success { background: rgba(34,197,94,0.15); color: #22C55E; }
    .badge-warning { background: rgba(245,158,11,0.15); color: #F59E0B; }
    .badge-error   { background: rgba(239,68,68,0.15);  color: #EF4444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span>✦ Smart Service Marketplace</span>
        <small>Your trusted service platform</small>
      </div>
      <div class="divider"></div>
      ${content}
      <div class="divider"></div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Smart Service Marketplace. All rights reserved.</p>
        <p>If you did not request this email, please ignore it.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

// ── Email Templates ───────────────────────────────────────────────────────────
export const templates = {
  welcome: (name: string) => baseTemplate(`
    <h1>Welcome, ${name}! 🎉</h1>
    <p>We're thrilled to have you on Smart Service Marketplace — your gateway to trusted, verified professionals near you.</p>
    <p>Start exploring services, compare providers, and book in seconds.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${env.FRONTEND_URL}/services" class="btn">Explore Services →</a>
    </div>
    <div class="info-box">
      <p>💡 Tip: Enable notifications to get real-time booking updates.</p>
    </div>
  `),

  passwordReset: (name: string, resetUrl: string) => baseTemplate(`
    <h1>Reset Your Password</h1>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <p>Click the button below to create a new password. This link expires in <strong style="color:#D4AF37">1 hour</strong>.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" class="btn">Reset Password →</a>
    </div>
    <div class="info-box">
      <p>🔒 If you didn't request this, your account is safe — just ignore this email.</p>
    </div>
    <p style="font-size:13px;color:#55556A;">Or copy this link: ${resetUrl}</p>
  `),

  bookingConfirmation: (
    name: string,
    service: string,
    provider: string,
    date: string,
    timeSlot: string,
    amount: string,
    bookingId: string
  ) => baseTemplate(`
    <h1>Booking Confirmed ✓</h1>
    <p>Hi ${name}, your booking has been placed successfully!</p>
    <div class="info-box">
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Provider:</strong> ${provider}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p><strong>Booking ID:</strong> #${bookingId}</p>
    </div>
    <p>The provider will confirm your booking shortly. You'll receive another notification once confirmed.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${env.FRONTEND_URL}/booking/${bookingId}" class="btn">View Booking →</a>
    </div>
  `),

  bookingStatusUpdate: (
    name: string,
    bookingId: string,
    service: string,
    status: string,
    message: string
  ) => baseTemplate(`
    <h1>Booking Update</h1>
    <p>Hi ${name}, there's an update on your booking for <strong>${service}</strong>.</p>
    <div style="margin:16px 0;">
      <span class="status-badge badge-${status === 'accepted' || status === 'completed' ? 'success' : status === 'rejected' || status === 'cancelled' ? 'error' : 'warning'}">
        ${status.toUpperCase()}
      </span>
    </div>
    <div class="info-box"><p>${message}</p></div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${env.FRONTEND_URL}/booking/${bookingId}" class="btn">View Details →</a>
    </div>
  `),

  paymentSuccess: (name: string, amount: string, service: string, paymentId: string) =>
    baseTemplate(`
    <h1>Payment Successful 💳</h1>
    <p>Hi ${name}, we've received your payment of <strong style="color:#D4AF37">₹${amount}</strong> for <strong>${service}</strong>.</p>
    <div class="info-box">
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p><strong>Status:</strong> <span style="color:#22C55E">Successful</span></p>
    </div>
    <p>Keep this email as your payment receipt.</p>
  `),

  providerApproved: (businessName: string) => baseTemplate(`
    <h1>Provider Account Approved! 🎊</h1>
    <p>Congratulations! Your provider profile for <strong>${businessName}</strong> has been reviewed and approved.</p>
    <p>You can now start receiving booking requests from customers on the platform.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${env.FRONTEND_URL}/dashboard/provider" class="btn">Go to Dashboard →</a>
    </div>
    <div class="info-box">
      <p>💡 Complete your profile to get more bookings — add portfolio images, services, and availability.</p>
    </div>
  `),

  newBookingRequest: (
    providerName: string,
    service: string,
    customerName: string,
    date: string,
    timeSlot: string,
    bookingId: string
  ) => baseTemplate(`
    <h1>New Booking Request 📬</h1>
    <p>Hi ${providerName}, you have a new booking request!</p>
    <div class="info-box">
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${timeSlot}</p>
    </div>
    <p>Please accept or reject this request within <strong style="color:#D4AF37">2 hours</strong> to maintain your response rate.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${env.FRONTEND_URL}/dashboard/provider" class="btn">Review Request →</a>
    </div>
  `),
};

// ── Main sendEmail function ───────────────────────────────────────────────────
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from:    `"Smart Service Marketplace" <${env.SMTP_USER}>`,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
      text:    options.text || options.html.replace(/<[^>]+>/g, ''),
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`📧  Email sent to ${options.to}: ${info.messageId}`);
  } catch (error) {
    const err = error as Error;
    console.error(`❌  Email send failed to ${options.to}: ${err.message}`);
    // Don't throw — email failure should not crash the server
  }
};
