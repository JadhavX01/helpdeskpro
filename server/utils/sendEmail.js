const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other services like Outlook, Yahoo, etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS  // Your app-specific password
      }
    });

    // Email options
    const mailOptions = {
      from: `"HelpdeskPro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

module.exports = sendEmail;
