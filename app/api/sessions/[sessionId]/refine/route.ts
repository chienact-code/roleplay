import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession, getMessages } from "@/lib/firestore-server";
import { buildRefinementSystemPrompt } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { message, currentSuggestions, selectedPoints } = await req.json();
    const { sessionId } = params;

    const session = await getSession(sessionId);
    if (!session) {
      return new Response("Session not found", { status: 404 });
    }

    const messages = await getMessages(sessionId);
    const systemPrompt = buildRefinementSystemPrompt(
      session.groupSnapshot,
      session.scenarioSnapshot,
      session.currentStageIndex,
      messages,
      currentSuggestions,
      selectedPoints
    );

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
          if (event.type === "message_stop") {
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            controller.close();
          }
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("Error in refine:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
