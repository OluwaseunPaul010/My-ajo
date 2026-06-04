import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
        message: "If this email exists, a reset link has been sent." 
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Password Reset Code 🔐",
        message: `Your password reset code is: ${resetCode}. Valid for 15 minutes.`,
        type: "alert",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Reset code sent! Check your notifications.",
      resetCode,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}