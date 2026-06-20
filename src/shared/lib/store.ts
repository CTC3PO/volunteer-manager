"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Volunteer } from "@/shared/types/volunteer";
import { Retreat } from "@/shared/types/retreat";
import { mockVolunteers } from "@/shared/data/mock-volunteers";
import { retreatConfig } from "@/shared/config/retreat-config";
import { getFirebaseDb } from "@/shared/lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot, collection } from "firebase/firestore";

// Default template email for volunteers
const DEFAULT_EMAIL_TEMPLATE = `Kính gửi bạn {name},

Chúng tôi rất hoan hỷ được tiếp đón bạn đến với chương trình TNV tại Tu viện Vườn Ươm.

Dưới đây là một số thông tin quan trọng liên quan đến sự góp mặt của bạn:
- Gia đình Pháp đàm: {family}
- Nhiệm vụ phân công: {tasks}
- Phòng ở: {room}
- Ngày đến: {arrivalDate}
- Ngày đi: {departureDate}

Vui lòng chuẩn bị tinh thần và trang phục trang nghiêm khi đến tu viện.

Chúc bạn có một chuyến đi tu học gặt hái nhiều niềm vui và bình an!
Thân ái,
Ban Điều Phối TNV`;

// Default retreats initialized in the app
const initialRetreats: Retreat[] = [
  {
    id: "wakeup-2026",
    ten: "Wakeup 2026",
    diaDiem: "Tu viện Vườn Ươm – Làng Mai Thái Lan",
    ngayBatDau: "2026-06-23",
    ngayKetThuc: "2026-07-05",
    moTa: "Chương trình tu học mùa hè dành cho giới trẻ quốc tế và Việt Nam.",
    ngayTao: "2026-05-15T08:00:00Z",
    ngayCapNhat: "2026-05-15T08:00:00Z",
    families: retreatConfig.families,
    tasks: retreatConfig.tasks,
    posterUrl: "/images/wakeup-2026.png",
  },
  {
    id: "khoa-tu-viet-2026",
    ten: "Khoá tu người Việt 2026",
    diaDiem: "Tu viện Vườn Ươm – Làng Mai Thái Lan",
    ngayBatDau: "2026-07-10",
    ngayKetThuc: "2026-07-20",
    moTa: "Khóa tu đặc biệt dành riêng cho cộng đồng người Việt sinh sống trong và ngoài nước.",
    ngayTao: "2026-06-18T00:00:00Z",
    ngayCapNhat: "2026-06-18T00:00:00Z",
    families: retreatConfig.families,
    tasks: retreatConfig.tasks,
    posterUrl: "/images/khoa-tu-viet-2026.jpg",
  }
];

