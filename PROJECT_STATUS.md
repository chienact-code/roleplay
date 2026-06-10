# VJCC Roleplay Platform — Project Status

## Trạng thái hiện tại: ✅ LIVE

**Production:** https://roleplay-lms.vercel.app  
**GitHub:** https://github.com/chienact-code/roleplay  
**Cập nhật lần cuối:** 2026-06-10  

---

## ✅ Đã hoàn thành

### Infrastructure
- [x] Next.js 14 (App Router) + TypeScript + Tailwind CSS
- [x] Firebase Authentication (Email/Password)
- [x] Firestore với lazy initialization (tránh build-time error)
- [x] **Dual Firebase SDK**: client SDK cho pages, Admin SDK cho API routes
- [x] Vercel deployment với đầy đủ env vars
- [x] Firestore Security Rules deployed
- [x] Firestore Composite Indexes (courses + sessions)
- [x] `FIREBASE_SERVICE_ACCOUNT_KEY` trên Vercel (Production + Development)

### Tính năng Instructor
- [x] Đăng ký / Đăng nhập (role: instructor / student)
- [x] Tạo & quản lý Course
- [x] Tạo & quản lý Group (với Client Persona + Knowledge Base 4 levels)
- [x] Tạo & quản lý Scenario (với Stages + Assessment Rubric)
- [x] Tạo Session (wizard: chọn group + scenario + mode + type + mã code)
- [x] Monitor page: xem live messages qua Firestore onSnapshot
- [x] Prompter page: 3-panel (Conversation Log + Response Builder + AI Coach)
- [x] Response Builder: phân tích ý sinh viên → AI gợi ý 3-4 hướng → DELIVER
- [x] Official Debrief page: nhận xét rubric + export Word (.docx)

### Tính năng Student
- [x] Join session bằng 6-char code
- [x] Chat với AI client (autonomous mode, SSE streaming)
- [x] Coaching Debrief sau practice run (X-ray report)

### API Routes (tất cả dùng Admin SDK)
- [x] POST `/api/sessions` — tạo session
- [x] POST `/api/sessions/[id]/chat` — SSE autonomous chat
- [x] POST `/api/sessions/[id]/suggest` — gợi ý prompter
- [x] POST `/api/sessions/[id]/refine` — SSE refinement chat
- [x] POST `/api/sessions/[id]/deliver` — deliver response
- [x] POST `/api/sessions/[id]/stage` — chuyển stage
- [x] POST `/api/sessions/[id]/complete` — kết thúc session
- [x] GET  `/api/sessions/[id]/debrief` — official debrief (Claude)
- [x] GET  `/api/sessions/[id]/coaching-debrief` — coaching debrief
- [x] GET/POST `/api/sessions/[id]/runs` — practice runs
- [x] GET  `/api/sessions/code/[code]` — lookup by code
- [x] GET/POST/PUT courses, groups, scenarios APIs

---

## 🔴 Cần làm (Critical)

### Bảo mật — Làm NGAY
- [ ] **Revoke Vercel token** `vcp_6Pg2...` → [vercel.com/account/tokens](https://vercel.com/account/tokens)
- [ ] **Revoke GitHub PAT** `ghp_cixF...` → [github.com/settings/tokens](https://github.com/settings/tokens)
- [ ] **(Tùy chọn)** Rotate Firebase Service Account key cũ tại Firebase Console → Project Settings → Service Accounts

### Auth API Routes
- [ ] API routes hiện **không verify auth token** của user — bất kỳ ai biết sessionId đều có thể gọi
  - Fix: verify Firebase ID token từ `Authorization` header trong mỗi API route
  - Hoặc chấp nhận rủi ro này cho môi trường classroom (sessionId không đoán được)

---

## 🟡 Chưa test / Cần kiểm tra

- [ ] **Prompter mode end-to-end**: suggest → chọn điểm → deliver → student nhận phản hồi
- [ ] **RefinementChat** (AI Coach panel bên phải prompter): chat để tinh chỉnh gợi ý
- [ ] **Official Debrief + Export Word**: tạo session official → complete → xem debrief → download .docx
- [ ] **Practice mode**: nhiều runs, coaching debrief X-ray, so sánh run trước/sau
- [ ] **Stage transitions**: chuyển stage từ monitor/prompter, kiểm tra AI behavior thay đổi theo stage
- [ ] **Session code join**: student nhập code, join đúng session, chat hoạt động
- [ ] **Firestore indexes**: lần đầu query `sessions` với compound filter có thể cần click link tạo index trong console

---

## 🔵 Cải tiến tiếp theo (Nice-to-have)

### UX
- [ ] Loading skeleton thay vì spinner
- [ ] Toast notifications thay vì `alert()`
- [ ] Confirm dialog trước khi kết thúc session
- [ ] Responsive design cho tablet (instructor dùng iPad)
- [ ] Dark mode

### Tính năng
- [ ] Instructor xem lại transcript sau session (history)
- [ ] So sánh nhiều groups trên cùng scenario
- [ ] Export transcript ra PDF/Word
- [ ] Student xem lại tất cả debrief của mình
- [ ] Thêm role `admin` để quản lý nhiều instructor

### Technical
- [ ] Rate limiting cho API routes (tránh spam Claude API)
- [ ] Error boundary toàn app
- [ ] Unit tests cho prompt builders (`lib/claude.ts`)
- [ ] Pagination cho danh sách courses/groups dài

---

## Kiến trúc quan trọng cần nhớ

```
Pages ("use client")  →  lib/firestore.ts     (Firebase Client SDK)
API Routes            →  lib/firestore-server.ts  (Firebase Admin SDK)
```

> **KHÔNG** cross-import. Client SDK không dùng được trong API routes (không có auth context).  
> Admin SDK không bundle được cho browser (dùng Node.js built-ins như `fs`, `net`).

---

## Môi trường

### Local dev
```bash
# Node qua nvm
PATH="/Users/uer/.nvm/versions/node/v20.20.2/bin:$PATH"

# npm install nếu bị EACCES
npm install --cache /tmp/npm-cache-clean

# Dev server
npm run dev

# Build kiểm tra
npm run build
```

### Firebase CLI
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json firebase deploy \
  --only firestore:rules,firestore:indexes \
  --project roleplay-pbl
```

### Vercel CLI (đã linked)
```bash
# Project đã linked tại .vercel/
vercel env ls --token YOUR_TOKEN
vercel logs --token YOUR_TOKEN --expand
```
