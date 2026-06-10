import { NextRequest, NextResponse } from "next/server";
import { getGroup, getScenario, createSession } from "@/lib/firestore-server";
import { generateSessionCode } from "@/lib/session-code";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { courseId, groupId, scenarioId, mode, sessionType, instructorId } = await req.json();

    if (!courseId || !groupId || !scenarioId || !mode || !sessionType || !instructorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [group, scenario] = await Promise.all([
      getGroup(courseId, groupId),
      getScenario(courseId, scenarioId),
    ]);

    if (!group || !scenario) {
      return NextResponse.json({ error: "Group or scenario not found" }, { status: 404 });
    }

    const sessionCode = generateSessionCode();

    const sessionId = await createSession({
      courseId,
      groupId,
      scenarioId,
      groupSnapshot: group,
      scenarioSnapshot: scenario,
      instructorId,
      mode,
      sessionType,
      status: "waiting",
      sessionCode,
      currentStageIndex: 0,
      practiceRunCount: 0,
    });

    return NextResponse.json({ sessionId, sessionCode });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
