#!/usr/bin/env node

/**
 * Email Configuration Test Script
 *
 * This script tests your email configuration to ensure notifications
 * can be sent properly from the FinAutoJobs application.
 *
 * Usage: node test-email-config.js <recipient-email>
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, ".env") });

const testEmailConfig = async (recipientEmail) => {
  console.log("\n🔍 Testing Email Configuration...\n");

  // Check if email credentials are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not found in .env file!");
    console.log("\n📝 Please add the following to your backend/.env file:");
    console.log(`
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM_NAME=FinAutoJobs Recruitment
EMAIL_FROM_ADDRESS=your-email@gmail.com
SEND_EMAILS_IN_DEV=true
    `);
    console.log("\n📚 For Gmail setup instructions:");
    console.log(
      "1. Enable 2-Step Verification: https://myaccount.google.com/security"
    );
    console.log(
      "2. Generate App Password: https://myaccount.google.com/apppasswords"
    );
    console.log('   - Select "Mail" and your device');
    console.log("   - Copy the 16-character password\n");
    process.exit(1);
  }

  console.log("✅ Email credentials found");
  console.log(`   Host: ${process.env.EMAIL_HOST || "smtp.gmail.com"}`);
  console.log(`   Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(
    `   From: ${process.env.EMAIL_FROM_NAME || "FinAutoJobs"} <${
      process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
    }>`
  );

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("\n🔌 Verifying connection to email server...");

  try {
    await transporter.verify();
    console.log("✅ Successfully connected to email server!");
  } catch (error) {
    console.error("❌ Failed to connect to email server!");
    console.error("   Error:", error.message);

    if (error.message.includes("Invalid login")) {
      console.log("\n💡 Possible solutions:");
      console.log("   - Check that EMAIL_USER and EMAIL_PASS are correct");
      console.log(
        "   - For Gmail, make sure you're using an App Password, not your regular password"
      );
      console.log(
        "   - Verify 2-Step Verification is enabled in Google account"
      );
    }

    process.exit(1);
  }

  // Send test email
  const recipient = recipientEmail || process.env.EMAIL_USER;
  console.log(`\n📧 Sending test email to: ${recipient}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; color: #155724; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Email Configuration Successful!</h1>
        </div>
        <div class="content">
          <div class="success">
            <h2>✅ Test Passed</h2>
            <p>Your email configuration is working correctly!</p>
          </div>
          
          <h3>Email Service Details:</h3>
          <ul>
            <li><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</li>
            <li><strong>Port:</strong> ${process.env.EMAIL_PORT}</li>
            <li><strong>From Name:</strong> ${
              process.env.EMAIL_FROM_NAME || "FinAutoJobs"
            }</li>
          </ul>

          <h3>What happens now?</h3>
          <p>Your FinAutoJobs application can now send email notifications for:</p>
          <ul>
            <li>📅 Interview scheduling and reminders</li>
            <li>📝 Application status updates</li>
            <li>📨 Direct messages from recruiters</li>
            <li>🔔 Job alerts and recommendations</li>
            <li>✉️ Account verification and password resets</li>
          </ul>

          <p><strong>Note:</strong> Make sure to restart your backend server for the changes to take effect.</p>
        </div>
        <div class="footer">
          <p>Sent from FinAutoJobs Email Service</p>
          <p>Test completed at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || "FinAutoJobs"} <${
        process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      }>`,
      to: recipient,
      subject: "✅ FinAutoJobs Email Configuration Test - SUCCESS",
      html: htmlContent,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n📬 Check your inbox at: ${recipient}`);
    console.log("\n🎉 Email configuration is working correctly!");
    console.log(
      "\n⚠️  Remember to restart your backend server for changes to take effect:"
    );
    console.log("   cd backend && npm start\n");
  } catch (error) {
    console.error("❌ Failed to send test email!");
    console.error("   Error:", error.message);
    process.exit(1);
  }
};

// Get recipient email from command line args or use configured email
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.log(
    "📧 No recipient email specified. Sending to configured EMAIL_USER."
  );
  console.log("💡 Usage: node test-email-config.js <recipient-email>\n");
}

testEmailConfig(recipientEmail).catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
