"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/firestore";
import { Session, DebriefData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

export default function DebriefPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [debrief, setDebrief] = useState<DebriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getSession(sessionId).then(setSession).finally(() => setLoading(false));
  }, [sessionId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/debrief`);
      const data = await res.json();
      setDebrief(data);
    } finally {
      setGenerating(false);
    }
  };

  const exportWord = async () => {
    if (!session || !debrief) return;
    const { Document, Packer, Paragraph, HeadingLevel } = await import("docx");

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "BIÊN BẢN ROLEPLAY", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Nhóm: ${session.groupSnapshot.name}` }),
          new Paragraph({ text: `Scenario: ${session.scenarioSnapshot.name}` }),
          new Paragraph({ text: `Client: ${session.groupSnapshot.clientPersona.name}` }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "NHẬN XÉT THEO TIÊU CHÍ", heading: HeadingLevel.HEADING_2 }),
          ...debrief.rubricFeedback.flatMap((rf) => [
            new Paragraph({ text: rf.criterion, heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ text: rf.feedback }),
            new Paragraph({ text: `Gợi ý: ${rf.suggestion}` }),
          ]),
          new Paragraph({ text: "ĐIỂM MẠNH", heading: HeadingLevel.HEADING_2 }),
          ...debrief.strengths.map((s) => new Paragraph({ text: `• ${s}` })),
          new Paragraph({ text: "ĐIỂM CẦN CẢI THIỆN", heading: HeadingLevel.HEADING_2 }),
          ...debrief.improvements.map((s) => new Paragraph({ text: `• ${s}` })),
          new Paragraph({ text: "ACTION ITEMS", heading: HeadingLevel.HEADING_2 }),
          ...debrief.actionItems.map((s) => new Paragraph({ text: `• ${s}` })),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debrief-${session.groupSnapshot.name}-${session.scenarioSnapshot.name}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  if (!session) return <div className="p-8">Không tìm thấy session.</div>;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{session.scenarioSnapshot.name}</h1>
            <Badge variant="info">Official</Badge>
          </div>
          <p className="text-gray-500">
            {session.groupSnapshot.name} · {session.groupSnapshot.clientPersona.name} · {session.mode}
          </p>
        </div>
        {debrief && (
          <Button variant="outline" onClick={exportWord}>
            <Download className="h-4 w-4 mr-2" /> Xuất Word
          </Button>
        )}
      </div>

      {!debrief ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-4">Nhấn để sinh nhận xét tự động theo rubric</p>
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {generating ? "Đang phân tích..." : "Sinh debrief"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rubric Feedback */}
          <Card>
            <CardHeader><CardTitle>Nhận xét theo tiêu chí</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {debrief.rubricFeedback.map((rf, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium mb-2">{rf.criterion}</h3>
                  <p className="text-sm text-gray-700 mb-2">{rf.feedback}</p>
                  <p className="text-sm text-blue-600 italic">{rf.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" /> Điểm mạnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {debrief.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" /> Điểm cần cải thiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {debrief.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-5 w-5" /> Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {debrief.actionItems.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-semibold text-blue-600">{i + 1}.</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
