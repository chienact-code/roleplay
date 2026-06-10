# VJCC Roleplay Platform — CLAUDE.md

## Tổng quan dự án

Nền tảng roleplay PBL (Project-Based Learning) cho Viện VJCC, Đại học Ngoại thương.
AI đóng vai khách hàng doanh nghiệp, sinh viên đóng vai consultant thực hành cuộc họp discovery.

**URL Production:** https://roleplay-lms.vercel.app
**GitHub:** https://github.com/chienact-code/roleplay
**Firebase Project:** roleplay-pbl

---

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** Radix UI + custom components (shadcn-style)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication (Email/Password)
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Deployment:** Vercel

---

## Kiến trúc Firebase SDK — QUAN TRỌNG

Dự án dùng **2 layer Firebase SDK riêng biệt**:

| Layer | File | Dùng ở đâu |
|---|---|---|
| Client SDK | `lib/firebase.ts` + `lib/firestore.ts` | Pages (`"use client"`) — chạy trên browser |
| Admin SDK | `lib/firebase-admin.ts` + `lib/firestore-server.ts` | API Routes — chạy server-side |

**Lý do:** API routes Next.js chạy server-side không có auth token của user → Firestore security rules block. Admin SDK bypass rules hoàn toàn.

**Rule quan trọng:** 
- Pages import từ `@/lib/firestore`
- API routes import từ `@/lib/firestore-server`
- KHÔNG được cross-import

---

## Cấu trúc thư mục

```
vjcc-roleplay/
├── app/
│   ├── api/                    # API Routes (server-side, dùng firestore-server)
│   │   ├── courses/[courseId]/
│   │   │   ├── groups/         # GET/POST groups
│   │   │   └── scenarios/      # GET/POST scenarios
│   │   └── sessions/
│   │       ├── route.ts        # POST create session
│   │       ├── code/[code]/    # GET session by code
│   │       └── [sessionId]/
│   │           ├── chat/       # POST SSE autonomous chat
│   │           ├── suggest/    # POST get suggestions (prompter)
│   │           ├── refine/     # POST SSE refinement
│   │           ├── deliver/    # POST deliver response
│   │           ├── stage/      # POST change stage
│   │           ├── complete/   # POST end session
│   │           ├── debrief/    # GET official debrief
│   │           ├── coaching-debrief/ # GET coaching debrief
│   │           └── runs/       # GET/POST practice runs
│   ├── instructor/             # Instructor portal (auth-guarded)
│   │   ├── courses/            # Course CRUD
│   │   └── sessions/           # Session management + prompter + debrief
│   ├── session/[code]/         # Student chat interface
│   └── join/                   # Student enter session code
├── components/
│   ├── chat/                   # MessageBubble, ChatInput, ChatWindow
│   ├── prompter/               # ConversationLog, ResponseBuilder, RefinementChat
│   ├── course/                 # GroupForm, ScenarioForm, KnowledgeBaseEditor
│   └── ui/                     # button, input, badge, card, select, tabs...
├── lib/
│   ├── firebase.ts             # Firebase client SDK (lazy init)
│   ├── firebase-admin.ts       # Firebase Admin SDK (lazy init)
│   ├── firestore.ts            # Firestore client SDK functions
│   ├── firestore-server.ts     # Firestore Admin SDK functions
│   ├── auth-context.tsx        # React auth context + hooks
│   ├── claude.ts               # Claude prompt builders
│   ├── session-code.ts         # 6-char session code generator
│   └── types.ts                # TypeScript interfaces
├── firebase.json               # Firebase CLI config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Composite indexes
└── vercel.json                 # Vercel build config
```

---

## Firestore Schema

```
users/{uid}
  - uid, email, name, role ("instructor"|"student"), createdAt

courses/{courseId}
  - instructorId, name, description, academicYear, semester, status
  └── groups/{groupId}
        - name, members[], projectTitle, projectBrief
        - clientPersona: { name, role, personality, communicationStyle }
        - knowledgeBase: { open[], contextual[], confirmOnly[], confidential[] }
      └── scenarios/{scenarioId}  [NOTE: scenarios là subcollection của course, không phải group]

courses/{courseId}/scenarios/{scenarioId}
  - name, meetingOrder, description, status, stages[], assessmentRubric[]

sessions/{sessionId}
  - courseId, groupId, scenarioId, instructorId
  - groupSnapshot, scenarioSnapshot (copy tại thời điểm tạo)
  - sessionCode (6 chars), sessionType ("official"|"practice")
  - sessionMode ("autonomous"|"prompter")
  - currentStageIndex, status ("waiting"|"active"|"completed")
  └── messages/{messageId}
        - role ("student"|"client"|"system"), content, stageIndex, timestamp
      runs/{runId}           [chỉ cho practice sessions]
        - runIndex, status, startedAt, completedAt
        └── messages/{messageId}
      refinements/{refinementId}
        - stageIndex, suggestions[], selectedPoints, refinedContent, timestamp
```

