import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const [user, transactions, notifications, goals, groups] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.groupMember.findMany({
        where: { userId },
        include: { group: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      user,
      transactions,
      notifications,
      goals,
      groups: groups.map((m: any) => m.group),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}