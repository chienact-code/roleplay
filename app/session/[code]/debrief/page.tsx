"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSessionByCode } from "@/lib/firestore";
import { Session, CoachingDebriefData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

export default function PracticeDebriefPage() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const runId = searchParams.get("runId");

  const [session, setSession] = useState<Session | null>(null);
  const [debrief, setDebrief] = useState<CoachingDebriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const upper = code.toUpperCase().replace("-", "");
    getSessionByCode(upper).then(setSession).finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (!session || !runId) return;
    setGenerating(true);
    fetch(`/api/sessions/${session.id}/coaching-debrief?runId=${runId}`)
      .then((r) => r.json())
      .then(setDebrief)
      .finally(() => setGenerating(false));
  }, [session, runId]);

  const practiceAgain = async () => {
    if (!session) return;
    const res = await fetch(`/api/sessions/${session.id}/runs`, { method: "POST" });
    const { runId: newRunId } = await res.json();
    router.push(`/session/${code}?runId=${newRunId}`);
  };

  if (loading || generating) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">{generating ? "AI đang phân tích buổi luyện..." : "Đang tải..."}</p>
      </div>
    );
  }

  if (!session) return <div className="p-8">Không tìm thấy session.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Coaching Debrief</h1>
              <Badge variant="warning">Practice</Badge>
            </div>
            <p className="text-gray-500 text-sm">
              {session.groupSnapshot.name} · {session.scenarioSnapshot.name}
            </p>
          </div>
          <Button onClick={practiceAgain} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Luyện lại
          </Button>
        </div>

        {debrief ? (
          <div className="space-y-4">
            {/* Unlocked Info */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-green-800">
                  ✅ Thông tin bạn đã khai thác được ({debrief.unlockedInfo.length})
                </CardTitle>
              </CardHeader>
              {debrief.unlockedInfo.length > 0 ? (
                <CardContent>
                  <ul className="space-y-1.5">
                    {debrief.unlockedInfo.map((info, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 shrink-0">•</span> {info}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-sm text-gray-400">Chưa khai thác được thông tin nào rõ ràng.</p>
                </CardContent>
              )}
            </Card>

            {/* Missed Contextual */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-orange-800">
                  🔍 Thông tin có sẵn nhưng bạn chưa hỏi tới ({debrief.missedContextual.length + debrief.missedConfirmOnly.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {debrief.missedContextual.map((info, i) => (
                  <div key={`c-${i}`} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                    <span>{info} <span className="text-xs text-gray-400">(cần đặt câu hỏi đúng hướng)</span></span>
                  </div>
                ))}
                {debrief.missedConfirmOnly.map((info, i) => (
                  <div key={`co-${i}`} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                    <span>{info} <span className="text-xs text-gray-400">(cần đề cập trước)</span></span>
                  </div>
                ))}
                {debrief.missedContextual.length === 0 && debrief.missedConfirmOnly.length === 0 && (
                  <p className="text-sm text-gray-400">Bạn đã khai thác rất tốt!</p>
                )}
              </CardContent>
            </Card>

            {/* Suggested Questions */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-800">
                  💡 Câu hỏi client muốn được hỏi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debrief.suggestedQuestions.map((q, i) => (
                  <div key={i} className="text-sm text-gray-700 italic mb-2 last:mb-0 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 shrink-0">→</span> &quot;{q}&quot;
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Confidential note */}
            <Card className="border-red-100 bg-red-50">
              <CardContent className="py-3">
                <p className="text-sm text-red-600">
                  🔒 Thông tin confidential: Ẩn — sẽ không được tiết lộ cho đến khi kết thúc môn học
                </p>
              </CardContent>
            </Card>

            {/* Progress comparison */}
            {debrief.improvement && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-purple-800">
                    📈 So sánh với lần trước
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {debrief.improvement.newlyUnlocked.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Mới khai thác được:</p>
                      {debrief.improvement.newlyUnlocked.map((info, i) => (
                        <p key={i} className="text-sm text-gray-700">✓ {info}</p>
                      ))}
                    </div>
                  )}
                  {debrief.improvement.stillMissing.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-orange-700 mb-1">Vẫn chưa hỏi tới:</p>
                      {debrief.improvement.stillMissing.map((info, i) => (
                        <p key={i} className="text-sm text-gray-700">• {info}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>Không thể tải debrief.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button onClick={practiceAgain} className="mr-3">
            <RefreshCw className="h-4 w-4 mr-2" /> Luyện lại ngay
          </Button>
          <Button variant="outline" onClick={() => router.push("/join")}>
            Thoát
          </Button>
        </div>
      </div>
    </div>
  );
}
