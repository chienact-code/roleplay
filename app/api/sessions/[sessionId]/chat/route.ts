import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession, getMessages, addMessage, updateSession } from "@/lib/firestore";
import { buildAutonomousSystemPrompt } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { content } = await req.json();
    const { sessionId } = params;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const group = session.groupSnapshot;
    const scenario = session.scenarioSnapshot;

    await addMessage(sessionId, {
      role: "student",
      content,
      stageIndex: session.currentStageIndex,
    });

    if (session.status === "waiting") {
      await updateSession(sessionId, { status: "active" });
    }

    const systemPrompt = buildAutonomousSystemPrompt(group, scenario, session.currentStageIndex);

    const messages = await getMessages(sessionId);
    const history = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "student" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: history,
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          if (event.type === "message_stop") {
            await addMessage(sessionId, {
              role: "client",
              content: fullResponse,
              stageIndex: session.currentStageIndex,
            });
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            controller.close();
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
