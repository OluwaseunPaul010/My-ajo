import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error("❌ GMAIL_USER or GMAIL_PASS environment variable is missing!");
    throw new Error("Email service not configured");
  }

  try {
    const info = await transporter.sendMail({
      from: `"My Ajo" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId, "to:", to);
    return info;
  } catch (error: any) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
}