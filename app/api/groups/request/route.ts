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
      include: { members: true, joinRequests: true },
    });

    if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

    if (group.members.length >= group.maxMembers) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    const existing = group.members.find((m: any) => m.userId === decoded.userId);
    if (existing) return NextResponse.json({ error: "You are already in this group" }, { status: 400 });

    const existingRequest = group.joinRequests.find(
      (r: any) => r.userId === decoded.userId && r.status === "pending"
    );
    if (existingRequest) return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });

    const request = await prisma.joinRequest.create({
      data: { groupId: group.id, userId: decoded.userId },
    });

    const admin = await prisma.groupMember.findFirst({
      where: { groupId: group.id, role: "admin" },
    });

    if (admin) {
      const requestingUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { fullName: true },
      });

      await prisma.notification.create({
        data: {
          userId: admin.userId,
          title: "New Join Request! 👥",
          message: `${requestingUser?.fullName} wants to join "${group.name}". Review in group settings.`,
          type: "group",
        },
      });
    }

    return NextResponse.json({ success: true, request, message: "Join request sent! Waiting for admin approval." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) return NextResponse.json({ error: "Group ID required" }, { status: 400 });

    const adminMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: decoded.userId, role: "admin" },
    });

    if (!adminMember) return NextResponse.json({ error: "Only admins can view requests" }, { status: 403 });

    const requests = await prisma.joinRequest.findMany({
      where: { groupId, status: "pending" },
      include: {
        user: { select: { id: true, fullName: true, email: true, trustScore: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, requests });
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

    const { requestId, action } = await req.json();

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { group: { include: { members: true } } },
    });

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const adminMember = await prisma.groupMember.findFirst({
      where: { groupId: request.groupId, userId: decoded.userId, role: "admin" },
    });

    if (!adminMember) return NextResponse.json({ error: "Only admins can approve requests" }, { status: 403 });

    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: action },
    });

    if (action === "approved") {
      await prisma.groupMember.create({
        data: {
          userId: request.userId,
          groupId: request.groupId,
          role: "member",
          payoutOrder: request.group.members.length + 1,
        },
      });

      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: "Join Request Approved! 🎉",
          message: `Your request to join "${request.group.name}" has been approved! Welcome to the group.`,
          type: "success",
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: "Join Request Declined",
          message: `Your request to join "${request.group.name}" was not approved at this time.`,
          type: "alert",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}