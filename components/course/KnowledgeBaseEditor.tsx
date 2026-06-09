"use client";
import { KnowledgeBase } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface KnowledgeBaseEditorProps {
  value: KnowledgeBase;
  onChange: (kb: KnowledgeBase) => void;
}

const levels = [
  {
    key: "open" as const,
    label: "🟢 Open",
    desc: "AI chủ động đề cập khi phù hợp",
    placeholder: "Mỗi dòng = 1 thông tin\nVD: Ngân sách hàng năm ~33 tỷ đồng",
  },
  {
    key: "contextual" as const,
    label: "🟡 Contextual",
    desc: "Tiết lộ nếu conversation đúng hướng",
    placeholder: "Mỗi dòng = 1 thông tin\nVD: Hệ thống lõi iLib 4.0 đã lạc hậu",
  },
  {
    key: "confirmOnly" as const,
    label: "🔵 Confirm Only",
    desc: "Chỉ xác nhận nếu sinh viên đề cập trước",
    placeholder: "Mỗi dòng = 1 thông tin\nVD: Dự án >5 tỷ phải qua đấu thầu",
  },
  {
    key: "confidential" as const,
    label: "🔴 Confidential",
    desc: "Không bao giờ tiết lộ",
    placeholder: "Mỗi dòng = 1 thông tin\nVD: Đang có đối thủ cạnh tranh tiếp cận",
  },
];

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function joinLines(arr: string[]): string {
  return arr.join("\n");
}

export function KnowledgeBaseEditor({ value, onChange }: KnowledgeBaseEditorProps) {
  const handleChange = (key: keyof KnowledgeBase, text: string) => {
    onChange({ ...value, [key]: parseLines(text) });
  };

  return (
    <div className="space-y-4">
      {levels.map(({ key, label, desc, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <Label className="font-semibold">{label}</Label>
          <p className="text-xs text-gray-500">{desc}</p>
          <Textarea
            value={joinLines(value[key])}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}
