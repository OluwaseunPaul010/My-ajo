import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function getNextDueDate(frequency: string, joinedAt: Date): Date {
  const now = new Date();
  const next = new Date(joinedAt);

  while (next <= now) {
    if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
    else if (frequency === "daily") next.setDate(next.getDate() + 1);
    else next.setMonth(next.getMonth() + 1);
  }

  return next;
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const memberships = await prisma.groupMember.findMany({
      where: { userId: decoded.userId },
      include: {
        group: true,
      },
    });

    const reminders = memberships.map((membership: any) => {
      const group = membership.group;
      const nextDue = getNextDueDate(group.frequency, membership.joinedAt);
      const daysUntil = getDaysUntil(nextDue);

      let status = "upcoming";
      if (daysUntil <= 0) status = "missed";
      else if (daysUntil <= 2) status = "active";

      return {
        id: membership.id,
        groupId: group.id,
        groupName: group.name,
        frequency: group.frequency,
        amount: group.contribution,
        nextDueDate: nextDue.toISOString(),
        daysUntil,
        status,
      };
    });

    const active = reminders.filter((r: any) => r.status === "active").length;
    const upcoming = reminders.filter((r: any) => r.status === "upcoming").length;
    const missed = reminders.filter((r: any) => r.status === "missed").length;

    return NextResponse.json({
      success: true,
      reminders,
      stats: { active, upcoming, missed },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}