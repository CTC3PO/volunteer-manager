"use client";
import { initializeApp, getApps, FirebaseApp, deleteApp } from "firebase/app";
import { getFirestore, Firestore, collection, writeBatch, doc, getDocs, query, limit } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let activeConfigStr = "";

const APP_NAME = "tnv-app";

// Initialize or return initialized Firestore instance with named app and dynamic configuration checks
export function getFirebaseDb(config: any): Firestore | null {
  if (typeof window === "undefined") return null;
  if (!config || !config.apiKey || !config.projectId) return null;

  try {
    const currentConfigStr = JSON.stringify({ apiKey: config.apiKey, projectId: config.projectId });

    // If app is already initialized and config matches, reuse it
    if (firebaseApp && firestoreDb && activeConfigStr === currentConfigStr) {
      return firestoreDb;
    }

    // Check if an app with this name already exists
    const existing = getApps().find((a) => a.name === APP_NAME);
    if (existing) {
      const options = existing.options as any;
      if (options.apiKey === config.apiKey && options.projectId === config.projectId) {
        firebaseApp = existing;
        firestoreDb = getFirestore(firebaseApp);
        activeConfigStr = currentConfigStr;
        return firestoreDb;
      }

      // If configuration changed, delete the old named app first
      deleteApp(existing).catch((err) =>
        console.error("Lỗi khi xóa Firebase app cũ:", err)
      );
    }

    // Initialize the named app with new configuration
    firebaseApp = initializeApp(config, APP_NAME);
    firestoreDb = getFirestore(firebaseApp);
    activeConfigStr = currentConfigStr;
    return firestoreDb;
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
    return null;
  }
}

// Test connectivity and read permissions on Firestore
export async function testFirebaseConnection(db: Firestore): Promise<{ success: boolean; error?: string }> {
  try {
    const q = query(collection(db, "volunteers"), limit(1));
    await getDocs(q);
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi kết nối Firebase:", error);
    return { success: false, error: error.message || String(error) };
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
