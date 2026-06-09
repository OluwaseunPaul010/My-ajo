import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { groupId } = await req.json();

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const member = group.members.find((m: any) => m.userId === decoded.userId);
    if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const wallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId },
    });

    if (!wallet || wallet.balance < group.contribution) {
      return NextResponse.json({
        error: `Insufficient balance. You need ₦${group.contribution.toLocaleString()} to contribute.`,
      }, { status: 400 });
    }

    await prisma.wallet.update({
      where: { userId: decoded.userId },
      data: { balance: { decrement: group.contribution } },
    });

    await prisma.transaction.create({
      data: {
        userId: decoded.userId,
        groupId,
        type: "debit",
        amount: group.contribution,
        description: `Contribution to ${group.name}`,
        status: "completed",
      },
    });

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { streak: { increment: 1 } },
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { trustScore: true },
    });

    const newScore = Math.min(100, (user?.trustScore || 100) + 2);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { trustScore: newScore },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "Contribution Successful! ✅",
        message: `Your contribution of ₦${group.contribution.toLocaleString()} to ${group.name} was successful. Trust score: ${newScore}%`,
        type: "payment",
      },
    });

    return NextResponse.json({
      success: true,
      amount: group.contribution,
      newTrustScore: newScore,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}