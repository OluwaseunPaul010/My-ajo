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

    if (!bvn || bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      return NextResponse.json({ error: "BVN must be exactly 11 digits" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.bvnVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    // ============================================================
    // DEMO MODE: Paystack's BVN/Identity API requires manual business
    // approval before it accepts real BVNs in production. Until that
    // approval comes through, we simulate a successful verification
    // for any valid 11-digit BVN so the feature works end-to-end for
    // demos and testing.
    //
    // TODO: Once Paystack approves Identity API access, set
    // isDemoMode to false to switch to the real verification call.
    // ============================================================
    const isDemoMode = true;

    if (isDemoMode) {
      const emailAlreadyVerified = user.emailVerified;

await prisma.user.update({
  where: { id: decoded.userId },
  data: {
    bvnVerified: true,
    trustScore: Math.min(100, (user.trustScore || 100) + 10),
    isVerified: emailAlreadyVerified ? true : false,
  },
});

      await prisma.notification.create({
        data: {
          userId: decoded.userId,
          title: "BVN Verified! ✅",
          message: "Your BVN has been verified successfully. Your trust score increased by 10 points!",
          type: "success",
        },
      });

      return NextResponse.json({ success: true, message: "BVN verified successfully!" });
    }

    // Real Paystack verification (used once isDemoMode is set to false)
    const paystackRes = await fetch(`https://api.paystack.co/bank/resolve_bvn/${bvn}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: "BVN verification failed. Please check the number and try again." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        bvnVerified: true,
        trustScore: Math.min(100, (user.trustScore || 100) + 10),
        isVerified: user.emailVerified ? true : false,
      },
    });

    return NextResponse.json({ success: true, message: "BVN verified successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}