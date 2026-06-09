"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getScenario } from "@/lib/firestore";
import { Scenario } from "@/lib/types";
import { ScenarioForm } from "@/components/course/ScenarioForm";
import { Loader2 } from "lucide-react";

export default function EditScenarioPage() {
  const { courseId, scenarioId } = useParams<{ courseId: string; scenarioId: string }>();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScenario(courseId, scenarioId).then(setScenario).finally(() => setLoading(false));
  }, [courseId, scenarioId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!scenario) return <div className="p-8">Không tìm thấy scenario.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa: {scenario.name}</h1>
      <ScenarioForm courseId={courseId} initial={scenario} scenarioId={scenarioId} />
    </div>
  );
}
