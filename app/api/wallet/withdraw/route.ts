import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { amount, accountNumber, bankCode, accountName } = await req.json();

    if (!amount || !accountNumber || !bankCode || !accountName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId },
    });

    if (!wallet || wallet.balance < parseFloat(amount)) {
      return NextResponse.json({
        error: `Insufficient balance. Available: ₦${wallet?.balance.toLocaleString() || 0}`,
      }, { status: 400 });
    }

    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    });

    const recipientData = await recipientRes.json();

    if (!recipientData.status) {
      return NextResponse.json({ error: "Failed to create transfer recipient" }, { status: 400 });
    }

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: parseFloat(amount) * 100,
        recipient: recipientData.data.recipient_code,
        reason: "My Ajo Wallet Withdrawal",
      }),
    });

    const transferData = await transferRes.json();

    if (!transferData.status) {
      return NextResponse.json({ error: "Transfer failed. Please try again." }, { status: 400 });
    }

    await prisma.wallet.update({
      where: { userId: decoded.userId },
      data: { balance: { decrement: parseFloat(amount) } },
    });

    await prisma.transaction.create({
      data: {
        userId: decoded.userId,
        type: "debit",
        amount: parseFloat(amount),
        description: `Withdrawal to ${accountName} - ${accountNumber}`,
        status: "completed",
        reference: transferData.data.transfer_code,
      },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "Withdrawal Successful! 💸",
        message: `₦${parseFloat(amount).toLocaleString()} has been sent to ${accountName} (${accountNumber}).`,
        type: "payment",
      },
    });

    return NextResponse.json({
      success: true,
      message: `₦${parseFloat(amount).toLocaleString()} sent to ${accountName} successfully!`,
      reference: transferData.data.transfer_code,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}