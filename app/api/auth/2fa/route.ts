import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ success: true, required: false });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: code, twoFactorExpiry: expiry },
    });

    await sendEmail({
      to: email,
      subject: "My Ajo - Your 2FA Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">My Ajo 🌿</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #111827;">Two-Factor Authentication Code</h2>
            <p style="color: #6b7280;">Hi ${user.fullName}, use this code to complete your login:</p>
            <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
              <h1 style="color: #10b981; margin: 0; font-size: 48px; letter-spacing: 8px;">${code}</h1>
              <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            <p style="color: #6b7280;">If you did not try to log in, please secure your account immediately.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, required: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.twoFactorCode !== code) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
    }

    if (user.twoFactorExpiry && user.twoFactorExpiry < new Date()) {
      return NextResponse.json({ error: "2FA code has expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpiry: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { enabled } = await req.json();

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { twoFactorEnabled: enabled },
    });

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}