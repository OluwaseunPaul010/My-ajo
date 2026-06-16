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

    const announcements = await prisma.announcement.findMany({
      where: { groupId },
      include: {
        user: { select: { fullName: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, announcements });
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

    const { groupId, message, isPinned } = await req.json();

    if (!groupId || !message) {
      return NextResponse.json({ error: "Group ID and message required" }, { status: 400 });
    }

    const adminMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: decoded.userId, role: "admin" },
    });

    if (!adminMember) {
      return NextResponse.json({ error: "Only admins can post announcements" }, { status: 403 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        groupId,
        userId: decoded.userId,
        message,
        isPinned: isPinned || false,
      },
      include: {
        user: { select: { fullName: true } },
      },
    });

    const members = await prisma.groupMember.findMany({
      where: { groupId, userId: { not: decoded.userId } },
    });

    const group = await prisma.group.findUnique({ where: { id: groupId } });

    for (const member of members) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          title: `📢 New Announcement in ${group?.name}`,
          message: message.slice(0, 100) + (message.length > 100 ? "..." : ""),
          type: "group",
        },
      });
    }

    return NextResponse.json({ success: true, announcement });
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

    const { announcementId, isPinned } = await req.json();

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const adminMember = await prisma.groupMember.findFirst({
      where: { groupId: announcement.groupId, userId: decoded.userId, role: "admin" },
    });

    if (!adminMember) {
      return NextResponse.json({ error: "Only admins can pin announcements" }, { status: 403 });
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: { isPinned },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { announcementId } = await req.json();

    await prisma.announcement.delete({ where: { id: announcementId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}