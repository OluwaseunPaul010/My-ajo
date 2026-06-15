import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        referralCode: true,
        referralEarnings: true,
        referredBy: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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