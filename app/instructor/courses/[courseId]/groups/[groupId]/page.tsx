"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGroup, getSessionsByGroup } from "@/lib/firestore";
import { Group, Session } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit, Loader2 } from "lucide-react";

export default function GroupDetailPage() {
  const { courseId, groupId } = useParams<{ courseId: string; groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getGroup(courseId, groupId),
      getSessionsByGroup(courseId, groupId),
    ]).then(([g, s]) => {
      setGroup(g);
      setSessions(s);
    }).finally(() => setLoading(false));
  }, [courseId, groupId]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  }
  if (!group) return <div className="p-8 text-gray-500">Không tìm thấy nhóm.</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href={`/instructor/courses/${courseId}`} className="hover:text-gray-900">Course</Link>
        <span>/</span>
        <span className="text-gray-900">{group.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-gray-500">{group.projectTitle}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/instructor/courses/${courseId}/groups/${groupId}/edit`}>
            <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" /> Chỉnh sửa</Button>
          </Link>
          <Link href={`/instructor/sessions/new?courseId=${courseId}&groupId=${groupId}`}>
            <Button size="sm"><Play className="h-4 w-4 mr-1" /> Tạo session</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Client Persona */}
        <Card>
          <CardHeader><CardTitle className="text-base">Client Persona</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="font-medium">Tên:</span> {group.clientPersona.name}</div>
            <div><span className="font-medium">Vai trò:</span> {group.clientPersona.role}</div>
            <div><span className="font-medium">Tính cách:</span> {group.clientPersona.personality}</div>
            <div><span className="font-medium">Giao tiếp:</span> {group.clientPersona.communicationStyle}</div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thành viên ({group.members.length})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {group.members.map((m, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <span>{m.name}</span>
                  {m.email && <span className="text-gray-400">{m.email}</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Project Brief */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base">Tóm tắt dự án</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{group.projectBrief}</p>
        </CardContent>
      </Card>

      {/* Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Lịch sử sessions ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có session nào.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                <div>
                  <p className="font-medium text-sm">{session.scenarioSnapshot.name}</p>
                  <p className="text-xs text-gray-500">
                    {session.sessionType === "official" ? "Official" : "Practice"} · {session.mode} · Code: {session.sessionCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.status === "completed" ? "success" : session.status === "active" ? "info" : "default"}>
                    {session.status}
                  </Badge>
                  {session.status === "completed" && (
                    <Link href={`/instructor/sessions/${session.id}/debrief`}>
                      <Button variant="outline" size="sm">Debrief</Button>
                    </Link>
                  )}
                  {session.status !== "completed" && (
                    <Link href={`/instructor/sessions/${session.id}/monitor`}>
                      <Button variant="outline" size="sm">Monitor</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
