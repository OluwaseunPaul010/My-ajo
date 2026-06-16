import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json({
        error: `Account locked. Try again in ${minutesLeft} minute(s).`,
      }, { status: 423 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      const attempts = (user.loginAttempts || 0) + 1;
      const shouldLock = attempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null,
        },
      });

      if (shouldLock) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Account Temporarily Locked 🔒",
            message: "Your account has been locked for 30 minutes due to 5 failed login attempts.",
            type: "alert",
          },
        });
        return NextResponse.json({
          error: "Account locked for 30 minutes due to too many failed attempts.",
        }, { status: 423 });
      }

      return NextResponse.json({
        error: `Invalid email or password. ${5 - attempts} attempt(s) remaining.`,
      }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "Login",
        details: "Successful login",
        device: req.headers.get("user-agent")?.slice(0, 100) || "Unknown",
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
        wallet: user.wallet,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        bvnVerified: user.bvnVerified,
        trustScore: user.trustScore,
        twoFactorEnabled: user.twoFactorEnabled,
        transactionPin: !!user.transactionPin,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}