const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'akash@silverdomerealtors.com';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Spam Protection: Rate Limiter for Lead Submission (Max 15 requests per 15 minutes per IP)
const leadSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please try again later.'
  }
});

// Helper: Setup Nodemailer Transporter
function createEmailTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    return null;
  }

  // Option 1: Gmail / Google Workspace via service shorthand
  if (process.env.SMTP_SERVICE) {
    console.log(`📧 Using SMTP service: ${process.env.SMTP_SERVICE} for user: ${user}`);
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: { user, pass }
    });
  }

  // Option 2: Custom SMTP Host (Hostinger, cPanel, SendGrid, etc.)
  if (process.env.SMTP_HOST) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = port === 465 || process.env.SMTP_SECURE === 'true';
    console.log(`📧 Using SMTP host: ${process.env.SMTP_HOST}:${port} (secure=${secure}) for user: ${user}`);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  // Option 3: Auto-detect Gmail/Google Workspace from email domain
  if (user.includes('@gmail.com') || user.includes('@googlemail.com')) {
    console.log(`📧 Auto-detected Gmail for user: ${user}`);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return null;
}

// Verify SMTP connection on startup
async function verifyEmailTransporter() {
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn('⚠️  No SMTP credentials configured — emails will NOT be sent.');
    return;
  }
  try {
    await transporter.verify();
    console.log(`✅ SMTP connection verified — emails will be delivered to ${NOTIFICATION_EMAIL}`);
  } catch (err) {
    console.error('❌ SMTP verification FAILED:', err.message);
    console.error('   → Check SMTP_USER, SMTP_PASS, and SMTP_SERVICE/SMTP_HOST in your .env');
  }
}