const getEnvFirebaseConfig = () => {
  if (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
  return null;
};

export const getEffectiveConfig = (stateConfig: any) => {
  if (stateConfig && stateConfig.apiKey && stateConfig.projectId) {
    return stateConfig;
  }
  return getEnvFirebaseConfig();
};

// Firebase Firestore write helpers
const dbWriteVolunteer = async (v: Volunteer, config: any) => {
  const effective = getEffectiveConfig(config);
  const db = getFirebaseDb(effective);
  if (db) {
    try {
      await setDoc(doc(db, "volunteers", v.id), v);
    } catch (err) {
      console.error("Lỗi ghi Firestore (volunteer):", err);
    }
  }
};

const dbDeleteVolunteer = async (id: string, config: any) => {
  const effective = getEffectiveConfig(config);
  const db = getFirebaseDb(effective);
  if (db) {
    try {
      await deleteDoc(doc(db, "volunteers", id));
    } catch (err) {
      console.error("Lỗi xóa Firestore (volunteer):", err);
    }
  }
};

const dbWriteRetreat = async (r: Retreat, config: any) => {
  const effective = getEffectiveConfig(config);
  const db = getFirebaseDb(effective);
  if (db) {
    try {
      await setDoc(doc(db, "retreats", r.id), r);
    } catch (err) {
      console.error("Lỗi ghi Firestore (retreat):", err);
    }
  }
};

const dbDeleteRetreat = async (id: string, config: any) => {
  const effective = getEffectiveConfig(config);
  const db = getFirebaseDb(effective);
  if (db) {
    try {
      await deleteDoc(doc(db, "retreats", id));
    } catch (err) {
      console.error("Lỗi xóa Firestore (retreat):", err);
    }
  }
};

interface VolunteerStore {
  volunteers: Volunteer[];
  retreats: Retreat[];
  activeRetreatId: string | null;
  themeMode: "light" | "dark";
  language: "vi" | "en" | "th";
  emailTemplate: string;
  firebaseConfig: any | null; // Pasted Firebase config object
  deletedVolunteerIds: string[];
  currentUser: { email: string } | null;

  // Volunteer Actions
  addVolunteer: (v: Volunteer) => void;
  addVolunteers: (vs: Volunteer[]) => void;
  updateVolunteer: (id: string, updates: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;
  getVolunteer: (id: string) => Volunteer | undefined;

  // Retreat Actions
  addRetreat: (r: Retreat) => void;
  updateRetreat: (id: string, updates: Partial<Retreat>) => void;
  deleteRetreat: (id: string) => void;
  setActiveRetreatId: (id: string | null) => void;

  // App Settings Actions
  setThemeMode: (mode: "light" | "dark") => void;
  setLanguage: (lang: "vi" | "en" | "th") => void;
  setEmailTemplate: (template: string) => void;
  setFirebaseConfig: (config: any | null) => void;

  // Auth Actions
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  // Cleanup Data Action
  cleanupVolunteersData: () => void;
}

export const useVolunteerStore = create<VolunteerStore>()(
  persist(
    (set, get) => ({
      volunteers: mockVolunteers,
      retreats: initialRetreats,
      activeRetreatId: "wakeup-2026",
      themeMode: "light",
      language: "vi",
      emailTemplate: DEFAULT_EMAIL_TEMPLATE,
      firebaseConfig: null,
      deletedVolunteerIds: [],
      currentUser: null,

      // Volunteer Actions
      addVolunteer: (v) => {
        // If it was previously marked as deleted, unmark it
        set((state) => ({
          volunteers: [...state.volunteers, v],
          deletedVolunteerIds: (state.deletedVolunteerIds || []).filter((id) => id !== v.id),
        }));
        dbWriteVolunteer(v, get().firebaseConfig);
      },

      addVolunteers: (vs) => {
        const ids = vs.map((v) => v.id);
        set((state) => ({
          volunteers: [...state.volunteers, ...vs],
          deletedVolunteerIds: (state.deletedVolunteerIds || []).filter((id) => !ids.includes(id)),
        }));
        const config = get().firebaseConfig;
        vs.forEach((v) => dbWriteVolunteer(v, config));
      },

      updateVolunteer: (id, updates) => {
        set((state) => {
          const nextVolunteers = state.volunteers.map((v) =>
            v.id === id
              ? { ...v, ...updates, ngayCapNhat: new Date().toISOString() }
              : v
          );
          const updated = nextVolunteers.find((v) => v.id === id);
          if (updated) {
            dbWriteVolunteer(updated, state.firebaseConfig);
          }
          return { volunteers: nextVolunteers };
        });
      },

      deleteVolunteer: (id) => {
        set((state) => ({
          deletedVolunteerIds: [...(state.deletedVolunteerIds || []), id],
          volunteers: state.volunteers.filter((v) => v.id !== id),
        }));
        dbDeleteVolunteer(id, get().firebaseConfig);
      },

      getVolunteer: (id) => get().volunteers.find((v) => v.id === id),

      // Retreat Actions
      addRetreat: (r) => {
        set((state) => ({ retreats: [...state.retreats, r] }));
        dbWriteRetreat(r, get().firebaseConfig);
      },

      updateRetreat: (id, updates) => {
        set((state) => {
          const nextRetreats = state.retreats.map((r) =>
            r.id === id
              ? { ...r, ...updates, ngayCapNhat: new Date().toISOString() }
              : r
          );
          const updated = nextRetreats.find((r) => r.id === id);
          if (updated) {
            dbWriteRetreat(updated, state.firebaseConfig);
          }

          // Cascade changes to volunteers associated with this retreat
          const updatedFamilies = updates.families;
          const updatedTasks = updates.tasks;
          
          const nextVolunteers = state.volunteers.map((v) => {
            if (v.retreatId !== id) return v;

            let updatedV = { ...v };
            let changed = false;

            // If families were updated, check if volunteer's family is still valid
            if (updatedFamilies) {
              const familyStillExists = updatedFamilies.some((f) => f.id === v.giaDinhPhapDam);
              if (v.giaDinhPhapDam && !familyStillExists) {
                updatedV.giaDinhPhapDam = undefined;
                changed = true;
              }
            }

            // If tasks were updated, filter out any tasks that no longer exist in the retreat
            if (updatedTasks) {
              const nextTasks = v.nhiemVu.filter((task) => updatedTasks.includes(task));
              if (nextTasks.length !== v.nhiemVu.length) {
                updatedV.nhiemVu = nextTasks;
                changed = true;
              }
            }

            if (changed) {
              updatedV.ngayCapNhat = new Date().toISOString();
              dbWriteVolunteer(updatedV, state.firebaseConfig);
            }

            return updatedV;
          });

          return { 
            retreats: nextRetreats,
            volunteers: nextVolunteers
          };
        });
      },

      deleteRetreat: (id) => {
        const config = get().firebaseConfig;
        const assocVolunteers = get().volunteers.filter((v) => v.retreatId === id);
        const assocIds = assocVolunteers.map((v) => v.id);

        set((state) => {
          const nextVolunteers = state.volunteers.filter((v) => v.retreatId !== id);
          const nextRetreats = state.retreats.filter((r) => r.id !== id);
          return {
            retreats: nextRetreats,
            volunteers: nextVolunteers,
            deletedVolunteerIds: [...(state.deletedVolunteerIds || []), ...assocIds],
            activeRetreatId: state.activeRetreatId === id ? null : state.activeRetreatId,
          };
        });

        dbDeleteRetreat(id, config);
        if (config) {
          assocVolunteers.forEach((v) => dbDeleteVolunteer(v.id, config));
        }
      },

      setActiveRetreatId: (id) =>
        set(() => ({ activeRetreatId: id })),

      // App Settings Actions
      setThemeMode: (mode) =>
        set(() => ({ themeMode: mode })),

      setLanguage: (lang) =>
        set(() => ({ language: lang })),

      setEmailTemplate: (template) =>
        set(() => ({ emailTemplate: template })),

      setFirebaseConfig: (config) =>
        set(() => ({ firebaseConfig: config })),

      login: (email, pass) => {
        if (email === "volunteer@pvthailand.org" && pass === "plumvillage2026") {
          set(() => ({ currentUser: { email } }));
          return true;
        }
        return false;
      },

      logout: () => {
        set(() => ({ currentUser: null }));
      },

      cleanupVolunteersData: () => {
        set((state) => {
          let hasChanges = false;
          const config = state.firebaseConfig;
          const cleaned = state.volunteers.reduce((acc: Volunteer[], v) => {
            const name = v.hoTen?.trim() || "";
            const isInvalidName =
              name === "" ||
              name.includes("@") ||
              name.includes("Tên TNV") ||
              name.includes("Bạn hãy") ||
              name.includes("Tôi đồng ý") ||
              name.includes("Thời gian") ||
              name.includes("Thời điểm") ||
              name.length > 50;

            if (isInvalidName) {
              hasChanges = true;
              dbDeleteVolunteer(v.id, config);
              return acc;
            }

            const cleanDateStr = (dateStr?: string) => {
              if (!dateStr) return "";
              const ymdMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
              if (ymdMatch) {
                const y = ymdMatch[1];
                const m = ymdMatch[2].padStart(2, "0");
                const d = ymdMatch[3].padStart(2, "0");
                return `${y}-${m}-${d}`;
              }
              const dmyMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
              if (dmyMatch) {
                const d = dmyMatch[1].padStart(2, "0");
                const m = dmyMatch[2].padStart(2, "0");
                const y = dmyMatch[3];
                return `${y}-${m}-${d}`;
              }
              return dateStr;
            };

            const newNgayDen = cleanDateStr(v.ngayDen);
            const newNgayRoi = cleanDateStr(v.ngayRoi);

            if (newNgayDen !== v.ngayDen || newNgayRoi !== v.ngayRoi) {
              hasChanges = true;
              const updatedV = {
                ...v,
                ngayDen: newNgayDen,
                ngayRoi: newNgayRoi,
                ngayCapNhat: new Date().toISOString(),
              };
              dbWriteVolunteer(updatedV, config);
              acc.push(updatedV);
            } else {
              acc.push(v);
            }
            return acc;
          }, []);

          if (hasChanges) {
            return { volunteers: cleaned };
          }
          return {};
        });
      },
    }),
    {
      name: "tnv-manager-volunteers",
    }
  )
);

// Realtime Firebase listeners
let unsubRetreats: (() => void) | null = null;
let unsubVolunteers: (() => void) | null = null;
let isInitialRetreatsLoad = true;
let isInitialVolunteersLoad = true;

export const startFirebaseSync = (config: any) => {
  const db = getFirebaseDb(config);
  if (!db) return;

  // Clear previous sub subscriptions
  if (unsubRetreats) unsubRetreats();
  if (unsubVolunteers) unsubVolunteers();
  
  isInitialRetreatsLoad = true;
  isInitialVolunteersLoad = true;

  // Listen to retreats
  unsubRetreats = onSnapshot(collection(db, "retreats"), (snapshot) => {
    const retreatsList: Retreat[] = [];
    snapshot.forEach((doc) => {
      retreatsList.push(doc.data() as Retreat);
    });
    
    const isInitial = isInitialRetreatsLoad;
    isInitialRetreatsLoad = false;
    
    if (isInitial && snapshot.size === 0) {
      // Firebase is empty, seed it with our local state so we don't lose it
      const localRetreats = useVolunteerStore.getState().retreats;
      localRetreats.forEach((r) => dbWriteRetreat(r, config));
    } else {
      useVolunteerStore.setState({ retreats: retreatsList });
    }
  });

  // Listen to volunteers
  unsubVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
    const deletedIds = useVolunteerStore.getState().deletedVolunteerIds || [];
    const volunteersList: Volunteer[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Volunteer;
      if (!deletedIds.includes(data.id)) {
        volunteersList.push(data);
      }
    });
    
    const isInitial = isInitialVolunteersLoad;
    isInitialVolunteersLoad = false;
    
    if (isInitial && snapshot.size === 0) {
      // Firebase is empty, seed it with our local state so we don't lose it
      const localVolunteers = useVolunteerStore.getState().volunteers;
      localVolunteers.forEach((v) => dbWriteVolunteer(v, config));
    } else {
      useVolunteerStore.setState({ volunteers: volunteersList });
    }
  });
};

export const stopFirebaseSync = () => {
  if (unsubRetreats) {
    unsubRetreats();
    unsubRetreats = null;
  }
  if (unsubVolunteers) {
    unsubVolunteers();
    unsubVolunteers = null;
  }
};
