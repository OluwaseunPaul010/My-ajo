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
      include: {
        wallet: true,
        groupMembers: {
          include: {
            group: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        fullName: true,
                        email: true,
                        trustScore: true,
                      },
                    },
                  },
                  orderBy: { payoutOrder: "asc" },
                },
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groups = user.groupMembers.map((m: any) => ({
      ...m.group,
      myRole: m.role,
      myPayoutOrder: m.payoutOrder,
      joinedAt: m.joinedAt,
    }));

    // Contribution overview
    const groupContributions = user.transactions.filter(
      (t: any) => t.type === "debit" && t.groupId && t.status === "completed"
    );
    const totalContributed = groupContributions.reduce(
      (sum: number, t: any) => sum + t.amount, 0
    );
    const totalExpected = groups.length;
    const paid = groupContributions.length;
    const missed = Math.max(0, totalExpected - paid);

    const contributionOverview = {
      paid,
      totalExpected,
      totalContributed,
      missed,
      pending: Math.max(0, totalExpected - paid),
      percentage: totalExpected > 0
        ? Math.min(100, Math.round((paid / totalExpected) * 100))
        : 0,
    };

    // Upcoming payout
    const upcomingPayout = groups.reduce((best: any, group: any) => {
      const myPosition = group.members?.findIndex(
        (m: any) => m.userId === decoded.userId
      );
      if (myPosition === 1) {
        return {
          amount: group.contribution * (group.members?.length || 1),
          groupName: group.name,
          position: myPosition + 1,
        };
      }
      return best;
    }, null);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        bvnVerified: user.bvnVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        transactionPin: !!user.transactionPin,
        trustScore: user.trustScore,
        streak: user.streak,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
        wallet: user.wallet,
        groups,
        transactions: user.transactions,
        upcomingPayout,
        contributionOverview,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}