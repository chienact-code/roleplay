"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGroup } from "@/lib/firestore";
import { Group } from "@/lib/types";
import { GroupForm } from "@/components/course/GroupForm";
import { Loader2 } from "lucide-react";

export default function EditGroupPage() {
  const { courseId, groupId } = useParams<{ courseId: string; groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroup(courseId, groupId).then(setGroup).finally(() => setLoading(false));
  }, [courseId, groupId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!group) return <div className="p-8">Không tìm thấy nhóm.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa nhóm: {group.name}</h1>
      <GroupForm courseId={courseId} initial={group} groupId={groupId} />
    </div>
  );
}
