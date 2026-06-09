"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCourses, getGroups, getScenarios } from "@/lib/firestore";
import { Course, Group, Scenario } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const [courseId, setCourseId] = useState(searchParams.get("courseId") ?? "");
  const [groupId, setGroupId] = useState(searchParams.get("groupId") ?? "");
  const [scenarioId, setScenarioId] = useState("");
  const [mode, setMode] = useState<"autonomous" | "prompter">("autonomous");
  const [sessionType, setSessionType] = useState<"official" | "practice">("official");

  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ sessionId: string; sessionCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getCourses(profile.uid).then(setCourses);
  }, [profile]);

  useEffect(() => {
    if (!courseId) return;
    getGroups(courseId).then(setGroups);
    getScenarios(courseId).then(setScenarios);
  }, [courseId]);

  const handleCreate = async () => {
    if (!courseId || !groupId || !scenarioId || !profile) return;
    setCreating(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, groupId, scenarioId, mode, sessionType, instructorId: profile.uid }),
      });
      const data = await res.json();
      setCreated(data);
    } catch {
      alert("Lỗi khi tạo session.");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToMonitor = () => {
    if (!created) return;
    router.push(
      mode === "prompter"
        ? `/instructor/sessions/${created.sessionId}/prompter`
        : `/instructor/sessions/${created.sessionId}/monitor`
    );
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Tạo session mới</h1>

      {!created ? (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Môn học</Label>
            <select
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setGroupId(""); setScenarioId(""); }}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
            >
              <option value="">-- Chọn môn học --</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Nhóm</Label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={!courseId}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
            >
              <option value="">-- Chọn nhóm --</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} – {g.projectTitle}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Scenario</Label>
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              disabled={!courseId}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
            >
              <option value="">-- Chọn scenario --</option>
              {scenarios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Chế độ</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={mode === "autonomous"} onChange={() => setMode("autonomous")} />
                  <div>
                    <p className="text-sm font-medium">Autonomous</p>
                    <p className="text-xs text-gray-500">AI đóng vai client hoàn toàn</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={mode === "prompter"} onChange={() => setMode("prompter")} />
                  <div>
                    <p className="text-sm font-medium">Prompter</p>
                    <p className="text-xs text-gray-500">Instructor kiểm soát AI gợi ý</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Loại session</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={sessionType === "official"} onChange={() => setSessionType("official")} />
                  <div>
                    <p className="text-sm font-medium">Official</p>
                    <p className="text-xs text-gray-500">Đánh giá chính thức</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={sessionType === "practice"} onChange={() => setSessionType("practice")} />
                  <div>
                    <p className="text-sm font-medium">Practice</p>
                    <p className="text-xs text-gray-500">Luyện tập, chạy nhiều lần</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating || !courseId || !groupId || !scenarioId}
            className="w-full"
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Tạo session
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-green-600 text-5xl mb-2">✓</div>
            <h2 className="text-xl font-bold">Session đã được tạo!</h2>
            <p className="text-gray-500 text-sm">Chia sẻ mã code này cho nhóm sinh viên</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-bold tracking-widest text-blue-600">
                {created.sessionCode}
              </span>
              <button onClick={copyCode} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={goToMonitor}>
                {mode === "prompter" ? "Vào Prompter" : "Monitor session"}
              </Button>
              <Button variant="outline" onClick={() => setCreated(null)}>Tạo session khác</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
