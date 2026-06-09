import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession, getPracticeRunMessages, getPracticeRuns } from "@/lib/firestore";
import { buildCoachingDebriefPrompt } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const runId = req.nextUrl.searchParams.get("runId");

    if (!runId) {
      return NextResponse.json({ error: "runId required" }, { status: 400 });
    }

    const [session, runs] = await Promise.all([
      getSession(sessionId),
      getPracticeRuns(sessionId),
    ]);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const currentRun = runs.find((r) => r.id === runId);
    if (!currentRun) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const messages = await getPracticeRunMessages(sessionId, runId);

    // Find previous run for comparison
    let previousMessages;
    let previousRunIndex;
    if (currentRun.runIndex > 1) {
      const prevRun = runs.find((r) => r.runIndex === currentRun.runIndex - 1);
      if (prevRun) {
        previousMessages = await getPracticeRunMessages(sessionId, prevRun.id);
        previousRunIndex = prevRun.runIndex;
      }
    }

    const prompt = buildCoachingDebriefPrompt(
      session.groupSnapshot,
      messages,
      previousMessages,
      previousRunIndex
    );

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { unlockedInfo: [], missedContextual: [], missedConfirmOnly: [], suggestedQuestions: [] };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating coaching debrief:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
