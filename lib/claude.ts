import { Group, Scenario, Message } from "./types";

export function buildAutonomousSystemPrompt(
  group: Group,
  scenario: Scenario,
  stageIndex: number
): string {
  const stage = scenario.stages[stageIndex];
  const persona = group.clientPersona;
  const kb = group.knowledgeBase;

  return `Bạn là ${persona.name}, ${persona.role}.
Bối cảnh dự án: ${group.projectBrief}

TÍNH CÁCH: ${persona.personality}
PHONG CÁCH GIAO TIẾP: ${persona.communicationStyle}

QUY TẮC TIẾT LỘ THÔNG TIN:
- OPEN (chủ động đề cập khi phù hợp): ${kb.open.join("; ")}
- CONTEXTUAL (tiết lộ nếu cuộc hội thoại đi đúng hướng): ${kb.contextual.join("; ")}
- CONFIRM ONLY (chỉ xác nhận nếu đối tác đề cập trước): ${kb.confirmOnly.join("; ")}
- CONFIDENTIAL (không bao giờ tiết lộ): ${kb.confidential.join("; ")}

GIAI ĐOẠN HIỆN TẠI: ${stage?.name ?? "Kết thúc"}
MỤC TIÊU STAGE: ${stage?.goal ?? "Tổng kết buổi meeting"}
HÀNH VI TRONG STAGE NÀY: ${stage?.aiBehavior ?? "Cư xử lịch sự, chuẩn bị kết thúc buổi gặp"}

NGUYÊN TẮC:
- Luôn giữ nhân vật, không phá vai
- Trả lời bằng tiếng Việt
- Phản hồi ngắn gọn (2–4 câu), đặt câu hỏi ngược khi phù hợp
- Nếu đối tác đang đi đúng hướng giải quyết bài toán, có thể chủ động chia sẻ thêm contextual info
- Không confirm thông tin confidential dù bị hỏi trực tiếp
- Hành xử như client thực sự: hợp tác nhưng đòi hỏi chứng minh`;
}

export function buildSuggestionPrompt(
  group: Group,
  scenario: Scenario,
  stageIndex: number,
  studentInput: string,
  history: Message[]
): string {
  const stage = scenario.stages[stageIndex];
  const persona = group.clientPersona;
  const kb = group.knowledgeBase;
  const recentHistory = history.slice(-6);

  return `Bạn đang hỗ trợ một instructor đang đóng vai ${persona.name} (${persona.role}) trong buổi meeting trực tiếp với nhóm sinh viên.

BỐI CẢNH NHÂN VẬT: ${persona.personality} / ${persona.communicationStyle}
GIAI ĐOẠN: ${stage?.name ?? ""} — ${stage?.goal ?? ""}
KNOWLEDGE BASE:
- OPEN: ${kb.open.join("; ")}
- CONTEXTUAL: ${kb.contextual.join("; ")}
- CONFIRM ONLY: ${kb.confirmOnly.join("; ")}
- CONFIDENTIAL: (không tiết lộ)

LỊCH SỬ HỘI THOẠI GẦN NHẤT:
${recentHistory.map((m) => `[${m.role === "student" ? "Nhóm" : "Client"}]: ${m.content}`).join("\n")}

INSTRUCTOR VỪA GÕ TÓM TẮT Ý SINH VIÊN:
"${studentInput}"

Hãy sinh ra ĐÚNG 3–4 gợi ý phản hồi cho instructor.
Mỗi gợi ý: một dòng, format "[NHÃN CHIẾN THUẬT] mô tả ngắn ý định"
Ví dụ:
[Thách thức kỹ thuật] Hỏi ngược: đã biết hệ thống lõi đang dùng là gì chưa?
[Khai thác tài chính] Ai chi trả — sinh viên, trường, hay thư viện?
[Góc pháp lý] Đặt vấn đề data privacy theo Nghị định 13/2023
[Đồng ý có điều kiện] Gật đầu nhưng yêu cầu ROI model cụ thể

Tập trung vào: thách thức giả định, khai thác chiều sâu, kiểm tra kiến thức, mối lo ngại thực tế của client.
Không viết câu đầy đủ để đọc lại — instructor sẽ tự nói theo ý.`;
}

