"use client";
import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConversationLogProps {
  messages: Message[];
}

export function ConversationLog({ messages }: ConversationLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-8">Chưa có tin nhắn nào.</p>
      )}
      {messages.map((msg) => {
        if (msg.role === "system") return null;
        const isStudent = msg.role === "student";
        return (
          <div key={msg.id} className="space-y-1">
            <p className={cn("text-xs font-medium", isStudent ? "text-blue-600" : "text-gray-500")}>
              {isStudent ? "[Nhóm]" : "[Client]"}
            </p>
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                isStudent ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-900"
              )}
            >
              {msg.selectedPoints ? (
                <ul className="space-y-1">
                  {msg.selectedPoints.map((pt, i) => (
                    <li key={i} className="text-xs">{pt}</li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
