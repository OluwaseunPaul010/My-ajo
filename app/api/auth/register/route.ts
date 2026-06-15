import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateReferralCode(name: string) {
  const clean = name.replace(/\s/g, "").toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password, referralCode } = await req.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email or phone already exists" }, { status: 400 });
    }

    let referredById = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const hashedPassword = await hashPassword(password);
    const newReferralCode = generateReferralCode(fullName);
    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy: referredById,
        emailVerifyToken: verifyToken,
        wallet: { create: { balance: 0 } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to My Ajo! 🎉",
        message: "Your account has been created. Verify your email and BVN to unlock all features!",
        type: "success",
      },
    });

    if (referredById) {
      await prisma.wallet.update({
        where: { userId: referredById },
        data: { balance: { increment: 5000 } },
      });

      await prisma.user.update({
        where: { id: referredById },
        data: { referralEarnings: { increment: 5000 } },
      });

      await prisma.transaction.create({
        data: {
          userId: referredById,
          type: "credit",
          amount: 5000,
          description: `Referral bonus for inviting ${fullName}`,
          status: "completed",
        },
      });

      await prisma.notification.create({
        data: {
          userId: referredById,
          title: "Referral Bonus! 🎉",
          message: `${fullName} joined My Ajo using your referral code! ₦5,000 has been added to your wallet.`,
          type: "payment",
        },
      });
    }

    try {
      await resend.emails.send({
        from: "My Ajo <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to My Ajo - Verify Your Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to My Ajo! 🌿</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="color: #111827;">Hi ${fullName}!</h2>
              <p style="color: #6b7280;">Your verification code is:</p>
              <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
                <h1 style="color: #10b981; font-size: 48px; letter-spacing: 8px; margin: 0;">${verifyToken}</h1>
              </div>
              <p style="color: #6b7280;">Your referral code: <strong style="color: #10b981;">${newReferralCode}</strong></p>
              <p style="color: #6b7280;">Share it to earn ₦5,000 for each friend who joins!</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    const jwtToken = generateToken(user.id);

    return NextResponse.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}