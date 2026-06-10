"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading, signIn, signUp, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"instructor" | "student">("instructor");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile?.role === "instructor") {
      router.replace("/instructor");
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name, role);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user && profile?.role === "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">VJCC Roleplay</h1>
            <p className="text-sm text-gray-500 mb-6">Đang đăng nhập với <span className="font-medium text-gray-700">{user.email}</span></p>
            <Button className="w-full mb-3" onClick={() => router.push("/join")}>
              Tham gia session
            </Button>
            <button
              type="button"
              onClick={async () => { await logout(); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất tài khoản này
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">VJCC Roleplay</h1>
            <p className="text-sm text-gray-500 mt-1">Nền tảng PBL – Viện VJCC</p>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === "login" ? "bg-white text-gray-900 shadow" : "text-gray-500"
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === "register" ? "bg-white text-gray-900 shadow" : "text-gray-500"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Họ tên</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Vai trò</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={role === "instructor"} onChange={() => setRole("instructor")} />
                      <span className="text-sm">Giảng viên</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={role === "student"} onChange={() => setRole("student")} />
                      <span className="text-sm">Sinh viên</span>
                    </label>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@ftu.edu.vn" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
