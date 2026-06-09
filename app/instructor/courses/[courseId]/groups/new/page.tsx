import { GroupForm } from "@/components/course/GroupForm";

export default function NewGroupPage({ params }: { params: { courseId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tạo nhóm mới</h1>
      <GroupForm courseId={params.courseId} />
    </div>
  );
}
