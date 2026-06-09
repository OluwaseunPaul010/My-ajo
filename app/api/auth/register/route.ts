import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or phone already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        wallet: {
          create: { balance: 0 },
        },
      },
    });

    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();

await prisma.user.update({
  where: { id: user.id },
  data: { emailVerifyToken: verifyToken },
});

const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "My Ajo <onboarding@resend.dev>",
  to: user.email,
  subject: "Welcome to My Ajo - Verify Your Email",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to My Ajo! 🌿</h1>
        <p style="color: #d1fae5; margin: 8px 0 0;">Save Together, Grow Together</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <h2 style="color: #111827; margin: 0 0 16px;">Verify Your Email Address</h2>
        <p style="color: #6b7280; margin: 0 0 24px;">Hi ${user.fullName}, welcome to My Ajo!</p>
        <p style="color: #6b7280; margin: 0 0 24px;">Use this code to verify your email:</p>
        <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
          <h1 style="color: #10b981; margin: 0; font-size: 48px; letter-spacing: 8px;">${verifyToken}</h1>
          <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">Valid for 30 minutes</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 My Ajo. All rights reserved.</p>
      </div>
    </div>
  `,
});
    await prisma.notification.create({
    data: {
    userId: user.id,
    title: "Welcome to My Ajo! 🎉",
    message: "Your account has been created successfully. Start saving by joining or creating a group!",
    type: "success",
  },
});
    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}