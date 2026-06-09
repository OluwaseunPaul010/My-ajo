import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();

    const scoreMap: Record<string, number> = {
      missed_contribution: -10,
      late_contribution: -5,
      left_group_early: -15,
      consistent_contribution: 2,
      early_payment: 1,
      completed_cycle: 5,
    };

    const change = scoreMap[action] || 0;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newScore = Math.min(100, Math.max(0, (user.trustScore || 100) + change));

    await prisma.user.update({
      where: { id: userId },
      data: { trustScore: newScore },
    });

    if (change < 0) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Trust Score Updated ⚠️",
          message: `Your trust score decreased by ${Math.abs(change)} points due to ${action.replace(/_/g, " ")}. Current score: ${newScore}%`,
          type: "alert",
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId,
          title: "Trust Score Improved! ⭐",
          message: `Your trust score increased by ${change} points. Current score: ${newScore}%`,
          type: "success",
        },
      });
    }

    return NextResponse.json({ success: true, newScore });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}