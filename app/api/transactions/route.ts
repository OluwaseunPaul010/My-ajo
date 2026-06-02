import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    const totalIn = transactions
      .filter((tx) => tx.type === "credit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalOut = transactions
      .filter((tx) => tx.type === "debit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({ success: true, transactions, totalIn, totalOut });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}