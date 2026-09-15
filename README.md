# Gurgaon Luxury Property Advisory — Landing Page & Lead Engine

A high-converting, luxury real estate lead-generation landing page designed specifically for paid Google Ads and Meta Ads campaigns targeting residential properties in Gurgaon across Under ₹3 Cr, ₹5–10 Cr, and ₹10 Cr+ segments.

---

## 🌟 Key Features

- **Luxury Design System**: Built with near-black (`#111111`) and warm champagne gold (`#C9A96E`), editorial typography (`Cormorant Garamond`, `Playfair Display`, `Plus Jakarta Sans`), and glassmorphism.
- **Budget-Segmented Portfolios**: Dedicated high-converting cards for Under ₹3 Cr, ₹5–10 Cr, and ₹10 Cr+ with dynamic pre-filling.
- **Interactive Preference Shortlist Builder**: 4-group custom selection matrix (Budget, Purpose, Property Type, Location).
- **Automated Lead Email Notifications**: Built-in backend endpoint (`/api/submit-lead`) that dispatches HTML lead alerts with full property requirements and UTM marketing attribution.
- **Ad Tracking & Analytics Ready**: Google Tag Manager (`dataLayer`), GA4, Meta Pixel (`fbq`), and Google Ads conversion events (`lead_form_view`, `lead_form_start`, `lead_submit`, `popup_open`, `cta_click`, `budget_*`).
- **Spam Mitigation & Security**: Invisible honeypot bot trap (`website_url_hp`) and IP rate limiting.
- **Desktop Exit-Intent & Mobile Sticky Bar**: High-impact conversion features for maximized ROI on ad spend.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your SMTP credentials:
```env
PORT=3000
NOTIFICATION_EMAIL=akash@silverdomerealtors.com

SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM_NAME=Gurgaon Property Advisory
SMTP_FROM_EMAIL=your_email@gmail.com
```

### 3. Run the Server
```bash
npm start
```
Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
├── assets/
│   └── images/               # High-resolution architectural photography
│       ├── hero.jpg
│       ├── skyline.jpg
│       ├── residence.jpg
│       └── final-cta.jpg
├── index.html                # Main landing page markup with semantic SEO structure
├── style.css                 # Premium responsive CSS styling
├── script.js                 # Frontend interactions, analytics, and dynamic modal prefilling
├── server.js                 # Express backend server with Nodemailer dispatch & rate limiting
├── test_email.js             # Email connectivity diagnostic tool
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```
