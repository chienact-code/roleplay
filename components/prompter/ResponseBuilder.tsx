"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ResponseBuilderProps {
  sessionId: string;
  currentStageIndex: number;
  totalStages: number;
  onDeliver: (selectedPoints: string[], studentInput: string) => void;
  onNextStage: () => void;
  onEndSession: () => void;
}

export function ResponseBuilder({
  sessionId,
  currentStageIndex,
  totalStages,
  onDeliver,
  onNextStage,
  onEndSession,
}: ResponseBuilderProps) {
  const [studentInput, setStudentInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!studentInput.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set());
    setError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Lỗi ${res.status}`);
        return;
      }
      const suggestions = data.suggestions ?? [];
      if (suggestions.length === 0) setError("AI không trả về gợi ý. Thử lại.");
      setSuggestions(suggestions);
    } catch (e) {
      setError("Không kết nối được API.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const handleDeliver = () => {
    const pts = suggestions.filter((_, i) => selected.has(i));
    if (pts.length === 0) return;
    onDeliver(pts, studentInput);
    setStudentInput("");
    setSuggestions([]);
    setSelected(new Set());
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Tóm tắt ý sinh viên
        </label>
        <textarea
          value={studentInput}
          onChange={(e) => setStudentInput(e.target.value)}
          placeholder="Gõ tóm tắt ý kiến nhóm sinh viên vừa nói..."
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleAnalyze}
          disabled={loading || !studentInput.trim()}
          size="sm"
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Phân tích
        </Button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2 flex-1 overflow-y-auto">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Gợi ý phản hồi
          </label>
          {suggestions.map((sug, i) => {
            const isChecked = selected.has(i);
            const match = sug.match(/^\[([^\]]+)\]\s*(.*)/);
            const label = match?.[1] ?? "";
            const desc = match?.[2] ?? sug;
            return (
              <label
                key={i}
                className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  isChecked ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(i)}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  {label && (
                    <span className="text-xs font-semibold text-blue-700 mr-1">[{label}]</span>
                  )}
                  <span className="text-sm text-gray-800">{desc}</span>
                </div>
              </label>
            );
          })}
        </div>
      )}

      <div className="space-y-2 border-t pt-3">
        <Button
          onClick={handleDeliver}
          disabled={selected.size === 0}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          DELIVER ({selected.size} điểm)
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onNextStage}
            disabled={currentStageIndex >= totalStages - 1}
          >
            Stage tiếp theo →
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={onEndSession}>
            Kết thúc
          </Button>
        </div>
      </div>
    </div>
  );
}
