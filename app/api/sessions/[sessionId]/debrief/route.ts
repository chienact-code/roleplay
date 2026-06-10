import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession, getMessages } from "@/lib/firestore-server";
import { buildDebriefPrompt } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const [session, messages] = await Promise.all([
      getSession(sessionId),
      getMessages(sessionId),
    ]);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const prompt = buildDebriefPrompt(
      session.groupSnapshot,
      session.scenarioSnapshot,
      messages
    );

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { rubricFeedback: [], strengths: [], improvements: [], actionItems: [] };
    }

    return NextResponse.json({
      transcript: messages,
      ...parsed,
    });
  } catch (error) {
    console.error("Error generating debrief:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
