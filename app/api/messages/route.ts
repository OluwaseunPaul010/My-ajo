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
    const groupId = searchParams.get("groupId");

    if (!groupId) return NextResponse.json({ error: "Group ID required" }, { status: 400 });

    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId: decoded.userId },
    });

    if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const messages = await prisma.message.findMany({
      where: { groupId },
      include: {
        sender: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ success: true, messages });
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

    const { groupId, text } = await req.json();

    if (!groupId || !text) return NextResponse.json({ error: "Group ID and text required" }, { status: 400 });

    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId: decoded.userId },
    });

    if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const message = await prisma.message.create({
      data: {
        groupId,
        senderId: decoded.userId,
        text,
      },
      include: {
        sender: {
          select: { id: true, fullName: true },
        },
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}