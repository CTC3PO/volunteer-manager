// ============================================================
// RETREAT CONFIG – thay đổi file này cho mỗi khóa tu mới
// ============================================================

export interface FamilyConfig {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
}

export interface RetreatConfig {
  name: string;
  location: string;
  dateRange: { start: string; end: string };
  families: FamilyConfig[];
  tasks: string[];
  paymentMethods: string[];
}

export const retreatConfig: RetreatConfig = {
  name: "Chương Trình TNV – Hè 2026",
  location: "Tu viện Vườn Ươm – Làng Mai Thái Lan",
  dateRange: { start: "2026-06-23", end: "2026-07-05" },

  families: [
    {
      id: "cay-tre",
      label: "Cây Tre",
      color: "#4ade80",
      bgColor: "rgba(74, 222, 128, 0.15)",
      emoji: "🎋",
    },
    {
      id: "cay-sala",
      label: "Cây Sala",
      color: "#fb923c",
      bgColor: "rgba(251, 146, 60, 0.15)",
      emoji: "🌸",
    },
    {
      id: "cay-soi",
      label: "Cây Sồi",
      color: "#a78bfa",
      bgColor: "rgba(167, 139, 250, 0.15)",
      emoji: "🌳",
    },
    {
      id: "cay-thong",
      label: "Cây Thông",
      color: "#38bdf8",
      bgColor: "rgba(56, 189, 248, 0.15)",
      emoji: "🌲",
    },
  ],

  tasks: [
    "Nấu ăn",
    "Tri khách",
    "Làm vườn",
    "Dọn dẹp",
    "Hỗ trợ thiền đường",
    "Hỗ trợ văn phòng",
    "Vận chuyển",
  ],

  paymentMethods: ["QR Code", "Tiền mặt"],
};
