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
          take: 5,
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

    const upcomingPayout = groups.reduce((best: any, group: any) => {
      const myPosition = group.members.findIndex((m: any) => m.userId === decoded.userId);
      const nextPosition = group.members.findIndex((m: any, i: number) => i > 0);
      if (myPosition === 1) {
        return {
          amount: group.contribution * group.members.length,
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
        trustScore: user.trustScore,
        streak: user.streak,
        wallet: user.wallet,
        groups,
        transactions: user.transactions,
        upcomingPayout,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}