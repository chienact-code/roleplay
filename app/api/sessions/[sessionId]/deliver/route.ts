import { NextRequest, NextResponse } from "next/server";
import { getSession, addMessage, addRefinement } from "@/lib/firestore";
import { serverTimestamp, Timestamp } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { selectedPoints, studentInput, initialSuggestions } = await req.json();
    const { sessionId } = params;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const deliveredContent = selectedPoints.join("\n");

    const messageId = await addMessage(sessionId, {
      role: "client",
      content: deliveredContent,
      stageIndex: session.currentStageIndex,
      selectedPoints,
    });

    await addRefinement(sessionId, {
      studentInput,
      initialSuggestions,
      refinementExchanges: [],
      finalSelectedPoints: selectedPoints,
      deliveredAt: serverTimestamp() as unknown as Timestamp,
    });

    return NextResponse.json({ messageId });
  } catch (error) {
    console.error("Error in deliver:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
