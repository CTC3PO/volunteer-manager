"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Save, CheckCircle, ArrowLeft, RefreshCw, Smile } from "lucide-react";
import { FamilyConfig } from "@/shared/config/retreat-config";
import { Retreat } from "@/shared/types/retreat";

// Predefined colors for new families
const PREDEFINED_COLORS = [
  { name: "Xanh lá", hex: "#4ade80", bg: "rgba(74, 222, 128, 0.15)", defaultEmoji: "🎋" },
  { name: "Cam", hex: "#fb923c", bg: "rgba(251, 146, 60, 0.15)", defaultEmoji: "🌸" },
  { name: "Tím", hex: "#a78bfa", bg: "rgba(167, 139, 250, 0.15)", defaultEmoji: "🌳" },
  { name: "Xanh dương", hex: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", defaultEmoji: "🌲" },
  { name: "Ngọc", hex: "#2dd4bf", bg: "rgba(45, 212, 191, 0.15)", defaultEmoji: "🍀" },
  { name: "Hồng", hex: "#f472b6", bg: "rgba(244, 114, 182, 0.15)", defaultEmoji: "🌺" },
  { name: "Đỏ", hex: "#fb7185", bg: "rgba(251, 113, 133, 0.15)", defaultEmoji: "🍁" },
  { name: "Vàng", hex: "#facc15", bg: "rgba(250, 204, 21, 0.15)", defaultEmoji: "🌻" },
];

const STANDARD_TASKS = [
  "Nấu ăn",
  "Tri khách",
  "Làm vườn",
  "Dọn dẹp",
  "Hỗ trợ thiền đường",
  "Hỗ trợ văn phòng",
  "Vận chuyển",
  "Chăm sóc trẻ em",
  "Y tế & Sức khỏe",
];

const STANDARD_EMOJIS = ["🎋", "🌸", "🌳", "🌲", "🍀", "🌺", "🍁", "🌻", "🌿", "🌱", "🧘", "🔔", "☀️", "☁️", "❤️"];

function RetreatConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("isNew") === "true";

  // Zustand State
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);
  const retreats = useVolunteerStore((s) => s.retreats);
  const updateRetreat = useVolunteerStore((s) => s.updateRetreat);
  const deleteRetreat = useVolunteerStore((s) => s.deleteRetreat);

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);

  // Local config state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [moTa, setMoTa] = useState("");
  const [families, setFamilies] = useState<FamilyConfig[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [posterUrl, setPosterUrl] = useState("");

  // State for creating new family
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyEmoji, setNewFamilyEmoji] = useState("🌿");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // State for adding new task
  const [newTaskName, setNewTaskName] = useState("");

  const [saved, setSaved] = useState(false);

  // Load state from active retreat
  useEffect(() => {
    if (activeRetreat) {
      setName(activeRetreat.ten);
      setLocation(activeRetreat.diaDiem);
      setStartDate(activeRetreat.ngayBatDau);
      setEndDate(activeRetreat.ngayKetThuc);
      setMoTa(activeRetreat.moTa || "");
      setFamilies(activeRetreat.families);
      setTasks(activeRetreat.tasks);
      setPosterUrl(activeRetreat.posterUrl || "");
    }
  }, [activeRetreat]);

  if (!activeRetreat) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <h3>Vui lòng chọn một khóa tu</h3>
          <p>Trang này yêu cầu một khóa tu đang hoạt động.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Về trang chủ chọn khóa tu
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateRetreat(activeRetreat.id, {
      ten: name,
      diaDiem: location,
      ngayBatDau: startDate,
      ngayKetThuc: endDate,
      moTa,
      families,
      tasks,
      posterUrl,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/");
    }, 1200);
  };

  const handleDeleteRetreat = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa khóa tu "${activeRetreat.ten}"? Tất cả hồ sơ tình nguyện viên của khóa tu này cũng sẽ bị xóa vĩnh viễn.`)) {
      deleteRetreat(activeRetreat.id);
      router.push("/");
    }
  };

  // Add Family
  const handleAddFamily = () => {
    if (!newFamilyName.trim()) return;

    // Check duplicate
    const newId = `family-${Date.now()}`;
    const colorObj = PREDEFINED_COLORS[selectedColorIdx];

    const newFamily: FamilyConfig = {
      id: newId,
      label: newFamilyName.trim(),
      color: colorObj.hex,
      bgColor: colorObj.bg,
      emoji: newFamilyEmoji,
    };

    setFamilies([...families, newFamily]);
    setNewFamilyName("");

    // Cycle color index
    setSelectedColorIdx((selectedColorIdx + 1) % PREDEFINED_COLORS.length);
    // Pick next default emoji
    setNewFamilyEmoji(PREDEFINED_COLORS[(selectedColorIdx + 1) % PREDEFINED_COLORS.length].defaultEmoji);
  };

  // Remove Family
  const handleRemoveFamily = (id: string) => {
    setFamilies(families.filter((f) => f.id !== id));
  };

  // Add Task
  const handleAddTask = () => {
    if (newTaskName.trim() && !tasks.includes(newTaskName.trim())) {
      setTasks([...tasks, newTaskName.trim()]);
      setNewTaskName("");
    }
  };

  // Remove Task
  const handleRemoveTask = (taskToRemove: string) => {
    setTasks(tasks.filter((t) => t !== taskToRemove));
  };

  // Import Standard Tasks
  const handleImportStandardTasks = () => {
    const nextTasks = [...tasks];
    STANDARD_TASKS.forEach((t) => {
      if (!nextTasks.includes(t)) {
        nextTasks.push(t);
      }
    });
    setTasks(nextTasks);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!isNew && (
            <Link href="/" className="btn btn-ghost btn-sm">
              <ArrowLeft size={15} />
            </Link>
          )}
          <div>
            <h2 className="page-title">
              {isNew ? "Cấu hình khóa tu mới" : "⚙️ Cài đặt Khóa tu"}
            </h2>
            <p className="page-subtitle">
              {isNew
                ? "Thiết lập gia đình Pháp đàm và nhiệm vụ trước khi tiếp nhận TNV"
                : "Thay đổi thông tin hành chính, gia đình và phân công cho khóa tu"}
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ gap: 8, padding: "10px 16px" }}>
          <Save size={15} />
          {isNew ? "Hoàn thành thiết lập & Vào Dashboard" : "Lưu cài đặt"}
        </button>
      </div>

      <div className="page-body">
        {saved && (
          <div className="toast success" style={{ position: "relative", inset: "auto", marginBottom: 20, animation: "none" }}>
            <CheckCircle size={16} color="var(--green)" />
            Cấu hình đã được lưu thành công! Đang quay lại Dashboard...
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          {/* 1. Administrative Info */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              📅 Thông Tin Hành Chính
            </h3>
            <div className="info-grid">
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Tên khóa tu / Chương trình *</label>
                <input required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Địa điểm</label>
                <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <input className="form-input" placeholder="Thông tin tóm tắt..." value={moTa} onChange={(e) => setMoTa(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày bắt đầu</label>
                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày kết thúc</label>
                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Flyer / Poster Khóa Tu</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                  {posterUrl ? (
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      flexShrink: 0
                    }}>
                      <img src={posterUrl} alt="Flyer Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: "8px",
                      border: "2px dashed var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      fontSize: 20,
                      flexShrink: 0
                    }}>
                      🖼️
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="poster-upload-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1.2 * 1024 * 1024) {
                              alert("Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 1.2MB để tối ưu dung lượng lưu trữ.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPosterUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="poster-upload-input" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                        Tải ảnh lên...
                      </label>
                      {posterUrl && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--red)", padding: "4px 8px" }}
                          onClick={() => setPosterUrl("")}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      Hỗ trợ định dạng ảnh JPG, PNG. Ảnh này sẽ hiển thị ở trang chủ và dashboard quản lý.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* 2. Family Settings */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  🌿 Gia Đình Pháp Đàm
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  Nhóm tu học chính của TNV. Thêm, sửa, hoặc xóa gia đình.
                </p>
              </div>

              {/* Families List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 200 }}>
                {families.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic", textAlign: "center", margin: "auto 0" }}>
                    Chưa có gia đình nào được tạo.
                  </p>
                ) : (
                  families.map((f, idx) => (
                    <div key={f.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 10,
                      background: f.bgColor, border: `1px solid ${f.color}35`,
                    }}>
                      <span style={{ fontSize: 20 }}>{f.emoji}</span>
                      <input
                        className="form-input"
                        style={{ background: "rgba(255, 255, 255, 0.6)", padding: "4px 8px", fontSize: 13, border: "none" }}
                        value={f.label}
                        onChange={(e) => {
                          const next = [...families];
                          next[idx] = { ...f, label: e.target.value };
                          setFamilies(next);
                        }}
                      />
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRemoveFamily(f.id)}
                        style={{ color: "var(--red)", padding: 4 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Family Form */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)" }}>➕ Thêm Gia Đình Mới</span>
                
                <div style={{ display: "flex", gap: 8 }}>
                  {/* Emoji selector */}
                  <select
                    className="form-select"
                    style={{ width: 62, padding: "8px 4px", textAlign: "center", fontSize: 16 }}
                    value={newFamilyEmoji}
                    onChange={(e) => setNewFamilyEmoji(e.target.value)}
                  >
                    {STANDARD_EMOJIS.map((em) => <option key={em} value={em}>{em}</option>)}
                  </select>

                  <input
                    className="form-input"
                    placeholder="Tên gia đình (e.g. Cây Trúc)"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddFamily()}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleAddFamily}>
                    Thêm
                  </button>
                </div>

                {/* Color swatches */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {PREDEFINED_COLORS.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: col.hex, border: selectedColorIdx === idx ? "2px solid #1a1a18" : "2px solid transparent",
                        cursor: "pointer", position: "relative",
                        transition: "all 0.15s ease",
                      }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Task Settings */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    🛠 Nhiệm Vụ TNV
                  </h3>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    Công việc phân công tại khóa tu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleImportStandardTasks}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: 11, gap: 4, borderRadius: "6px" }}
                >
                  <RefreshCw size={11} /> Import mẫu
                </button>
              </div>

              {/* Tasks List */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1, minHeight: 200, alignContent: "flex-start" }}>
                {tasks.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic", textAlign: "center", width: "100%", margin: "auto 0" }}>
                    Chưa có nhiệm vụ nào. Nhấp "Import mẫu" để bắt đầu nhanh.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 10px", borderRadius: 20,
                        background: "var(--bg-primary)", border: "1px solid var(--border)",
                        fontSize: 12.5, color: "var(--text-secondary)",
                      }}
                    >
                      <span>{task}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task)}
                        style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", display: "flex", padding: 0 }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Task Form */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 10 }}>➕ Thêm Nhiệm Vụ Mới</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Tên công việc (e.g. Chăm hoa)"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  />
                  <button type="button" className="btn btn-primary" onClick={handleAddTask}>
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Retreat Area (Only for existing retreats) */}
        {!isNew && (
          <div className="card" style={{ marginTop: 24, borderColor: "rgba(239, 68, 68, 0.25)", background: "rgba(239, 68, 68, 0.03)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--red)", marginBottom: 8 }}>
              ⚠️ Vùng Nguy Hiểm
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 16 }}>
              Xóa hoàn toàn khóa tu này và tất cả dữ liệu tình nguyện viên liên quan khỏi trình duyệt. Thao tác này không thể khôi phục.
            </p>
            <button
              type="button"
              className="btn"
              onClick={handleDeleteRetreat}
              style={{
                background: "var(--red)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 13,
                padding: "8px 16px",
                borderRadius: "8px",
              }}
            >
              Xóa Khóa Tu Này
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RetreatConfigPage() {
  return (
    <Suspense fallback={<div className="page-body"><p>Đang tải cấu hình khóa tu...</p></div>}>
      <RetreatConfigContent />
    </Suspense>
  );
}
