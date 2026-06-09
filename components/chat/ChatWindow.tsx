"use client";
import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  streamingContent?: string;
}

export function ChatWindow({ messages, streamingContent }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.length === 0 && !streamingContent && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p className="text-sm">Cuộc trò chuyện sẽ bắt đầu khi bạn gửi tin nhắn đầu tiên.</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {streamingContent && (
        <div className="flex gap-3 mb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white text-sm font-semibold">
            C
          </div>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs text-gray-500">Client</span>
            <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-900">
              <p className="whitespace-pre-wrap leading-relaxed">{streamingContent}</p>
              <span className="inline-block w-1 h-4 bg-gray-500 animate-pulse ml-1" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
