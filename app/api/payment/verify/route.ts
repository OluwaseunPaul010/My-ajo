import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ 
        error: "Payment not successful", 
        details: data 
      }, { status: 400 });
    }

    const amount = data.data.amount / 100;
    const userId = data.data.metadata?.userId;

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID not found in metadata" 
      }, { status: 400 });
    }

    const existing = await prisma.transaction.findFirst({
      where: { reference },
    });

    if (existing) {
      return NextResponse.json({ success: true, amount, message: "Already processed" });
    }

    await prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: "credit",
        amount,
        description: "Wallet Funding via Paystack",
        status: "completed",
        reference,
      },
    });

    return NextResponse.json({ success: true, amount });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ 
      error: "Something went wrong",
      message: String(error)
    }, { status: 500 });
  }
}