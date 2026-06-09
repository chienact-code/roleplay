import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { stageIndex } = await req.json();
    const { sessionId } = params;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const stage = session.scenarioSnapshot.stages[stageIndex];
    await updateSession(sessionId, { currentStageIndex: stageIndex });

    return NextResponse.json({
      stageIndex,
      stageName: stage?.name ?? "Kết thúc",
    });
  } catch (error) {
    console.error("Error in stage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
