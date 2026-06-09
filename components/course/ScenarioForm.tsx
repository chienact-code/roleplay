"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scenario, Stage } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface ScenarioFormProps {
  courseId: string;
  initial?: Partial<Scenario>;
  scenarioId?: string;
}

const defaultStage = (): Stage => ({
  name: "",
  goal: "",
  durationMinutes: 10,
  aiBehavior: "",
});

export function ScenarioForm({ courseId, initial, scenarioId }: ScenarioFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [meetingOrder, setMeetingOrder] = useState(initial?.meetingOrder ?? 1);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [stages, setStages] = useState<Stage[]>(
    initial?.stages?.length ? initial.stages : [defaultStage()]
  );
  const [rubric, setRubric] = useState<string[]>(initial?.assessmentRubric ?? [""]);

  const addStage = () => setStages((prev) => [...prev, defaultStage()]);
  const removeStage = (i: number) => setStages((prev) => prev.filter((_, idx) => idx !== i));
  const updateStage = (i: number, field: keyof Stage, value: string | number) => {
    setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const addRubric = () => setRubric((prev) => [...prev, ""]);
  const removeRubric = (i: number) => setRubric((prev) => prev.filter((_, idx) => idx !== i));
  const updateRubric = (i: number, value: string) => {
    setRubric((prev) => prev.map((r, idx) => (idx === i ? value : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        meetingOrder,
        description,
        status,
        stages,
        assessmentRubric: rubric.filter(Boolean),
      };

      const url = scenarioId
        ? `/api/courses/${courseId}/scenarios/${scenarioId}`
        : `/api/courses/${courseId}/scenarios`;
      const method = scenarioId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save scenario");
      router.push(`/instructor/courses/${courseId}`);
      router.refresh();
    } catch {
      alert("Lỗi khi lưu scenario. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">1. Thông tin chung</h2>
        <div className="space-y-1.5">
          <Label>Tên scenario *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Meeting 1 – Customer Discovery" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Số thứ tự meeting</Label>
            <Input type="number" min={1} value={meetingOrder} onChange={(e) => setMeetingOrder(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Trạng thái</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Mô tả mục tiêu</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mục tiêu tổng quát của buổi meeting này..." rows={3} />
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">2. Session Stages</h2>
        {stages.map((stage, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Stage {i + 1}</span>
              {stages.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStage(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tên stage</Label>
                <Input value={stage.name} onChange={(e) => updateStage(i, "name", e.target.value)} placeholder="VD: Opening" />
              </div>
              <div className="space-y-1.5">
                <Label>Thời gian (phút)</Label>
                <Input type="number" min={1} value={stage.durationMinutes} onChange={(e) => updateStage(i, "durationMinutes", Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mục tiêu</Label>
              <Input value={stage.goal} onChange={(e) => updateStage(i, "goal", e.target.value)} placeholder="VD: Nhóm tự giới thiệu và pitch lý do buổi gặp" />
            </div>
            <div className="space-y-1.5">
              <Label>Hướng dẫn hành vi AI</Label>
              <Textarea value={stage.aiBehavior} onChange={(e) => updateStage(i, "aiBehavior", e.target.value)} placeholder="Mô tả cách AI hành xử trong stage này..." rows={2} />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStage}>
          <Plus className="h-4 w-4 mr-1" /> Thêm stage
        </Button>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">3. Rubric đánh giá</h2>
        {rubric.map((criterion, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={criterion}
              onChange={(e) => updateRubric(i, e.target.value)}
              placeholder={`Tiêu chí ${i + 1}: VD: Khả năng đặt câu hỏi khai thác nhu cầu`}
            />
            {rubric.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRubric(i)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRubric}>
          <Plus className="h-4 w-4 mr-1" /> Thêm tiêu chí
        </Button>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {scenarioId ? "Cập nhật scenario" : "Tạo scenario"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
      </div>
    </form>
  );
}
