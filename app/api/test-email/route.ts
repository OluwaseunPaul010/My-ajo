import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");

  if (!to) {
    return NextResponse.json({ error: "Add ?to=youremail@gmail.com to the URL" }, { status: 400 });
  }

  try {
    await sendEmail({
      to,
      subject: "My Ajo - Test Email ✅",
      html: "<h1>It works!</h1><p>Your Gmail SMTP configuration is working correctly.</p>",
    });
    return NextResponse.json({ success: true, message: `Test email sent to ${to}` });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: "Check Vercel → Settings → Environment Variables for GMAIL_USER and GMAIL_PASS",
    }, { status: 500 });
  }
}