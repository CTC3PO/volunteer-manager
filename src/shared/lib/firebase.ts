"use client";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, writeBatch, doc, getDocs } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

// Initialize or return initialized Firestore instance
export function getFirebaseDb(config: any): Firestore | null {
  if (typeof window === "undefined") return null;
  if (!config || !config.apiKey || !config.projectId) return null;

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
      firestoreDb = getFirestore(firebaseApp);
    } else {
      const app = getApp();
      firestoreDb = getFirestore(app);
    }
    return firestoreDb;
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
    return null;
  }
}

// Push local Zustand data to Firestore (used when connecting Firebase for the first time)
export async function syncLocalToFirestore(
  db: Firestore,
  retreats: any[],
  volunteers: any[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);

    // Upload retreats
    for (const r of retreats) {
      const retreatRef = doc(db, "retreats", r.id);
      batch.set(retreatRef, r);
    }

    // Upload volunteers
    for (const v of volunteers) {
      const volunteerRef = doc(db, "volunteers", v.id);
      batch.set(volunteerRef, v);
    }

    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi syncLocalToFirestore:", error);
    return { success: false, error: error.message || String(error) };
  }
}
