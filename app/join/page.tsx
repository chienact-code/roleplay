"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionByCode } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastSessionCode");
    if (saved) setLastCode(saved);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase().replace("-", "");
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const session = await getSessionByCode(trimmed);
      if (!session) {
        setError("Không tìm thấy session với mã này. Vui lòng kiểm tra lại.");
        return;
      }
      if (session.status === "completed") {
        setError("Session này đã kết thúc.");
        return;
      }
      router.push(`/session/${trimmed}`);
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tham gia Session</h1>
            <p className="text-sm text-gray-500 mt-1">Nhập mã session do giảng viên cung cấp</p>
          </div>

          {lastCode && (
            <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 font-medium">Session gần đây</p>
                <p className="font-mono font-bold text-blue-800 tracking-widest">{lastCode}</p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => router.push(`/session/${lastCode}`)}
              >
                Tiếp tục
              </Button>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Session Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: NLV2A7"
                className="text-center text-2xl font-mono tracking-widest h-14"
                maxLength={7}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading || !code.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Vào session
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
