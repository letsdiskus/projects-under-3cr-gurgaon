const nodemailer = require('nodemailer');
require('dotenv').config();

const recipient = process.env.NOTIFICATION_EMAIL || 'akash@silverdomerealtors.com';

console.log('====================================================');
console.log('🧪 EMAIL DISPATCH DIAGNOSTIC TOOL');
console.log('====================================================');
console.log(`Target Recipient : ${recipient}`);
console.log(`SMTP Service     : ${process.env.SMTP_SERVICE || '(none)'}`);
console.log(`SMTP Host        : ${process.env.SMTP_HOST || '(none)'}`);
console.log(`SMTP Port        : ${process.env.SMTP_PORT || '587'}`);
console.log(`SMTP User        : ${process.env.SMTP_USER || '(none)'}`);
console.log(`SMTP Pass Set?   : ${process.env.SMTP_PASS ? 'YES (hidden)' : 'NO (empty)'}`);
console.log('----------------------------------------------------');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('⚠️  ACTION REQUIRED:');
  console.log('Your .env file is currently missing SMTP credentials (SMTP_USER and SMTP_PASS).');
  console.log('Because SMTP credentials are empty, emails cannot be sent over the internet to akash@silverdomerealtors.com.');
  console.log('\n📌 HOW TO CONFIGURE IN 1 MINUTE:');
  console.log('Option A - Using Gmail / Google Workspace:');
  console.log('  1. Go to your Google Account -> Security -> 2-Step Verification -> App Passwords.');
  console.log('  2. Generate a 16-letter App Password.');
  console.log('  3. In your .env file, set:');
  console.log('     SMTP_SERVICE=gmail');
  console.log('     SMTP_USER=your_gmail_or_workspace_address@gmail.com');
  console.log('     SMTP_PASS=xxxx xxxx xxxx xxxx (your 16-character app password)');
  console.log('\nOption B - Using Custom Domain / Hostinger / GoDaddy / cPanel SMTP:');
  console.log('  In your .env file, set:');
  console.log('     SMTP_HOST=smtp.yourdomain.com (or smtp.hostinger.com)');
  console.log('     SMTP_PORT=465 (or 587)');
  console.log('     SMTP_SECURE=true');
  console.log('     SMTP_USER=akash@silverdomerealtors.com');
  console.log('     SMTP_PASS=your_email_password');
  console.log('====================================================');
  process.exit(0);
}

let transporter;
if (process.env.SMTP_SERVICE || (process.env.SMTP_USER && process.env.SMTP_USER.includes('@gmail.com'))) {
  transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s+/g, '')
    }
  });
} else {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465 || process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

async function sendDiagnosticEmail() {
  console.log('Connecting to SMTP server and sending test email...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Server Connection Verified Successfully!');

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Gurgaon Property Advisory'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: recipient,
      subject: '🧪 Test Lead Notification – Gurgaon Luxury Property Advisory',
      html: `
        <div style="font-family:sans-serif; padding:20px; border:1px solid #C9A96E; border-radius:8px;">
          <h2 style="color:#111114;">✅ Lead Notification System Active!</h2>
          <p>This is a test notification confirming that lead submissions from your Gurgaon property landing page are now connected directly to your inbox.</p>
          <hr style="border:none; border-top:1px solid #eee; margin:16px 0;" />
          <p><strong>Target Email:</strong> ${recipient}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
      `
    });

    console.log(`🎉 TEST EMAIL SENT TO ${recipient}! Message ID: ${info.messageId}`);
    console.log('Please check your inbox (and Spam/Junk folder if first time).');
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    if (err.code === 'EAUTH') {
      console.error('👉 Tip: Authentication failed. If using Gmail, make sure you generated an App Password (not your normal Gmail login password).');
    }
  }
}

sendDiagnosticEmail();
