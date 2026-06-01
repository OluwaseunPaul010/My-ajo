import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { inviteCode } = await req.json();

    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (group.members.length >= group.maxMembers) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    const existing = group.members.find((m: any) => m.userId === decoded.userId);
    if (existing) {
      return NextResponse.json({ error: "You are already in this group" }, { status: 400 });
    }

    await prisma.groupMember.create({
      data: {
        userId: decoded.userId,
        groupId: group.id,
        role: "member",
        payoutOrder: group.members.length + 1,
      },
    });

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}