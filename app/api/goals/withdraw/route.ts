import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { goalId } = await req.json();

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    if (goal.userId !== decoded.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (goal.savedAmount < goal.targetAmount) {
      return NextResponse.json({ error: "Goal not yet completed" }, { status: 400 });
    }
    if (goal.status === "withdrawn") {
      return NextResponse.json({ error: "Already withdrawn" }, { status: 400 });
    }

    await prisma.wallet.update({
      where: { userId: decoded.userId },
      data: { balance: { increment: goal.savedAmount } },
    });

    await prisma.goal.update({
      where: { id: goalId },
      data: { status: "withdrawn" },
    });

    await prisma.transaction.create({
      data: {
        userId: decoded.userId,
        type: "credit",
        amount: goal.savedAmount,
        description: `Goal completed: ${goal.title} withdrawn to wallet`,
        status: "completed",
      },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "Goal Withdrawn to Wallet! 🎉",
        message: `₦${goal.savedAmount.toLocaleString()} from your goal "${goal.title}" has been added to your wallet!`,
        type: "payment",
      },
    });

    return NextResponse.json({ success: true, amount: goal.savedAmount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}