import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isStudent = message.role === "student";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 mb-4", isStudent ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          isStudent ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
        )}
      >
        {isStudent ? "N" : "C"}
      </div>
      <div className={cn("flex flex-col gap-1", isStudent ? "items-end" : "items-start")}>
        <span className="text-xs text-gray-500">{isStudent ? "Nhóm" : "Client"}</span>
        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
            isStudent
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-900 rounded-tl-sm"
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        {message.selectedPoints && message.selectedPoints.length > 0 && (
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {message.selectedPoints.map((pt, i) => (
              <span key={i} className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5">
                {pt}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
