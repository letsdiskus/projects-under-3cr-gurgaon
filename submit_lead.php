<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

// Parse JSON payload
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) { $data = $_POST; }

// 1. Spam Protection: Honeypot check
if (!empty($data['website_url_hp']) && trim($data['website_url_hp']) !== '') {
    echo json_encode(["success" => true, "message" => "Your enquiry has been received. A property advisor will contact you shortly."]);
    exit;
}

// 2. Server-side Validation
$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$phoneDigits = preg_replace('/[^0-9]/', '', $phone);
$email = trim($data['email'] ?? '');
$budget = trim($data['budget'] ?? '');

if (strlen($name) < 2) {
    echo json_encode(["success" => false, "message" => "Invalid name provided"]); exit;
}
if (strlen($phoneDigits) < 7 || strlen($phoneDigits) > 15) {
    echo json_encode(["success" => false, "message" => "Invalid phone number provided"]); exit;
}
if (empty($budget)) {
    echo json_encode(["success" => false, "message" => "Budget selection is required"]); exit;
}

// 3. Prepare lead data
$looking_for = $data['looking_for'] ?? 'End Use';
$location = $data['location'] ?? 'Not Specified';
$property_type = $data['property_type'] ?? 'Not Specified';

date_default_timezone_set('Asia/Kolkata');
$submitted_at = date('d/m/Y, h:i:s A');

// 4. Generate Luxury HTML Email (Replicating your Node.js template)
$emailHtml = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f3ef; padding: 24px; color: #1a1a1a; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2ded5; }
    .email-header { background: #111114; padding: 28px 24px; border-bottom: 3px solid #C9A96E; text-align: center; }
    .header-title { color: #C9A96E; font-size: 20px; font-weight: 700; text-transform: uppercase; margin: 0 0 6px 0; }
    .header-sub { color: #d8d8dc; font-size: 13px; margin: 0; }
    .email-body { padding: 28px 24px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .data-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0eee9; }
    .data-label { width: 38%; font-weight: 600; color: #55555c; }
    .data-value { width: 62%; font-weight: 500; color: #111114; }
    .data-value.highlight { color: #9F7E47; font-weight: 700; }
  </style>
</head>
<body>
  <div class='email-container'>
    <div class='email-header'>
      <div class='header-title'>Gurgaon Luxury Property Advisory</div>
      <p class='header-sub'>New Lead Notification</p>
    </div>
    <div class='email-body'>
      <table class='data-table'>
        <tr><td class='data-label'>Name:</td><td class='data-value'><strong>$name</strong></td></tr>
        <tr><td class='data-label'>Phone:</td><td class='data-value'>$phone</td></tr>
        <tr><td class='data-label'>Email:</td><td class='data-value'>$email</td></tr>
        <tr><td class='data-label'>Budget:</td><td class='data-value highlight'>$budget</td></tr>
        <tr><td class='data-label'>Looking For:</td><td class='data-value'>$looking_for</td></tr>
        <tr><td class='data-label'>Location:</td><td class='data-value'>$location</td></tr>
        <tr><td class='data-label'>Property Type:</td><td class='data-value'>$property_type</td></tr>
        <tr><td class='data-label'>Submitted At:</td><td class='data-value'>$submitted_at</td></tr>
      </table>
    </div>
  </div>
</body>
</html>
";

// 5. Save lead backup log to server
$logEntry = [
    "name" => $name,
    "phone" => $phone,
    "email" => $email,
    "budget" => $budget,
    "looking_for" => $looking_for,
    "location" => $location,
    "property_type" => $property_type,
    "submitted_at" => $submitted_at,
    "ip" => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];
@file_put_contents(__DIR__ . '/leads_log.json', json_encode($logEntry) . PHP_EOL, FILE_APPEND | LOCK_EX);

// 6. Send Email Notification
$to = "enquiries@silverdomerealtors.com"; 
$subject = "New Gurgaon Property Enquiry – $budget – $name";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";
$headers .= "From: no-reply@propertysaleshub.in\r\n";
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: $email\r\n";
}

@mail($to, $subject, $emailHtml, $headers);

// Always return success JSON to ensure user sees Thank You confirmation
echo json_encode(["success" => true, "message" => "Your enquiry has been received. A property advisor will contact you shortly."]);
?>