// Generate Luxury HTML Email
function generateLeadEmailHtml(data) {
  const {
    name = 'N/A',
    phone = 'N/A',
    email = 'N/A',
    budget = 'N/A',
    looking_for = 'N/A',
    location = 'N/A',
    property_type = 'N/A',
    page_url = 'N/A',
    utm_source = 'N/A',
    utm_medium = 'N/A',
    utm_campaign = 'N/A',
    utm_term = 'N/A',
    utm_content = 'N/A',
    submitted_at = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  } = data;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Property Enquiry</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f3ef; margin: 0; padding: 24px; color: #1a1a1a; }
      .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2ded5; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
      .email-header { background: #111114; padding: 28px 24px; border-bottom: 3px solid #C9A96E; text-align: center; }
      .header-title { color: #C9A96E; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 6px 0; }
      .header-sub { color: #d8d8dc; font-size: 13px; margin: 0; }
      .email-body { padding: 28px 24px; }
      .section-heading { font-size: 15px; font-weight: 700; color: #111114; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #C9A96E; padding-bottom: 8px; margin: 20px 0 14px 0; }
      .section-heading:first-of-type { margin-top: 0; }
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      .data-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0eee9; vertical-align: top; }
      .data-label { width: 38%; font-weight: 600; color: #55555c; }
      .data-value { width: 62%; font-weight: 500; color: #111114; }
      .data-value.highlight { color: #9F7E47; font-weight: 700; }
      .phone-link { color: #111114; text-decoration: none; font-weight: 700; }
      .email-footer { background: #f8f7f4; padding: 18px 24px; text-align: center; font-size: 12px; color: #888890; border-top: 1px solid #e8e6df; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <div class="header-title">Gurgaon Luxury Property Advisory</div>
        <p class="header-sub">New Lead Notification</p>
      </div>

      <div class="email-body">
        <div class="section-heading">New Property Enquiry</div>
        <table class="data-table">
          <tr>
            <td class="data-label">Name:</td>
            <td class="data-value"><strong>${name}</strong></td>
          </tr>
          <tr>
            <td class="data-label">Phone:</td>
            <td class="data-value"><a href="tel:${phone}" class="phone-link">${phone}</a></td>
          </tr>
          <tr>
            <td class="data-label">Email:</td>
            <td class="data-value"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td class="data-label">Budget:</td>
            <td class="data-value highlight">${budget}</td>
          </tr>
          <tr>
            <td class="data-label">Looking For:</td>
            <td class="data-value">${looking_for}</td>
          </tr>
          <tr>
            <td class="data-label">Preferred Location:</td>
            <td class="data-value">${location}</td>
          </tr>
          <tr>
            <td class="data-label">Property Type:</td>
            <td class="data-value">${property_type}</td>
          </tr>
        </table>

        <div class="section-heading">Lead Source</div>
        <table class="data-table">
          <tr>
            <td class="data-label">Landing Page:</td>
            <td class="data-value" style="word-break: break-all; font-size: 12px;">${page_url}</td>
          </tr>
          <tr>
            <td class="data-label">UTM Source:</td>
            <td class="data-value">${utm_source}</td>
          </tr>
          <tr>
            <td class="data-label">UTM Medium:</td>
            <td class="data-value">${utm_medium}</td>
          </tr>
          <tr>
            <td class="data-label">UTM Campaign:</td>
            <td class="data-value">${utm_campaign}</td>
          </tr>
          <tr>
            <td class="data-label">UTM Term:</td>
            <td class="data-value">${utm_term}</td>
          </tr>
          <tr>
            <td class="data-label">UTM Content:</td>
            <td class="data-value">${utm_content}</td>
          </tr>
          <tr>
            <td class="data-label">Submitted At:</td>
            <td class="data-value">${submitted_at}</td>
          </tr>
        </table>
      </div>

      <div class="email-footer">
        Confidential Lead Notification &bull; Gurgaon Residential Property Advisory Desk
      </div>
    </div>
  </body>
  </html>
  `;
}

// LEAD SUBMISSION API ENDPOINT
app.post('/api/submit-lead', leadSubmitLimiter, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      budget,
      looking_for,
      location,
      property_type,
      website_url_hp, // Honeypot field
      page_url,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      submitted_at
    } = req.body;

    // 1. Spam Protection: Honeypot check
    // If the invisible bot field is filled, silently discard or respond with simulated success
    if (website_url_hp && website_url_hp.trim() !== '') {
      console.warn('[SPAM DETECTED] Honeypot triggered with value:', website_url_hp);
      return res.status(200).json({
        success: true,
        message: 'Your enquiry has been received. A property advisor will contact you shortly.'
      });
    }

    // 2. Server-side Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid name provided'
      });
    }

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number provided'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address provided'
      });
    }

    if (!budget) {
      return res.status(400).json({
        success: false,
        message: 'Budget selection is required'
      });
    }

    // Prepare lead data object
    const leadData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      budget: budget.trim(),
      looking_for: looking_for || 'End Use',
      location: location || 'Not Specified',
      property_type: property_type || 'Not Specified',
      page_url: page_url || 'https://gurgaonpropertyadvisory.com/',
      utm_source: utm_source || 'direct',
      utm_medium: utm_medium || 'none',
      utm_campaign: utm_campaign || 'none',
      utm_term: utm_term || 'none',
      utm_content: utm_content || 'none',
      submitted_at: submitted_at || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    // Save lead backup log to leads_log.json
    try {
      const fs = require('fs');
      fs.appendFileSync(path.join(__dirname, 'leads_log.json'), JSON.stringify(leadData) + '\n');
    } catch (e) {}

    // Construct Email Subject & HTML Body
    const emailSubject = `New Gurgaon Property Enquiry – ${leadData.budget} – ${leadData.name}`;
    const emailHtml = generateLeadEmailHtml(leadData);

    const fromName = process.env.SMTP_FROM_NAME || 'Gurgaon Property Advisory';
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@gurgaonpropertyadvisory.com';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: NOTIFICATION_EMAIL,
      replyTo: leadData.email,
      subject: emailSubject,
      html: emailHtml
    };

    const transporter = createEmailTransporter();

    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [LIVE EMAIL SENT TO ${NOTIFICATION_EMAIL}] Message ID:`, info.messageId);
      } catch (mailError) {
        console.error(`❌ [SMTP ERROR SENDING EMAIL TO ${NOTIFICATION_EMAIL}]:`, mailError.message);
        return res.status(500).json({
          success: false,
          message: `Email delivery failed: ${mailError.message}. Please check your SMTP settings in .env.`
        });
      }
    } else {
      console.warn('⚠️ [WARNING: SMTP CREDENTIALS NOT CONFIGURED IN .env]');
      console.warn(`Lead was recorded in console, but physical email to ${NOTIFICATION_EMAIL} was not sent.`);
      console.warn('To receive emails, please add your SMTP credentials (e.g. Gmail App Password or Hostinger SMTP) to the .env file.');
      console.log('====================================================');
      console.log(`SUBJECT: ${emailSubject}`);
      console.log('LEAD DATA:', JSON.stringify(leadData, null, 2));
      console.log('====================================================');
    }

    return res.status(200).json({
      success: true,
      message: 'Your enquiry has been received. A property advisor will contact you shortly.',
      lead: {
        name: leadData.name,
        budget: leadData.budget,
        timestamp: leadData.submitted_at
      }
    });

  } catch (error) {
    console.error('[LEAD SUBMIT ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact us directly.'
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    recipient: NOTIFICATION_EMAIL
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Gurgaon Property Advisory Server running on http://localhost:${PORT}`);
  console.log(`📬 Lead Notifications configured for: ${NOTIFICATION_EMAIL}`);
  verifyEmailTransporter();
});
