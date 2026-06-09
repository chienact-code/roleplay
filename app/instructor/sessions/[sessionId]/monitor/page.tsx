"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { getDbInstance } from "@/lib/firebase";
import { getSession } from "@/lib/firestore";
import { Session, Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

export default function MonitorPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(getDbInstance(), "sessions", sessionId, "messages"), orderBy("timestamp", "asc")),
      (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)))
    );
    return unsub;
  }, [sessionId]);

  // Refresh session on message change to capture stage updates
  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [messages.length, sessionId]);

  const nextStage = async () => {
    if (!session) return;
    const next = session.currentStageIndex + 1;
    await fetch(`/api/sessions/${sessionId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageIndex: next }),
    });
    setSession((prev) => prev ? { ...prev, currentStageIndex: next } : prev);
  };

  const endSession = async () => {
    setEnding(true);
    await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
    router.push(`/instructor/sessions/${sessionId}/debrief`);
  };

  if (!session) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;

  const stages = session.scenarioSnapshot.stages;
  const currentStage = stages[session.currentStageIndex];
  const isLastStage = session.currentStageIndex >= stages.length - 1;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Monitor: {session.scenarioSnapshot.name}</p>
          <p className="text-xs text-gray-400">Code: {session.sessionCode} · {session.groupSnapshot.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={session.status === "active" ? "success" : "default"}>
            {session.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={nextStage}
            disabled={isLastStage}
          >
            Stage tiếp theo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={endSession}
            disabled={ending}
          >
            {ending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
            Kết thúc
          </Button>
        </div>
      </div>

      {/* Stage indicator */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-2">
        <div className="flex items-center gap-2">
          {stages.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                i === session.currentStageIndex
                  ? "bg-blue-600 text-white"
                  : i < session.currentStageIndex
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {s.name}
              </div>
              {i < stages.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300" />}
            </div>
          ))}
        </div>
        {currentStage && (
          <p className="text-xs text-blue-700 mt-1">Mục tiêu: {currentStage.goal}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm">Đang chờ nhóm sinh viên tham gia...</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>
    </div>
  );
}
