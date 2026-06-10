import { NextRequest, NextResponse } from "next/server";
import { getSessionByCode } from "@/lib/firestore-server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getSessionByCode(params.code);
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      sessionId: session.id,
      scenarioName: session.scenarioSnapshot.name,
      status: session.status,
      currentStageIndex: session.currentStageIndex,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
