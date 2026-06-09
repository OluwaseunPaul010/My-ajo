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
    }));

    const contributions = user.transactions.filter((t: any) => t.type === "debit" && t.groupId);
    const totalContributed = contributions.reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpected = groups.reduce((sum: number, g: any) => sum + g.contribution, 0);
    const missedContributions = Math.max(0, groups.length - contributions.length);

    const contributionOverview = {
      paid: contributions.length,
      totalExpected: groups.length,
      totalContributed,
      totalExpected: totalExpected,
      missed: missedContributions,
      pending: Math.max(0, groups.length - contributions.length),
      percentage: groups.length > 0 ? Math.round((contributions.length / groups.length) * 100) : 0,
    };

    const upcomingPayout = groups.reduce((best: any, group: any) => {
      const myPosition = group.members?.findIndex((m: any) => m.userId === decoded.userId);
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
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        bvnVerified: user.bvnVerified,
        kycStatus: user.kycStatus,
        trustScore: user.trustScore,
        streak: user.streak,
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