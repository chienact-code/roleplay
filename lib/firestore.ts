import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getDbInstance } from "./firebase";
import { Course, Group, Scenario, Session, Message, PracticeRun, Refinement } from "./types";

const getDb = getDbInstance;

// ── Courses ──────────────────────────────────────────────────────────────────

export async function getCourses(instructorId: string): Promise<Course[]> {
  const q = query(
    collection(getDb(), "courses"),
    where("instructorId", "==", instructorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const snap = await getDoc(doc(getDb(), "courses", courseId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : null;
}

export async function createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(getDb(), "courses"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
  await updateDoc(doc(getDb(), "courses", courseId), { ...data, updatedAt: serverTimestamp() });
}

// ── Groups ───────────────────────────────────────────────────────────────────

export async function getGroups(courseId: string): Promise<Group[]> {
  const snap = await getDocs(
    query(collection(getDb(), "courses", courseId, "groups"), orderBy("createdAt", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
}

export async function getGroup(courseId: string, groupId: string): Promise<Group | null> {
  const snap = await getDoc(doc(getDb(), "courses", courseId, "groups", groupId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Group) : null;
}

export async function createGroup(courseId: string, data: Omit<Group, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(getDb(), "courses", courseId, "groups"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGroup(courseId: string, groupId: string, data: Partial<Group>): Promise<void> {
  await updateDoc(doc(getDb(), "courses", courseId, "groups", groupId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

export async function getScenarios(courseId: string): Promise<Scenario[]> {
  const snap = await getDocs(
    query(collection(getDb(), "courses", courseId, "scenarios"), orderBy("meetingOrder", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Scenario));
}

export async function getScenario(courseId: string, scenarioId: string): Promise<Scenario | null> {
  const snap = await getDoc(doc(getDb(), "courses", courseId, "scenarios", scenarioId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Scenario) : null;
}

export async function createScenario(courseId: string, data: Omit<Scenario, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(getDb(), "courses", courseId, "scenarios"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateScenario(courseId: string, scenarioId: string, data: Partial<Scenario>): Promise<void> {
  await updateDoc(doc(getDb(), "courses", courseId, "scenarios", scenarioId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(data: Omit<Session, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(getDb(), "sessions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const snap = await getDoc(doc(getDb(), "sessions", sessionId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Session) : null;
}

export async function getSessionByCode(code: string): Promise<Session | null> {
  const q = query(collection(getDb(), "sessions"), where("sessionCode", "==", code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Session;
}

export async function getSessionsByGroup(courseId: string, groupId: string): Promise<Session[]> {
  const q = query(
    collection(getDb(), "sessions"),
    where("courseId", "==", courseId),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Session));
}

export async function updateSession(sessionId: string, data: Partial<Session>): Promise<void> {
  await updateDoc(doc(getDb(), "sessions", sessionId), data);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(sessionId: string): Promise<Message[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), "sessions", sessionId, "messages"),
      orderBy("timestamp", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

export async function addMessage(sessionId: string, data: Omit<Message, "id" | "timestamp">): Promise<string> {
  const ref = await addDoc(collection(getDb(), "sessions", sessionId, "messages"), {
    ...data,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}

// ── Practice Runs ──────────────────────────────────────────────────────────────

export async function createPracticeRun(sessionId: string, runIndex: number): Promise<string> {
  const ref = await addDoc(collection(getDb(), "sessions", sessionId, "runs"), {
    runIndex,
    status: "active",
    startedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPracticeRuns(sessionId: string): Promise<PracticeRun[]> {
  const snap = await getDocs(
    query(collection(getDb(), "sessions", sessionId, "runs"), orderBy("runIndex", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PracticeRun));
}

export async function getPracticeRun(sessionId: string, runId: string): Promise<PracticeRun | null> {
  const snap = await getDoc(doc(getDb(), "sessions", sessionId, "runs", runId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PracticeRun) : null;
}

export async function completePracticeRun(sessionId: string, runId: string): Promise<void> {
  await updateDoc(doc(getDb(), "sessions", sessionId, "runs", runId), {
    status: "completed",
    completedAt: serverTimestamp(),
  });
}

export async function getPracticeRunMessages(sessionId: string, runId: string): Promise<Message[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), "sessions", sessionId, "runs", runId, "messages"),
      orderBy("timestamp", "asc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

export async function addPracticeRunMessage(
  sessionId: string,
  runId: string,
  data: Omit<Message, "id" | "timestamp">
): Promise<string> {
  const ref = await addDoc(
    collection(getDb(), "sessions", sessionId, "runs", runId, "messages"),
    { ...data, timestamp: serverTimestamp() }
  );
  return ref.id;
}

// ── Refinements ───────────────────────────────────────────────────────────────

export async function addRefinement(sessionId: string, data: Omit<Refinement, "id">): Promise<string> {
  const ref = await addDoc(collection(getDb(), "sessions", sessionId, "refinements"), data);
  return ref.id;
}
