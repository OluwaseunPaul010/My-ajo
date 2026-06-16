import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { pin } = await req.json();

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be exactly 4 digits" }, { status: 400 });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { transactionPin: hashedPin },
    });

    await prisma.notification.create({
      data: {
        userId: decoded.userId,
        title: "Transaction PIN Set ✅",
        message: "Your transaction PIN has been set successfully. It will be required for all withdrawals.",
        type: "success",
      },
    });

    return NextResponse.json({ success: true, message: "PIN set successfully!" });
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

    const { pin } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { transactionPin: true },
    });

    if (!user?.transactionPin) {
      return NextResponse.json({ error: "No PIN set. Please set a PIN first." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(pin, user.transactionPin);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}