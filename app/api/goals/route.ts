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

    const { goalId, savedAmount } = await req.json();

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: { savedAmount: parseFloat(savedAmount) },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}