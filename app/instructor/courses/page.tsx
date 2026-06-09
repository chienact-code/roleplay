"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen } from "lucide-react";

export default function CoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    getCourses(profile.uid)
      .then(setCourses)
      .finally(() => setLoading(false));
  }, [profile]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Môn học</h1>
        <Link href="/instructor/courses/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Tạo môn học</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có môn học nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {courses.map((course) => (
            <Link key={course.id} href={`/instructor/courses/${course.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <Badge variant={course.status === "active" ? "success" : "default"}>
                      {course.status === "active" ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <CardDescription>{course.semester} {course.academicYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
