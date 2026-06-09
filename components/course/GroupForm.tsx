"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Member, ClientPersona, KnowledgeBase } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KnowledgeBaseEditor } from "./KnowledgeBaseEditor";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface GroupFormProps {
  courseId: string;
  initial?: Partial<Group>;
  groupId?: string;
}

const defaultKB: KnowledgeBase = { open: [], contextual: [], confirmOnly: [], confidential: [] };
const defaultPersona: ClientPersona = { name: "", role: "", personality: "", communicationStyle: "" };

export function GroupForm({ courseId, initial, groupId }: GroupFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [projectTitle, setProjectTitle] = useState(initial?.projectTitle ?? "");
  const [projectBrief, setProjectBrief] = useState(initial?.projectBrief ?? "");
  const [members, setMembers] = useState<Member[]>(initial?.members ?? [{ name: "", email: "" }]);
  const [persona, setPersona] = useState<ClientPersona>(initial?.clientPersona ?? defaultPersona);
  const [kb, setKb] = useState<KnowledgeBase>(initial?.knowledgeBase ?? defaultKB);

  const addMember = () => setMembers((prev) => [...prev, { name: "", email: "" }]);
  const removeMember = (i: number) => setMembers((prev) => prev.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: keyof Member, value: string) => {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        projectTitle,
        projectBrief,
        members: members.filter((m) => m.name.trim()),
        clientPersona: persona,
        knowledgeBase: kb,
      };

      const url = groupId
        ? `/api/courses/${courseId}/groups/${groupId}`
        : `/api/courses/${courseId}/groups`;
      const method = groupId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save group");
      router.push(`/instructor/courses/${courseId}`);
      router.refresh();
    } catch {
      alert("Lỗi khi lưu nhóm. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">1. Thông tin nhóm</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Tên nhóm *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Group B" required />
        </div>
        <div className="space-y-1.5">
          <Label>Thành viên</Label>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={m.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  placeholder="Họ tên"
                  className="flex-1"
                />
                <Input
                  value={m.email ?? ""}
                  onChange={(e) => updateMember(i, "email", e.target.value)}
                  placeholder="Email (tùy chọn)"
                  type="email"
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addMember}>
            <Plus className="h-4 w-4 mr-1" /> Thêm thành viên
          </Button>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="projectTitle">Tên client / tổ chức *</Label>
          <Input id="projectTitle" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="VD: Thư viện Quốc gia Việt Nam" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="projectBrief">Tóm tắt dự án *</Label>
          <Textarea id="projectBrief" value={projectBrief} onChange={(e) => setProjectBrief(e.target.value)} placeholder="Paste từ bài Customer Profiling của nhóm..." rows={5} required />
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">2. Client Persona</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tên người đại diện *</Label>
            <Input value={persona.name} onChange={(e) => setPersona({ ...persona, name: e.target.value })} placeholder="VD: Nguyễn Xuân Dũng" required />
          </div>
          <div className="space-y-1.5">
            <Label>Chức danh *</Label>
            <Input value={persona.role} onChange={(e) => setPersona({ ...persona, role: e.target.value })} placeholder="VD: Giám đốc Thư viện Quốc gia VN" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Tính cách</Label>
          <Textarea value={persona.personality} onChange={(e) => setPersona({ ...persona, personality: e.target.value })} placeholder="VD: Thực dụng, thận trọng với ngân sách công..." rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label>Phong cách giao tiếp</Label>
          <Textarea value={persona.communicationStyle} onChange={(e) => setPersona({ ...persona, communicationStyle: e.target.value })} placeholder="VD: Hỏi thẳng, đặt câu hỏi ngược lại..." rows={2} />
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">3. Knowledge Base</h2>
        <KnowledgeBaseEditor value={kb} onChange={setKb} />
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {groupId ? "Cập nhật nhóm" : "Tạo nhóm"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </form>
  );
}
