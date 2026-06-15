import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function generateReferralCode(name: string) {
  const clean = name.replace(/\s/g, "").toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}-${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    let user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        referralCode: true,
        referralEarnings: true,
        referredBy: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.referralCode) {
      const newCode = generateReferralCode(user.fullName);
      user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { referralCode: newCode },
        select: {
          id: true,
          fullName: true,
          referralCode: true,
          referralEarnings: true,
          referredBy: true,
        },
      });
    }

    const referrals = await prisma.user.findMany({
      where: { referredBy: decoded.userId },
      select: { fullName: true, createdAt: true, isVerified: true },
    });

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referralCount: referrals.length,
      referrals,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}