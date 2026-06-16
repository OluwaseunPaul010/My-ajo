import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Email is already verified",
      });
    }

    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: verifyToken },
    });

    await sendEmail({
      to: user.email,
      subject: "Verify Your My Ajo Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">My Ajo 🌿</h1>
            <p style="color: #d1fae5; margin: 8px 0 0;">Save Together, Grow Together</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #111827; margin: 0 0 16px;">Verify Your Email</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Hi ${user.fullName},</p>
            <p style="color: #6b7280; margin: 0 0 24px;">Use the code below to verify your email address and get +5 trust points!</p>
            <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
              <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Verification Code</p>
              <h1 style="color: #10b981; margin: 0; font-size: 48px; letter-spacing: 8px; font-weight: bold;">${verifyToken}</h1>
              <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">Valid for 30 minutes</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 My Ajo. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Verification email sent!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, token } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerifyToken !== token) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        trustScore: Math.min(100, (user.trustScore || 100) + 5),
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Email Verified! ✅",
        message: "Your email has been verified successfully. Your trust score increased by 5 points!",
        type: "success",
      },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}