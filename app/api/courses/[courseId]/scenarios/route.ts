import { NextRequest, NextResponse } from "next/server";
import { getScenarios, createScenario } from "@/lib/firestore-server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const scenarios = await getScenarios(params.courseId);
    return NextResponse.json({ scenarios });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const data = await req.json();
    const scenarioId = await createScenario(params.courseId, data);
    return NextResponse.json({ scenarioId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
