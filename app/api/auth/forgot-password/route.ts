import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If this email exists, a reset code has been sent.",
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await resend.emails.send({
      from: "My Ajo <onboarding@resend.dev>",
      to: email,
      subject: "Your My Ajo Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">My Ajo 🌿</h1>
            <p style="color: #d1fae5; margin: 8px 0 0;">Save Together, Grow Together</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #111827; margin: 0 0 16px;">Password Reset Code</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Hi ${user.fullName},</p>
            <p style="color: #6b7280; margin: 0 0 24px;">We received a request to reset your My Ajo password. Use the code below to reset it:</p>
            <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
              <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Your Reset Code</p>
              <h1 style="color: #10b981; margin: 0; font-size: 48px; letter-spacing: 8px; font-weight: bold;">${resetCode}</h1>
              <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">Valid for 15 minutes</p>
            </div>
            <p style="color: #6b7280; margin: 0 0 24px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            <div style="background: #fef3c7; border-radius: 8px; padding: 12px; margin: 0 0 24px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">⚠️ Never share this code with anyone. My Ajo will never ask for your code.</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 My Ajo. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Reset code sent to your email!",
      resetCode,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}