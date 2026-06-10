import { NextRequest, NextResponse } from "next/server";
import { getScenario, updateScenario } from "@/lib/firestore-server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; scenarioId: string } }
) {
  try {
    const scenario = await getScenario(params.courseId, params.scenarioId);
    if (!scenario) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ scenario });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string; scenarioId: string } }
) {
  try {
    const data = await req.json();
    await updateScenario(params.courseId, params.scenarioId, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
