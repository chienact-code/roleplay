"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { getDbInstance } from "@/lib/firebase";
import { getSessionByCode } from "@/lib/firestore";
import { Session, Message } from "@/lib/types";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";

export default function StudentSessionPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [runId, setRunId] = useState<string | null>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    const upper = code.toUpperCase().replace("-", "");
    getSessionByCode(upper).then((s) => {
      setSession(s);
      if (s) {
        sessionIdRef.current = s.id;
        // For practice sessions, create a new run
        if (s.sessionType === "practice") {
          fetch(`/api/sessions/${s.id}/runs`, { method: "POST" })
            .then((r) => r.json())
            .then((d) => setRunId(d.runId));
        }
      }
      setLoading(false);
    });
  }, [code]);

  useEffect(() => {
    if (!sessionIdRef.current) return;
    const unsub = onSnapshot(
      query(collection(getDbInstance(), "sessions", sessionIdRef.current, "messages"), orderBy("timestamp", "asc")),
      (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
    );
    return unsub;
  }, [session?.id]);

  const handleSend = async (content: string) => {
    if (!session || streaming) return;
    setStreaming(true);
    setStreamContent("");

    try {
      const res = await fetch(`/api/sessions/${session.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, runId }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line === "data: [DONE]") {
            setStreamContent("");
            break;
          }
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              setStreamContent((prev) => prev + (parsed.text ?? ""));
            } catch {}
          }
        }
      }
    } finally {
      setStreaming(false);
      setStreamContent("");
    }
  };

  const handleEndPractice = async () => {
    if (!session || !runId) return;
    await fetch(`/api/sessions/${session.id}/complete`, { method: "POST" });
    router.push(`/session/${code}/debrief?runId=${runId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-xl font-semibold">Không tìm thấy session</p>
          <Button className="mt-4" onClick={() => router.push("/join")}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const stages = session.scenarioSnapshot.stages;
  const currentStage = stages[session.currentStageIndex];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
        <div>
          <p className="font-semibold text-sm">{session.scenarioSnapshot.name}</p>
          <p className="text-xs text-gray-500">{session.groupSnapshot.name} · {session.groupSnapshot.clientPersona.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={session.sessionType === "official" ? "info" : "warning"}>
            {session.sessionType}
          </Badge>
          {session.sessionType === "practice" && runId && (
            <Button variant="outline" size="sm" onClick={handleEndPractice}>
              Kết thúc & Xem debrief
            </Button>
          )}
        </div>
      </div>

      {/* Stage indicator */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          {stages.map((s, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                i === session.currentStageIndex ? "bg-blue-600 text-white font-medium" :
                i < session.currentStageIndex ? "bg-green-100 text-green-700" :
                "text-gray-400"
              }`}>
                {s.name}
              </span>
              {i < stages.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300" />}
            </div>
          ))}
        </div>
        {currentStage && (
          <p className="text-xs text-gray-400 mt-1">{currentStage.goal}</p>
        )}
      </div>

      {/* Chat */}
      <ChatWindow messages={messages} streamingContent={streamContent} />
      <ChatInput onSend={handleSend} disabled={streaming || session.status === "completed"} />
    </div>
  );
}
