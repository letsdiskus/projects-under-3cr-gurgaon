// Automated test suite for lead form submissions and server email dispatches
const testLeads = [
  {
    testName: "1. Main Hero Lead Form Submission (Paid Google Ad)",
    payload: {
      name: "Rohit Malhotra",
      phone: "9811223344",
      email: "rohit.malhotra@example.com",
      budget: "₹5–10 Cr",
      looking_for: "End Use",
      location: "Golf Course Road",
      property_type: "Penthouse",
      website_url_hp: "",
      page_url: "https://gurgaonpropertyadvisory.com/?utm_source=google_ads&utm_medium=cpc&utm_campaign=gurgaon_luxury_residences&utm_term=golf_course_road_apartments&utm_content=hero_banner_ad",
      utm_source: "google_ads",
      utm_medium: "cpc",
      utm_campaign: "gurgaon_luxury_residences",
      utm_term: "golf_course_road_apartments",
      utm_content: "hero_banner_ad",
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }
  },
  {
    testName: "2. Section 6 Main Lead Form Submission (Meta Ads)",
    payload: {
      name: "Priyanka Mehra",
      phone: "9988776655",
      email: "priyanka.m@example.com",
      budget: "Under ₹3 Cr",
      looking_for: "Investment",
      location: "Dwarka Expressway",
      property_type: "Apartment",
      website_url_hp: "",
      page_url: "https://gurgaonpropertyadvisory.com/?utm_source=meta_ads&utm_medium=paid_social&utm_campaign=dwarka_expressway_investors&utm_term=smart_luxury&utm_content=carousel_ad_3",
      utm_source: "meta_ads",
      utm_medium: "paid_social",
      utm_campaign: "dwarka_expressway_investors",
      utm_term: "smart_luxury",
      utm_content: "carousel_ad_3",
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }
  },
  {
    testName: "3. Popup Modal Lead Form Submission (₹10 Cr+ Ultra Luxury)",
    payload: {
      name: "Vikram Singhania",
      phone: "9820011223",
      email: "v.singhania@example.com",
      budget: "₹10 Cr+",
      looking_for: "Both",
      location: "Golf Course Extension Road",
      property_type: "Branded Residence",
      website_url_hp: "",
      page_url: "https://gurgaonpropertyadvisory.com/",
      utm_source: "direct",
      utm_medium: "none",
      utm_campaign: "none",
      utm_term: "none",
      utm_content: "none",
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }
  },
  {
    testName: "4. Exit Intent Form Submission",
    payload: {
      name: "Sameer Kapoor",
      phone: "9876543210",
      email: "sameer.k@example.com",
      budget: "₹5–10 Cr",
      looking_for: "End Use",
      location: "SPR",
      property_type: "Apartment",
      website_url_hp: "",
      page_url: "https://gurgaonpropertyadvisory.com/?utm_source=linkedin&utm_medium=sponsored",
      utm_source: "linkedin",
      utm_medium: "sponsored",
      utm_campaign: "corporate_hn_gurgaon",
      utm_term: "advisory",
      utm_content: "exit_intent",
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }
  },
  {
    testName: "5. Spam Bot Honeypot Rejection Test",
    payload: {
      name: "Spam Bot",
      phone: "9876543210",
      email: "bot@spam.com",
      budget: "Under ₹3 Cr",
      website_url_hp: "http://spam-link.com", // Trigger Honeypot
      page_url: "https://gurgaonpropertyadvisory.com/"
    }
  }
];

async function runTests() {
  console.log("=== STARTING LEAD FORM SUBMISSION TESTS ===");
  for (const test of testLeads) {
    console.log(`\nTesting: ${test.testName}...`);
    try {
      const res = await fetch("http://localhost:3000/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(test.payload)
      });
      const data = await res.json();
      console.log(`Status: ${res.status} | Result:`, data);
      if (res.ok && data.success) {
        console.log("✅ PASSED: Enquiry received and queued for akash@silverdomerealtors.com");
      } else {
        console.log("❌ FAILED or REJECTED as expected:", data);
      }
    } catch (err) {
      console.error("❌ ERROR connecting to server:", err.message);
    }
  }
  console.log("\n=== ALL TESTS COMPLETED ===");
}

runTests();
