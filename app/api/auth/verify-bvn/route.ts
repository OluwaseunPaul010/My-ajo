import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { bvn } = await req.json();

    if (!bvn || bvn.length !== 11) {
      return NextResponse.json({ error: "BVN must be 11 digits" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.bvnVerified) {
      return NextResponse.json({ error: "BVN already verified" }, { status: 400 });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/bank/resolve_bvn/${bvn}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({
        error: "BVN verification failed. Please check your BVN and try again.",
      }, { status: 400 });
    }

    const bvnName = `${paystackData.data?.first_name} ${paystackData.data?.last_name}`.toLowerCase();
    const userName = user.fullName.toLowerCase();
    const nameMatch = bvnName.split(" ").some((n: string) =>
      userName.includes(n) && n.length > 2
    );

    if (!nameMatch) {
      return NextResponse.json({
        error: "BVN name does not match your registered name.",
      }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        bvn,
        bvnVerified: true,
        isVerified: true,
        kycStatus: "verified",
        trustScore: Math.min(100, (user.trustScore || 100) + 10),
      },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "BVN Verified! 🎉",
        message: "Your BVN has been verified successfully. Your account is now fully verified and your trust score increased by 10 points!",
        type: "success",
      },
    });

    return NextResponse.json({
      success: true,
      message: "BVN verified successfully! Your account is now fully verified.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}