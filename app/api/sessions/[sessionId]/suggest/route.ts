import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession, getMessages } from "@/lib/firestore-server";
import { buildSuggestionPrompt } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { studentInput } = await req.json();
    const { sessionId } = params;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = await getMessages(sessionId);
    const prompt = buildSuggestionPrompt(
      session.groupSnapshot,
      session.scenarioSnapshot,
      session.currentStageIndex,
      studentInput,
      messages
    );

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Accept lines starting with [ or numbered (1. [...)
    const suggestions = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 5)
      .map((s) => s.replace(/^\d+\.\s*/, "")) // strip leading "1. "
      .filter((s) => s.startsWith("["));

    console.log("suggest raw:", JSON.stringify(text.slice(0, 300)));
    console.log("suggest parsed:", suggestions);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in suggest:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
