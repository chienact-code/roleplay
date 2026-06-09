"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createCourse } from "@/lib/firestore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    academicYear: "2025-2026",
    semester: "Spring",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const courseId = await createCourse({
        ...form,
        instructorId: profile.uid,
        status: "active",
      });
      router.push(`/instructor/courses/${courseId}`);
    } catch {
      alert("Lỗi khi tạo môn học.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Tạo môn học mới</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Tên môn học *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: DBIZ1 – Spring 2026"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Năm học</Label>
            <Input
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              placeholder="VD: 2025-2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Học kỳ</Label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
            >
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Mô tả môn học</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Giới thiệu môn học cho sinh viên..."
            rows={4}
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Tạo môn học
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}
