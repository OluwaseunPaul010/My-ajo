import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, verifiedUsers, bvnVerifiedUsers,
      totalGroups, activeGroups,
      totalTransactions, completedTransactions, todayTransactions,
      totalGoals, wallets, referralEarnings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { bvnVerified: true } }),
      prisma.group.count(),
      prisma.group.count({ where: { status: "active" } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "completed" } }),
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.goal.count(),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.user.aggregate({ _sum: { referralEarnings: true } }),
    ]);

    const totalVolume = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "credit", status: "completed" },
    });

    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } },
    });

    return NextResponse.json({
      success: true,
      totalUsers,
      verifiedUsers,
      bvnVerifiedUsers,
      totalGroups,
      activeGroups,
      totalTransactions,
      completedTransactions,
      todayTransactions,
      totalGoals,
      totalWalletBalance: wallets._sum.balance || 0,
      totalReferralEarnings: referralEarnings._sum.referralEarnings || 0,
      totalVolume: totalVolume._sum.amount || 0,
      newUsersToday,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}