import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: "instructor" | "student";
  createdAt: Timestamp;
}

export interface Course {
  id: string;
  instructorId: string;
  name: string;
  description: string;
  academicYear: string;
  semester: string;
  status: "active" | "archived";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Member {
  name: string;
  email?: string;
}

export interface ClientPersona {
  name: string;
  role: string;
  personality: string;
  communicationStyle: string;
}

export interface KnowledgeBase {
  open: string[];
  contextual: string[];
  confirmOnly: string[];
  confidential: string[];
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  projectTitle: string;
  projectBrief: string;
  clientPersona: ClientPersona;
  knowledgeBase: KnowledgeBase;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Stage {
  name: string;
  goal: string;
  durationMinutes: number;
  aiBehavior: string;
}

export interface Scenario {
  id: string;
  name: string;
  meetingOrder: number;
  description: string;
  status: "draft" | "published";
  stages: Stage[];
  assessmentRubric: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Session {
  id: string;
  courseId: string;
  groupId: string;
  scenarioId: string;
  groupSnapshot: Group;
  scenarioSnapshot: Scenario;
  instructorId: string;
  mode: "autonomous" | "prompter";
  sessionType: "official" | "practice";
  status: "waiting" | "active" | "completed";
  sessionCode: string;
  currentStageIndex: number;
  practiceRunCount: number;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
}

export interface PracticeRun {
  id: string;
  runIndex: number;
  status: "active" | "completed";
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Message {
  id: string;
  role: "student" | "client" | "system";
  content: string;
  stageIndex: number;
  selectedPoints?: string[];
  timestamp: Timestamp;
}

export interface RefinementExchange {
  role: "instructor" | "ai";
  content: string;
  timestamp: Timestamp;
}

export interface Refinement {
  id: string;
  studentInput: string;
  initialSuggestions: string[];
  refinementExchanges: RefinementExchange[];
  finalSelectedPoints: string[];
  deliveredAt: Timestamp;
}

export interface RubricFeedback {
  criterion: string;
  feedback: string;
  suggestion: string;
}

export interface DebriefData {
  transcript: Message[];
  rubricFeedback: RubricFeedback[];
  strengths: string[];
  improvements: string[];
  actionItems: string[];
}

export interface CoachingDebriefData {
  unlockedInfo: string[];
  missedContextual: string[];
  missedConfirmOnly: string[];
  suggestedQuestions: string[];
  improvement?: {
    newlyUnlocked: string[];
    stillMissing: string[];
  };
}
