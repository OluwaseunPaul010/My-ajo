import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { fullName: true, email: true, phone: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Send email to support
    await sendEmail({
      to: process.env.GMAIL_USER!,
      subject: `[My Ajo Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Support Request</h1>
            <p style="color: #d1fae5; margin: 4px 0 0; font-size: 14px;">My Ajo Customer Support</p>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 12px; background: #f0fdf4; font-weight: bold; color: #059669; width: 30%; border-radius: 4px;">Name</td>
                <td style="padding: 8px 12px; color: #111827;">${user.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #059669;">Email</td>
                <td style="padding: 8px 12px; color: #111827;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f0fdf4; font-weight: bold; color: #059669;">Phone</td>
                <td style="padding: 8px 12px; color: #111827;">${user.phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #059669;">Subject</td>
                <td style="padding: 8px 12px; color: #111827;">${subject}</td>
              </tr>
            </table>
            <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0;">
              <p style="font-weight: bold; color: #374151; margin: 0 0 8px;">Message:</p>
              <p style="color: #6b7280; margin: 0; line-height: 1.6;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px;">
              <p style="color: #92400e; margin: 0; font-size: 13px;">⚡ Reply directly to this email to respond to the customer at <strong>${user.email}</strong></p>
            </div>
          </div>
        </div>
      `,
    });

    // Send confirmation to user
    await sendEmail({
      to: user.email,
      subject: "We received your message - My Ajo Support",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">My Ajo 🌿</h1>
            <p style="color: #d1fae5; margin: 4px 0 0;">Support Team</p>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #111827; margin: 0 0 12px;">Hi ${user.fullName}! 👋</h2>
            <p style="color: #6b7280; line-height: 1.6;">We've received your message and our support team will get back to you within <strong>24 hours</strong>.</p>
            <div style="background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="color: #059669; font-weight: bold; margin: 0 0 8px;">Your message:</p>
              <p style="color: #374151; margin: 0; font-style: italic;">"${subject}"</p>
            </div>
            <p style="color: #6b7280;">While you wait, you can also:</p>
            <ul style="color: #6b7280; padding-left: 20px; line-height: 2;">
              <li>Check our <a href="https://my-ajo-seven.vercel.app/support" style="color: #10b981;">FAQ page</a> for quick answers</li>
              <li>Use our live chat for instant support</li>
              <li>Call us: <strong>0700 123 4567</strong> (Mon-Fri, 8am-6pm)</li>
            </ul>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">© 2026 My Ajo. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "Support Request Received ✅",
        message: `Your message about "${subject}" has been received. We'll respond within 24 hours.`,
        type: "success",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message sent! We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}