import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { title, targetAmount, deadline } = await req.json();

    if (!title || !targetAmount) {
      return NextResponse.json({ error: "Title and target amount are required" }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: decoded.userId,
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { goalId, amount } = await req.json();

    if (!goalId || !amount) {
      return NextResponse.json({ error: "Goal ID and amount required" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId },
    });

    if (!wallet || wallet.balance < parseFloat(amount)) {
      return NextResponse.json({
        error: `Insufficient balance. You need ₦${parseFloat(amount).toLocaleString()} but have ₦${(wallet?.balance || 0).toLocaleString()}`,
      }, { status: 400 });
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    const newSavedAmount = goal.savedAmount + parseFloat(amount);

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        savedAmount: newSavedAmount,
        status: newSavedAmount >= goal.targetAmount ? "completed" : "active",
      },
    });

    await prisma.wallet.update({
      where: { userId: decoded.userId },
      data: { balance: { decrement: parseFloat(amount) } },
    });

    await prisma.transaction.create({
      data: {
        userId: decoded.userId,
        type: "debit",
        amount: parseFloat(amount),
        description: `Savings towards goal: ${goal.title}`,
        status: "completed",
      },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "Goal Savings Added! 🎯",
        message: `₦${parseFloat(amount).toLocaleString()} added to your goal "${goal.title}". ${newSavedAmount >= goal.targetAmount ? "🎉 Goal completed!" : "Keep it up!"}`,
        type: "success",
      },
    });

    return NextResponse.json({ success: true, goal: updatedGoal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}