---

## Environment Variables

### Local (`.env.local`) — KHÔNG commit
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Vercel Production
Tất cả variables trên + `NEXT_PUBLIC_APP_URL=https://roleplay-lms.vercel.app`

---

## Session Modes

| Mode | Mô tả |
|---|---|
| **Autonomous** | AI trả lời trực tiếp qua SSE stream (`/api/sessions/[id]/chat`) |
| **Prompter** | AI đề xuất 3-4 gợi ý → Instructor chọn/chỉnh → Giao cho student qua `/deliver` |

## Session Types

| Type | Mô tả |
|---|---|
| **Official** | Assessed, 1 lần, sinh ra Debrief rubric + export Word |
| **Practice** | Unlimited runs, mỗi run có Coaching Debrief (X-ray report) |

---

## Claude Prompt Architecture

File `lib/claude.ts` chứa tất cả prompt builders:

- `buildAutonomousSystemPrompt(group, scenario, stageIndex)` — system prompt cho autonomous mode
- `buildSuggestionPrompt(...)` — tạo 3-4 gợi ý cho prompter mode
- `buildRefinementSystemPrompt(...)` — SSE refinement chat
- `buildDebriefPrompt(...)` — official debrief (rubric-based)
- `buildCoachingDebriefPrompt(...)` — coaching debrief (X-ray, so sánh với run trước)

Knowledge Base levels: `open` → tiết lộ tự do | `contextual` → chỉ khi được hỏi đúng context | `confirmOnly` → chỉ xác nhận | `confidential` → không bao giờ tiết lộ

---

## Quy tắc phát triển

### Firebase
- Lazy initialization cho cả client và admin SDK — không khởi tạo ở module level
- Client SDK: dùng `getDbInstance()` từ `lib/firebase.ts`
- Admin SDK: dùng `getAdminDb()` từ `lib/firebase-admin.ts`
- Mọi API route phải có `export const dynamic = "force-dynamic"`

### TypeScript
- Không dùng `any` — dùng `unknown` hoặc type cụ thể
- Unused imports gây build fail — xóa ngay
- Unused catch variable → dùng bare `catch {}`

### Next.js
- Pages (`"use client"`) → import từ `lib/firestore.ts` (client SDK)
- API routes (`app/api/`) → import từ `lib/firestore-server.ts` (admin SDK)
- Không bao giờ import `firebase-admin` trong client components

### Git
- `.env.local` đã có trong `.gitignore` — không bao giờ commit
- `.env.local.example` chỉ chứa placeholder, không có giá trị thật
- `FIREBASE_SERVICE_ACCOUNT_KEY` chỉ tồn tại trên Vercel và local `.env.local`

---

## Deployment Workflow

```bash
# Dev local
npm run dev

# Build kiểm tra trước khi push
npm run build

# Push → Vercel tự deploy
git push origin main
```

**Firebase CLI** (rules + indexes):
```bash
firebase use roleplay-pbl
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Firestore Composite Indexes

| Collection | Fields |
|---|---|
| `courses` | `instructorId` ASC + `createdAt` DESC |
| `sessions` | `courseId` ASC + `groupId` ASC + `createdAt` DESC |

Indexes được định nghĩa trong `firestore.indexes.json` và deploy bằng Firebase CLI.

---

## Known Issues & Workarounds

- **npm cache corruption**: Nếu `npm install` lỗi EACCES với cache, dùng flag `--cache /tmp/npm-cache-clean`
- **Firebase build-time error**: Đã fix bằng lazy initialization — không init Firebase ở module level
- **`use client` + firebase-admin**: Không thể bundle firebase-admin cho browser — đây là lý do phải tách `firestore.ts` (client) và `firestore-server.ts` (server)
- **Firestore protobufjs warning**: Warning từ Firebase Firestore SDK về `@protobufjs/inquire` — không ảnh hưởng functionality
