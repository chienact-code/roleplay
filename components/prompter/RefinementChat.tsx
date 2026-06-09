"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";

interface ChatMessage {
  role: "instructor" | "ai";
  content: string;
}

interface RefinementChatProps {
  sessionId: string;
  currentSuggestions: string[];
  selectedPoints: string[];
}

export function RefinementChat({ sessionId, currentSuggestions, selectedPoints }: RefinementChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "instructor", content: text }]);
    setStreaming(true);

    let aiContent = "";
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, currentSuggestions, selectedPoints }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6));
              aiContent += parsed.text ?? "";
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "ai", content: aiContent },
              ]);
            } catch {}
          }
        }
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-purple-50">
        <Bot className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-800">AI Coach</span>
        <span className="text-xs text-purple-500">(không hiển thị với sinh viên)</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Hỏi AI Coach để tinh chỉnh gợi ý hoặc nhận giải thích sư phạm.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "instructor" ? "flex-row-reverse" : ""}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === "instructor" ? "bg-blue-600 text-white" : "bg-purple-50 text-gray-800 border border-purple-200"
            }`}>
              {msg.content || <span className="animate-pulse">...</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3 border-t border-gray-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Hỏi AI Coach..."
          disabled={streaming}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Button onClick={handleSend} disabled={streaming || !input.trim()} size="icon" className="bg-purple-600 hover:bg-purple-700">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
