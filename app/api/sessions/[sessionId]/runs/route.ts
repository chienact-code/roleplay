import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession, createPracticeRun, getPracticeRuns } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const runs = await getPracticeRuns(sessionId);
    const runIndex = runs.length + 1;

    const runId = await createPracticeRun(sessionId, runIndex);
    await updateSession(sessionId, {
      status: "active",
      practiceRunCount: runIndex,
    });

    return NextResponse.json({ runId, runIndex });
  } catch (error) {
    console.error("Error creating practice run:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const runs = await getPracticeRuns(params.sessionId);
    return NextResponse.json({ runs });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
