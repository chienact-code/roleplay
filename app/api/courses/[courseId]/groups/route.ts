import { NextRequest, NextResponse } from "next/server";
import { getGroups, createGroup } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const groups = await getGroups(params.courseId);
    return NextResponse.json({ groups });
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
    const groupId = await createGroup(params.courseId, data);
    return NextResponse.json({ groupId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
