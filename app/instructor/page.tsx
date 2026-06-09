"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, ArrowRight } from "lucide-react";

export default function InstructorDashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    getCourses(profile.uid)
      .then(setCourses)
      .finally(() => setLoading(false));
  }, [profile]);

  const active = courses.filter((c) => c.status === "active");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xin chào, {profile?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Tổng quan các môn học đang quản lý</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Tạo môn học
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Tổng môn học</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Đang hoạt động</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{active.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Đã lưu trữ</p>
            <p className="text-3xl font-bold text-gray-400 mt-1">{courses.length - active.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Courses */}
      <h2 className="text-lg font-semibold mb-4">Môn học đang hoạt động</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có môn học nào.</p>
          <Link href="/instructor/courses/new" className="mt-3 inline-block">
            <Button variant="outline" size="sm">Tạo môn học đầu tiên</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {active.map((course) => (
            <Link key={course.id} href={`/instructor/courses/${course.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <CardDescription>
                    {course.semester} {course.academicYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-end mt-3">
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      Xem chi tiết <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
