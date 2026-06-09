"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourse, getGroups, getScenarios } from "@/lib/firestore";
import { Course, Group, Scenario } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText, Play, Loader2 } from "lucide-react";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCourse(courseId),
      getGroups(courseId),
      getScenarios(courseId),
    ]).then(([c, g, s]) => {
      setCourse(c);
      setGroups(g);
      setScenarios(s);
    }).finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) return <div className="p-8 text-gray-500">Không tìm thấy môn học.</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/instructor/courses" className="hover:text-gray-900">Môn học</Link>
          <span>/</span>
          <span className="text-gray-900">{course.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-gray-500 mt-1">{course.semester} {course.academicYear}</p>
          </div>
          <Badge variant={course.status === "active" ? "success" : "default"}>
            {course.status === "active" ? "Active" : "Archived"}
          </Badge>
        </div>
        {course.description && (
          <p className="mt-3 text-sm text-gray-600">{course.description}</p>
        )}
      </div>

      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-1.5" /> Nhóm ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <FileText className="h-4 w-4 mr-1.5" /> Scenarios ({scenarios.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Nhóm */}
        <TabsContent value="groups" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Danh sách nhóm</h2>
            <Link href={`/instructor/courses/${courseId}/groups/new`}>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm nhóm</Button>
            </Link>
          </div>
          {groups.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Chưa có nhóm nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {groups.map((group) => (
                <Link key={group.id} href={`/instructor/courses/${courseId}/groups/${group.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <p className="text-sm text-gray-500">{group.projectTitle}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {group.members.length} thành viên · {group.clientPersona.name}
                        </p>
                        <Link href={`/instructor/sessions/new?courseId=${courseId}&groupId=${group.id}`}>
                          <Button size="sm" variant="outline" onClick={(e) => e.preventDefault()}>
                            <Play className="h-3 w-3 mr-1" /> Tạo session
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Scenarios */}
        <TabsContent value="scenarios" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Danh sách scenarios</h2>
            <Link href={`/instructor/courses/${courseId}/scenarios/new`}>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm scenario</Button>
            </Link>
          </div>
          {scenarios.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Chưa có scenario nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-medium">{scenario.name}</p>
                    <p className="text-sm text-gray-500">{scenario.stages.length} stages · {scenario.assessmentRubric.length} tiêu chí đánh giá</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scenario.status === "published" ? "success" : "warning"}>
                      {scenario.status}
                    </Badge>
                    <Link href={`/instructor/courses/${courseId}/scenarios/${scenario.id}`}>
                      <Button variant="outline" size="sm">Chỉnh sửa</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
