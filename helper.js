const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const gmailEmail = "YOUR_GMAIL@gmail.com";
const gmailPassword = "YOUR_APP_PASSWORD";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

exports.sendAdminOTP = functions.region("us-central1").https.onCall(async (data, context) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP with expiry
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  await admin.firestore().collection("admin_otps").doc("latest").set({
    otp,
    expiresAt,
  });

  // Send email
  await transporter.sendMail({
    from: gmailEmail,
    to: "dzeyautajay@gmail.com",
    subject: "Your Admin OTP",
    text: `Your OTP code is: ${otp} (expires in 5 minutes)`,
  });

  return { success: true };
});
