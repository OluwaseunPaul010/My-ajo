import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function generateInviteCode() {
  return "AJO-" + Math.random().toString(36).substring(2, 6).toUpperCase() + 
    "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const groups = await prisma.groupMember.findMany({
      where: { userId: decoded.userId },
      include: {
        group: {
          include: {
            members: {
              include: { user: true }
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, groups: groups.map((g: any) => g.group) });
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

    const { name, description, contribution, frequency, maxMembers } = await req.json();

    if (!name || !contribution || !frequency || !maxMembers) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        contribution: parseFloat(contribution),
        frequency,
        maxMembers: parseInt(maxMembers),
        inviteCode: generateInviteCode(),
        members: {
          create: {
            userId: decoded.userId,
            role: "admin",
            payoutOrder: 1,
          },
        },
      },
    });

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}