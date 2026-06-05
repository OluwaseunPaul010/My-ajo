import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { groupId, memberId } = await req.json();

    const adminMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: decoded.userId, role: "admin" },
    });

    if (!adminMember) {
      return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
    }

    await prisma.groupMember.deleteMany({
      where: { groupId, userId: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}