"use client";
import { useState, useEffect } from "react";
import { useVolunteerStore, getEffectiveConfig } from "@/shared/lib/store";
import { getFirebaseDb, syncLocalToFirestore, testFirebaseConnection } from "@/shared/lib/firebase";
import {
  Save, CheckCircle, Moon, Sun, Trash2, Mail, FileJson,
  Database, Wifi, Cloud, AlertTriangle, ShieldCheck
} from "lucide-react";

export default function CaiDatPage() {
  // Zustand State
  const themeMode = useVolunteerStore((s) => s.themeMode);
  const emailTemplate = useVolunteerStore((s) => s.emailTemplate);
  const firebaseConfig = useVolunteerStore((s) => s.firebaseConfig);
  const setThemeMode = useVolunteerStore((s) => s.setThemeMode);
  const setEmailTemplate = useVolunteerStore((s) => s.setEmailTemplate);
  const setFirebaseConfig = useVolunteerStore((s) => s.setFirebaseConfig);
  const volunteers = useVolunteerStore((s) => s.volunteers);
  const retreats = useVolunteerStore((s) => s.retreats);

  // Local State
  const [localTemplate, setLocalTemplate] = useState(emailTemplate);
  const [firebaseInput, setFirebaseInput] = useState(
    firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : ""
  );
  const [saved, setSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncError, setSyncError] = useState("");
  const [storageSize, setStorageSize] = useState("0 KB");
  const [effectiveConfig, setEffectiveConfig] = useState<any>(null);
  const [isEnvConfig, setIsEnvConfig] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");

  // Sync state
  useEffect(() => {
    setLocalTemplate(emailTemplate);
  }, [emailTemplate]);

  // Compute effective config
  useEffect(() => {
    const config = getEffectiveConfig(firebaseConfig);
    setEffectiveConfig(config);
    if (!firebaseConfig && config) {
      setIsEnvConfig(true);
    } else {
      setIsEnvConfig(false);
    }
  }, [firebaseConfig]);

  // Compute storage size
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dataStr = localStorage.getItem("tnv-manager-volunteers") || "";
      const sizeBytes = new Blob([dataStr]).size;
      setStorageSize((sizeBytes / 1024).toFixed(2) + " KB");
    }
  }, [volunteers, retreats]);

  const handleSave = () => {
    setEmailTemplate(localTemplate);

    // Save Firebase configuration if inputs are provided
    if (firebaseInput.trim()) {
      try {
        // Try parsing JSON or javascript-like object config
        let parsedConfig = null;
        const cleanInput = firebaseInput.trim();

        if (cleanInput.startsWith("{")) {
          parsedConfig = JSON.parse(cleanInput);
        } else {
          // Fallback parsing for javascript object copied directly from Firebase console
          // e.g., apiKey: "...", authDomain: "..."
          const extractField = (field: string) => {
            const regex = new RegExp(`${field}\\s*:\\s*["']([^"']+)["']`);
            const match = cleanInput.match(regex);
            return match ? match[1] : "";
          };

          parsedConfig = {
            apiKey: extractField("apiKey"),
            authDomain: extractField("authDomain"),
            projectId: extractField("projectId"),
            storageBucket: extractField("storageBucket"),
            messagingSenderId: extractField("messagingSenderId"),
            appId: extractField("appId"),
          };
        }

        if (parsedConfig && parsedConfig.apiKey && parsedConfig.projectId) {
          setFirebaseConfig(parsedConfig);
        } else {
          alert("Lưu ý: Firebase config thiếu trường bắt buộc (apiKey hoặc projectId).");
        }
      } catch (err) {
        alert("Không thể giải mã cấu hình Firebase. Vui lòng đảm bảo cấu hình là một JSON hợp lệ hoặc định dạng object từ Firebase Console.");
      }
    } else {
      // Clear config if empty
      setFirebaseConfig(null);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Push local data to Firestore
  const handlePushToCloud = async () => {
    if (!effectiveConfig) {
      alert("Vui lòng kết nối Firebase trước khi đẩy dữ liệu.");
      return;
    }

    const db = getFirebaseDb(effectiveConfig);
    if (!db) {
      alert("Không thể khởi tạo kết nối database. Vui lòng kiểm tra lại cấu hình.");
      return;
    }

    if (!confirm(`Hành động này sẽ tải ${retreats.length} khóa tu và ${volunteers.length} tình nguyện viên hiện tại từ trình duyệt của bạn lên Cloud. Bạn có muốn tiếp tục?`)) {
      return;
    }

    setSyncStatus("syncing");
    setSyncError("");

    const result = await syncLocalToFirestore(db, retreats, volunteers);
    if (result.success) {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } else {
      setSyncStatus("error");
      setSyncError(result.error || "Lỗi không xác định");
    }
  };

  const handleDisconnectFirebase = () => {
    if (confirm("Bạn có chắc chắn muốn ngắt kết nối với cơ sở dữ liệu Cloud? Ứng dụng sẽ chuyển lại sử dụng bộ nhớ cục bộ trình duyệt.")) {
      setFirebaseConfig(null);
      setFirebaseInput("");
      alert("Đã ngắt kết nối Firebase Cloud Database.");
    }
  };

  // Export database as JSON file
  const handleExportJSON = () => {
    const data = {
      volunteers,
      retreats,
      version: "1.0",
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tnv_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset all data to initial defaults
  const handleResetData = () => {
    if (true) {
      localStorage.removeItem("tnv-manager-volunteers");
      window.location.href = "/";
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div className="page-header-flex">
          <div>
            <h2 className="page-title">Cài Đặt Hệ Thống</h2>
            <p className="page-subtitle">Quản lý cấu hình chung, email template và kết nối Cloud</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} />
            Lưu cài đặt
          </button>
        </div>
      </div>

      <div className="page-body">
        {saved && (
          <div className="toast success" style={{ position: "relative", inset: "auto", marginBottom: 20, animation: "none" }}>
            <CheckCircle size={16} color="var(--green)" />
            Cài đặt đã được lưu thành công!
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          {/* 1. Theme Configuration */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              🎨 Chế Độ Giao Diện (Theme Mode)
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Chuyển đổi giao diện sáng/tối để phù hợp với môi trường làm việc.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className={`btn ${themeMode === "light" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setThemeMode("light")}
                style={{ gap: 6, padding: "10px 16px" }}
              >
                <Sun size={15} /> Giao diện Sáng (Warm Off-white)
              </button>
              <button
                type="button"
                className={`btn ${themeMode === "dark" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setThemeMode("dark")}
                style={{ gap: 6, padding: "10px 16px" }}
              >
                <Moon size={15} /> Giao diện Tối (Forest Dark)
              </button>
            </div>
          </div>

          {/* 2. Firebase Cloud Database Card */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                🔥 Cơ Sở Dữ Liệu Cloud (Firebase Firestore)
              </h3>
              {effectiveConfig ? (
                <span className="badge badge-approved" style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px" }}>
                  <Wifi size={11} /> Cloud Active {isEnvConfig ? "(Biến môi trường)" : ""}
                </span>
              ) : (
                <span className="badge badge-pending" style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px" }}>
                  <Database size={11} /> Offline Local
                </span>
              )}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Lưu trữ và đồng bộ hóa thời gian thực lên đám mây. Đồng nghiệp của bạn có thể cùng lúc truy cập, chỉnh sửa, và theo dõi dữ liệu TNV.
            </p>

            {effectiveConfig ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "var(--bg-secondary)", padding: 14, borderRadius: 8, fontSize: 13, borderLeft: "3px solid var(--accent)" }}>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    ✅ Đang kết nối tới dự án: <code>{effectiveConfig.projectId}</code>
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                    Tất cả các thay đổi về hồ sơ TNV và phân công gia đình sẽ tự động đồng bộ thời gian thực.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={testStatus === "testing"}
                    onClick={async () => {
                      setTestStatus("testing");
                      const db = getFirebaseDb(effectiveConfig);
                      if (db) {
                        const res = await testFirebaseConnection(db);
                        if (res.success) {
                          setTestStatus("success");
                        } else {
                          setTestStatus("error");
                          setTestError(res.error || "Lỗi không xác định");
                        }
                      } else {
                        setTestStatus("error");
                        setTestError("Không thể khởi tạo DB");
                      }
                      setTimeout(() => setTestStatus("idle"), 4000);
                    }}
                    style={{ gap: 6 }}
                  >
                    <Wifi size={14} />
                    {testStatus === "testing" ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={syncStatus === "syncing"}
                    onClick={handlePushToCloud}
                    style={{ gap: 6 }}
                  >
                    <Cloud size={14} />
                    {syncStatus === "syncing" ? "Đang đồng bộ..." : "Đẩy dữ liệu hiện tại lên Cloud"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleDisconnectFirebase}
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "var(--red)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      display: isEnvConfig ? "none" : "flex",
                    }}
                  >
                    Ngắt kết nối Cloud
                  </button>
                </div>

                {testStatus === "success" && (
                  <p style={{ color: "var(--green)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={14} /> Kết nối thành công! Firebase rules đã hợp lệ.
                  </p>
                )}
                {testStatus === "error" && (
                  <p style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={14} /> Lỗi kết nối: {testError}
                  </p>
                )}

                {syncStatus === "success" && (
                  <p style={{ color: "var(--green)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={14} /> Đồng bộ dữ liệu cục bộ lên Firebase Firestore thành công!
                  </p>
                )}

                {syncStatus === "error" && (
                  <p style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={14} /> Lỗi đồng bộ: {syncError}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Dán mã cấu hình Firebase SDK (JSON hoặc Web Object) *</label>
                  <textarea
                    className="form-input"
                    rows={6}
                    style={{ fontFamily: "monospace", fontSize: 12, minHeight: 120 }}
                    placeholder={`Ví dụ:\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "project-id.firebaseapp.com",\n  projectId: "project-id",\n  ...\n};`}
                    value={firebaseInput}
                    onChange={(e) => setFirebaseInput(e.target.value)}
                  />
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                    💡 Tạo một dự án Firebase miễn phí bằng Google account của bạn, tạo cơ sở dữ liệu Cloud Firestore, bật chế độ cho phép đọc/ghi trong Rules, rồi copy mã cấu hình dán vào đây và nhấn "Lưu cài đặt".
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Gmail Template Config */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              ✉️ Mẫu Email Đón Tiếp (Gmail Integration)
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Soạn nội dung email mẫu. Nội dung này sẽ tự động điền khi bạn nhấn nút gửi mail cho tình nguyện viên từ trang hồ sơ.
            </p>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Nội dung Email mẫu</label>
              <textarea
                className="form-input"
                style={{ minHeight: 220, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 }}
                value={localTemplate}
                onChange={(e) => setLocalTemplate(e.target.value)}
                placeholder="Nhập mẫu email..."
              />
            </div>

            <div style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: 8, fontSize: 12 }}>
              <strong style={{ display: "block", marginBottom: 6, color: "var(--text-primary)" }}>
                💡 Các từ khóa thay thế tự động (Placeholders):
              </strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, color: "var(--text-secondary)" }}>
                <div><code>{`{name}`}</code>: Tên TNV</div>
                <div><code>{`{family}`}</code>: Gia đình Pháp đàm</div>
                <div><code>{`{room}`}</code>: Phòng ở</div>
                <div><code>{`{tasks}`}</code>: Các nhiệm vụ</div>
                <div><code>{`{arrivalDate}`}</code>: Ngày đến</div>
                <div><code>{`{departureDate}`}</code>: Ngày rời</div>
              </div>
            </div>
          </div>

          {/* 4. Database and Storage */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              💾 Quản Lý Dữ Liệu & Bộ Nhớ
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Dữ liệu của ứng dụng hiện tại đang được lưu trữ cục bộ trên trình duyệt này.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5, background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: 8 }}>
                <span style={{ color: "var(--text-secondary)" }}>Dung lượng đã sử dụng (localStorage):</span>
                <strong style={{ color: "var(--accent)" }}>{storageSize}</strong>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleExportJSON}
                  style={{ gap: 6 }}
                >
                  <FileJson size={15} /> Sao lưu dữ liệu (Export JSON)
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleResetData}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--red)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    fontWeight: 600,
                    fontSize: 13.5,
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Trash2 size={15} /> Khôi phục cài đặt gốc (Reset)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
