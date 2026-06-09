import { NextRequest, NextResponse } from "next/server";
import { getGroup, updateGroup } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string; groupId: string } }
) {
  try {
    const group = await getGroup(params.courseId, params.groupId);
    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ group });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string; groupId: string } }
) {
  try {
    const data = await req.json();
    await updateGroup(params.courseId, params.groupId, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
