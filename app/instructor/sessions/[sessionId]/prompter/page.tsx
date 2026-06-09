"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { getDbInstance } from "@/lib/firebase";
import { getSession } from "@/lib/firestore";
import { Session, Message } from "@/lib/types";
import { ConversationLog } from "@/components/prompter/ConversationLog";
import { ResponseBuilder } from "@/components/prompter/ResponseBuilder";
import { RefinementChat } from "@/components/prompter/RefinementChat";
import { Loader2 } from "lucide-react";

export default function PrompterPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

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

  const handleDeliver = async (points: string[], studentInput: string) => {
    await fetch(`/api/sessions/${sessionId}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedPoints: points, studentInput, initialSuggestions: points }),
    });
    setSelectedPoints([]);
  };

  const handleNextStage = async () => {
    if (!session) return;
    const next = session.currentStageIndex + 1;
    await fetch(`/api/sessions/${sessionId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageIndex: next }),
    });
    setSession((prev) => prev ? { ...prev, currentStageIndex: next } : prev);
  };

  const handleEndSession = async () => {
    await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
    router.push(`/instructor/sessions/${sessionId}/debrief`);
  };

  if (!session) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 shrink-0">
        <p className="text-sm font-semibold">{session.scenarioSnapshot.name}</p>
        <p className="text-xs text-gray-500">
          Prompter · {session.groupSnapshot.name} · {session.groupSnapshot.clientPersona.name}
        </p>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Conversation Log (30%) */}
        <div className="w-[30%] border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Conversation Log
            </p>
          </div>
          <ConversationLog messages={messages} />
        </div>

        {/* Center: Response Builder (40%) */}
        <div className="w-[40%] border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Response Builder
            </p>
          </div>
          <ResponseBuilder
            sessionId={sessionId}
            currentStageIndex={session.currentStageIndex}
            totalStages={session.scenarioSnapshot.stages.length}
            onDeliver={handleDeliver}
            onNextStage={handleNextStage}
            onEndSession={handleEndSession}
          />
        </div>

        {/* Right: Refinement Chat (30%) */}
        <div className="w-[30%] flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-purple-50">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
              AI Coach
            </p>
          </div>
          <RefinementChat
            sessionId={sessionId}
            currentSuggestions={[]}
            selectedPoints={selectedPoints}
          />
        </div>
      </div>
    </div>
  );
}
