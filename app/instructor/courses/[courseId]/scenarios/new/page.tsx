import { ScenarioForm } from "@/components/course/ScenarioForm";

export default function NewScenarioPage({ params }: { params: { courseId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tạo scenario mới</h1>
      <ScenarioForm courseId={params.courseId} />
    </div>
  );
}
