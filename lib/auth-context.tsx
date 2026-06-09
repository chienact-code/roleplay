"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuthInstance, getDbInstance } from "./firebase";
import { User } from "./types";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "instructor" | "student") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuthInstance(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(getDbInstance(), "users", firebaseUser.uid));
        setProfile(snap.exists() ? (snap.data() as User) : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getAuthInstance(), email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "instructor" | "student"
  ) => {
    const cred = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
    await setDoc(doc(getDbInstance(), "users", cred.user.uid), {
      uid: cred.user.uid,
      email,
      name,
      role,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(getAuthInstance());
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