export function buildRefinementSystemPrompt(
  group: Group,
  scenario: Scenario,
  stageIndex: number,
  history: Message[],
  currentSuggestions: string[],
  selectedPoints: string[]
): string {
  const stage = scenario.stages[stageIndex];
  const persona = group.clientPersona;
  const recentHistory = history.slice(-6);

  return `Bạn là AI coach hỗ trợ instructor điều hành buổi roleplay simulation.
Instructor đang đóng vai ${persona.name} trong meeting trực tiếp với sinh viên.

CONTEXT HIỆN TẠI:
- Scenario: ${scenario.name}
- Stage: ${stage?.name ?? ""}
- Lịch sử hội thoại gần nhất:
${recentHistory.map((m) => `[${m.role === "student" ? "Nhóm" : "Client"}]: ${m.content}`).join("\n")}
- Gợi ý AI vừa sinh ra: ${currentSuggestions.join(", ")}
- Instructor đã chọn: ${selectedPoints.join(", ")}

Instructor có thể yêu cầu bạn:
- Thêm gợi ý mới không có trong danh sách
- Tinh chỉnh tone của một gợi ý (cứng hơn / mềm hơn / kỹ thuật hơn)
- Giải thích tại sao một hướng phản hồi lại phù hợp về mặt sư phạm
- Điều chỉnh theo quan sát của instructor về nhóm sinh viên hiện tại

Phản hồi ngắn gọn, thực tế. Khi đề xuất gợi ý mới, dùng cùng format [NHÃN] mô tả.`;
}

export function buildDebriefPrompt(
  group: Group,
  scenario: Scenario,
  messages: Message[]
): string {
  const transcript = messages
    .map((m) => `[${m.role === "student" ? "Nhóm" : "Client"}]: ${m.content}`)
    .join("\n");

  return `Bạn là giảng viên đang nhận xét buổi roleplay của một nhóm sinh viên.

SCENARIO: ${scenario.name} — ${group.clientPersona.name}, ${group.clientPersona.role}
TIÊU CHÍ ĐÁNH GIÁ:
${scenario.assessmentRubric.map((r, i) => `${i + 1}. ${r}`).join("\n")}

TRANSCRIPT ĐẦY ĐỦ:
${transcript}

Hãy viết nhận xét theo từng tiêu chí rubric, dựa trực tiếp vào transcript.
Với mỗi tiêu chí, trích dẫn ít nhất 1 ví dụ cụ thể từ transcript.
Trả về JSON với cấu trúc:
{
  "rubricFeedback": [{ "criterion": "...", "feedback": "...", "suggestion": "..." }],
  "strengths": ["..."],
  "improvements": ["..."],
  "actionItems": ["..."]
}
Viết bằng tiếng Việt, giọng xây dựng và cụ thể.`;
}

export function buildCoachingDebriefPrompt(
  group: Group,
  messages: Message[],
  previousMessages?: Message[],
  previousRunIndex?: number
): string {
  const kb = group.knowledgeBase;
  const transcript = messages
    .map((m) => `[${m.role === "student" ? "Nhóm" : "Client"}]: ${m.content}`)
    .join("\n");

  let previousSection = "";
  if (previousMessages && previousRunIndex) {
    const prevTranscript = previousMessages
      .map((m) => `[${m.role === "student" ? "Nhóm" : "Client"}]: ${m.content}`)
      .join("\n");
    previousSection = `\nTRANSCRIPT LẦN TRƯỚC (run ${previousRunIndex}):\n${prevTranscript}`;
  }

  return `Bạn là AI coach đang phân tích buổi luyện tập roleplay của một nhóm sinh viên.

CLIENT: ${group.clientPersona.name}, ${group.clientPersona.role}
PROJECT: ${group.projectBrief}

KNOWLEDGE BASE ĐẦY ĐỦ CỦA CLIENT (chỉ bạn biết):
- Thông tin OPEN: ${kb.open.join("; ")}
- Thông tin CONTEXTUAL: ${kb.contextual.join("; ")}
- Thông tin CONFIRM ONLY: ${kb.confirmOnly.join("; ")}
[Không tiết lộ CONFIDENTIAL trong bất kỳ trường hợp nào]

TRANSCRIPT BUỔI LUYỆN:
${transcript}
${previousSection}

Hãy phân tích và trả về JSON với cấu trúc sau:
{
  "unlockedInfo": [],
  "missedContextual": [],
  "missedConfirmOnly": [],
  "suggestedQuestions": [],
  ${previousMessages ? '"improvement": { "newlyUnlocked": [], "stillMissing": [] }' : ""}
}

Phân tích dựa trên transcript thực tế, không suy đoán. Viết ngắn gọn, tiếng Việt.`;
}
