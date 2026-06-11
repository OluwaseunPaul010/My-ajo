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
      include: {
        members: {
          include: {
            user: { include: { wallet: true } },
          },
          orderBy: { payoutOrder: "asc" },
        },
      },
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const adminMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: decoded.userId, role: "admin" },
    });

    if (!adminMember) {
      return NextResponse.json({ error: "Only admins can process payouts" }, { status: 403 });
    }

    const nextRecipient = group.members[0];
    if (!nextRecipient) {
      return NextResponse.json({ error: "No members in rotation" }, { status: 400 });
    }

    const totalPayout = group.contribution * group.members.length;

    await prisma.wallet.update({
      where: { userId: nextRecipient.userId },
      data: { balance: { increment: totalPayout } },
    });

    await prisma.transaction.create({
      data: {
        userId: nextRecipient.userId,
        groupId,
        type: "credit",
        amount: totalPayout,
        description: `Ajo payout from ${group.name}`,
        status: "completed",
      },
    });

    await prisma.notification.create({
      data: {
        userId: nextRecipient.userId,
        title: "🎉 You received your Ajo payout!",
        message: `₦${totalPayout.toLocaleString()} from "${group.name}" has been added to your wallet!`,
        type: "payment",
      },
    });

    for (const member of group.members) {
      if (member.userId !== nextRecipient.userId) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            title: "Payout Processed 💰",
            message: `${nextRecipient.user.fullName} received the payout of ₦${totalPayout.toLocaleString()} from "${group.name}".`,
            type: "group",
          },
        });
      }
    }

    await prisma.groupMember.update({
      where: { id: nextRecipient.id },
      data: { payoutOrder: group.members.length + 1 },
    });

    for (let i = 1; i < group.members.length; i++) {
      await prisma.groupMember.update({
        where: { id: group.members[i].id },
        data: { payoutOrder: i },
      });
    }

    return NextResponse.json({
      success: true,
      message: `₦${totalPayout.toLocaleString()} paid to ${nextRecipient.user.fullName}`,
      recipient: nextRecipient.user.fullName,
      amount: totalPayout,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}