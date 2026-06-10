import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import { Course, Group, Scenario, Session, Message, PracticeRun, Refinement } from "./types";

// ── Courses ──────────────────────────────────────────────────────────────────

export async function getCourses(instructorId: string): Promise<Course[]> {
  const snap = await getAdminDb().collection("courses")
    .where("instructorId", "==", instructorId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const snap = await getAdminDb().collection("courses").doc(courseId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Course) : null;
}

export async function createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await getAdminDb().collection("courses").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
  await getAdminDb().collection("courses").doc(courseId).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// ── Groups ───────────────────────────────────────────────────────────────────

export async function getGroups(courseId: string): Promise<Group[]> {
  const snap = await getAdminDb()
    .collection("courses").doc(courseId).collection("groups")
    .orderBy("createdAt", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
}

export async function getGroup(courseId: string, groupId: string): Promise<Group | null> {
  const snap = await getAdminDb()
    .collection("courses").doc(courseId).collection("groups").doc(groupId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Group) : null;
}

export async function createGroup(courseId: string, data: Omit<Group, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await getAdminDb()
    .collection("courses").doc(courseId).collection("groups").add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return ref.id;
}

export async function updateGroup(courseId: string, groupId: string, data: Partial<Group>): Promise<void> {
  await getAdminDb()
    .collection("courses").doc(courseId).collection("groups").doc(groupId).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

export async function getScenarios(courseId: string): Promise<Scenario[]> {
  const snap = await getAdminDb()
    .collection("courses").doc(courseId).collection("scenarios")
    .orderBy("meetingOrder", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Scenario));
}

export async function getScenario(courseId: string, scenarioId: string): Promise<Scenario | null> {
  const snap = await getAdminDb()
    .collection("courses").doc(courseId).collection("scenarios").doc(scenarioId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Scenario) : null;
}

export async function createScenario(courseId: string, data: Omit<Scenario, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await getAdminDb()
    .collection("courses").doc(courseId).collection("scenarios").add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return ref.id;
}

export async function updateScenario(courseId: string, scenarioId: string, data: Partial<Scenario>): Promise<void> {
  await getAdminDb()
    .collection("courses").doc(courseId).collection("scenarios").doc(scenarioId).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(data: Omit<Session, "id" | "createdAt">): Promise<string> {
  const ref = await getAdminDb().collection("sessions").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const snap = await getAdminDb().collection("sessions").doc(sessionId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Session) : null;
}

export async function getSessionByCode(code: string): Promise<Session | null> {
  const snap = await getAdminDb().collection("sessions")
    .where("sessionCode", "==", code.toUpperCase()).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Session;
}

export async function getSessionsByGroup(courseId: string, groupId: string): Promise<Session[]> {
  const snap = await getAdminDb().collection("sessions")
    .where("courseId", "==", courseId)
    .where("groupId", "==", groupId)
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Session));
}

export async function updateSession(sessionId: string, data: Partial<Session>): Promise<void> {
  await getAdminDb().collection("sessions").doc(sessionId).update(data as Record<string, unknown>);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(sessionId: string): Promise<Message[]> {
  const snap = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("messages")
    .orderBy("timestamp", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

export async function addMessage(sessionId: string, data: Omit<Message, "id" | "timestamp">): Promise<string> {
  const ref = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("messages").add({
      ...data,
      timestamp: FieldValue.serverTimestamp(),
    });
  return ref.id;
}

// ── Practice Runs ──────────────────────────────────────────────────────────────

export async function createPracticeRun(sessionId: string, runIndex: number): Promise<string> {
  const ref = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("runs").add({
      runIndex,
      status: "active",
      startedAt: FieldValue.serverTimestamp(),
    });
  return ref.id;
}

export async function getPracticeRuns(sessionId: string): Promise<PracticeRun[]> {
  const snap = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("runs")
    .orderBy("runIndex", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PracticeRun));
}

export async function getPracticeRun(sessionId: string, runId: string): Promise<PracticeRun | null> {
  const snap = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("runs").doc(runId).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as PracticeRun) : null;
}

export async function completePracticeRun(sessionId: string, runId: string): Promise<void> {
  await getAdminDb()
    .collection("sessions").doc(sessionId).collection("runs").doc(runId).update({
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
    });
}

export async function getPracticeRunMessages(sessionId: string, runId: string): Promise<Message[]> {
  const snap = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("runs").doc(runId).collection("messages")
    .orderBy("timestamp", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
}

export async function addPracticeRunMessage(
  sessionId: string,
  runId: string,
  data: Omit<Message, "id" | "timestamp">
): Promise<string> {
  const ref = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("runs").doc(runId).collection("messages").add({
      ...data,
      timestamp: FieldValue.serverTimestamp(),
    });
  return ref.id;
}

// ── Refinements ───────────────────────────────────────────────────────────────

export async function addRefinement(sessionId: string, data: Omit<Refinement, "id">): Promise<string> {
  const ref = await getAdminDb()
    .collection("sessions").doc(sessionId).collection("refinements").add(data);
  return ref.id;
}
