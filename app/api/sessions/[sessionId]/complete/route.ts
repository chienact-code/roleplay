import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/firestore";
import { serverTimestamp, Timestamp } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const completedAt = new Date().toISOString();

    await updateSession(sessionId, {
      status: "completed",
      completedAt: serverTimestamp() as unknown as Timestamp,
    });

    return NextResponse.json({ completedAt });
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
