"use client";
import { useState } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { retreatConfig } from "@/shared/config/retreat-config";
import { Retreat } from "@/shared/types/retreat";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, CheckCircle, Clock, XCircle, CreditCard,
  Calendar, Upload, Plus, ChevronRight, Copy, MapPin, Settings
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  // Zustand State
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);
  const retreats = useVolunteerStore((s) => s.retreats);
  const volunteers = useVolunteerStore((s) => s.volunteers);
  const setActiveRetreatId = useVolunteerStore((s) => s.setActiveRetreatId);
  const addRetreat = useVolunteerStore((s) => s.addRetreat);
  const deleteRetreat = useVolunteerStore((s) => s.deleteRetreat);

  // Local State for Creating Retreat
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRetreatName, setNewRetreatName] = useState("");
  const [newLocation, setNewLocation] = useState("Tu viện Vườn Ươm – Làng Mai Thái Lan");
  const [startDate, setStartDate] = useState("2026-07-10");
  const [endDate, setEndDate] = useState("2026-07-20");
  const [duplicateFromId, setDuplicateFromId] = useState("default"); // 'default' or a retreat ID
  const [errorMsg, setErrorMsg] = useState("");

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);

  // Handle retreat selection
  const handleSelectRetreat = (id: string) => {
    setActiveRetreatId(id);
  };

  // Handle creating a new retreat
  const handleCreateRetreat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newRetreatName.trim()) {
      setErrorMsg("Vui lòng nhập tên khóa tu.");
      return;
    }

    const newId = `retreat-${Date.now()}`;
    const now = new Date().toISOString();

    // Determine families & tasks based on duplication selection
    let families = [...retreatConfig.families];
    let tasks = [...retreatConfig.tasks];

    if (duplicateFromId !== "default") {
      const sourceRetreat = retreats.find((r) => r.id === duplicateFromId);
      if (sourceRetreat) {
        families = JSON.parse(JSON.stringify(sourceRetreat.families));
        tasks = [...sourceRetreat.tasks];
      }
    }

    const newRetreat: Retreat = {
      id: newId,
      ten: newRetreatName.trim(),
      diaDiem: newLocation.trim(),
      ngayBatDau: startDate,
      ngayKetThuc: endDate,
      ngayTao: now,
      ngayCapNhat: now,
      families,
      tasks,
    };

    addRetreat(newRetreat);
    setActiveRetreatId(newId);

    // Redirect to Retreat Configuration with isNew flag
    router.push("/cai-dat-retreat?isNew=true");

    // Reset Form
    setNewRetreatName("");
    setShowCreateForm(false);
  };

  // Lọc TNV thuộc khóa tu đang chọn
  const activeVolunteers = volunteers.filter((v) => v.retreatId === activeRetreatId);

  // ────────────────────────────────────────────────────────
  // RENDER MÀN HÌNH CHỌN KHÓA TU (Landed with activeRetreatId = null)
  // ────────────────────────────────────────────────────────
  if (!activeRetreat) {
    return (
      <div className="animate-fade-in" style={{ padding: "16px 16px 32px" }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <h2 className="page-title">Hệ Thống Quản Lý Khóa Tu</h2>
          <p className="page-subtitle">Chọn một khóa tu để tiếp tục quản lý hoặc tạo khóa tu mới</p>
        </div>

        {/* Retreat Selection Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 30 }}>
          {retreats.map((r) => {
            const count = volunteers.filter((v) => v.retreatId === r.id).length;
            const start = new Date(r.ngayBatDau);
            const end = new Date(r.ngayKetThuc);
            const today = new Date();
            let status = "Upcoming"; // Sắp diễn ra
            let statusColor = "var(--accent)";
            let statusBg = "var(--accent-bg)";

            if (today > end) {
              status = "Đã qua";
              statusColor = "var(--text-muted)";
              statusBg = "#e8e3db";
            } else if (today >= start && today <= end) {
              status = "Đang diễn ra";
              statusColor = "var(--green)";
              statusBg = "rgba(74, 222, 128, 0.15)";
            }

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRetreat(r.id)}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  padding: 0,
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(45, 90, 39, 0.12)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "scale(1.04)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--border)";
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "none";
                }}
              >
                {/* Banner Image Container */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "linear-gradient(135deg, #2d5a27 0%, #1c3b18 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderBottom: "1px solid var(--border-light)",
                }}>
                  {r.posterUrl ? (
                    <img
                      src={r.posterUrl}
                      alt={r.ten}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                      }}
                    />
                  ) : (
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 40 }}>🌿</div>
                  )}
                </div>

                {/* Content Container */}
                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{r.ten}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} /> {r.diaDiem}
                      </p>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: statusBg,
                        color: statusColor,
                        borderColor: "transparent",
                        fontSize: 11,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <div style={{ color: "var(--text-secondary)" }}>
                      📅 {start.toLocaleDateString("vi-VN")} - {end.toLocaleDateString("vi-VN")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>{count}</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>TNV</span>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Retreat Card Button */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              justifyContent: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <Plus size={18} /> Tạo Khóa Tu Mới
          </button>
        ) : (
          <div className="card animate-fade-in" style={{ border: "1px solid var(--accent-light)", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>➕ Tạo Khóa Tu Mới</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateForm(false)}>Hủy</button>
            </div>

            <form onSubmit={handleCreateRetreat} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {errorMsg && (
                <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 500 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tên khóa tu *</label>
                <input
                  required
                  className="form-input"
                  placeholder="Ví dụ: Khoá tu người Việt 2026"
                  value={newRetreatName}
                  onChange={(e) => setNewRetreatName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Địa điểm</label>
                <input
                  className="form-input"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sao chép cấu hình (Gia đình, Nhiệm vụ)</label>
                <select
                  className="form-select"
                  value={duplicateFromId}
                  onChange={(e) => setDuplicateFromId(e.target.value)}
                >
                  <option value="default">— Cấu hình mặc định (Mới hoàn toàn) —</option>
                  {retreats.map((r) => (
                    <option key={r.id} value={r.id}>
                      Sao chép cấu hình từ: {r.ten}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  💡 Nhân bản danh sách gia đình pháp đàm & nhiệm vụ để chỉ cần đổi tên, không cần nhập lại từ đầu.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  marginTop: 6,
                  padding: "12px",
                  borderRadius: "8px",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  gap: 6,
                }}
              >
                Tiếp tục thiết lập cấu hình <ChevronRight size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // RENDER DASHBOARD CHO KHÓA TU ACTIVE
  // ────────────────────────────────────────────────────────
  const total = activeVolunteers.length;
  const approved = activeVolunteers.filter((v) => v.trangThai === "Đã duyệt").length;
  const pending = activeVolunteers.filter((v) => v.trangThai === "Đang xét duyệt").length;
  const rejected = activeVolunteers.filter((v) => v.trangThai === "Từ chối").length;
  const paid = activeVolunteers.filter((v) => v.daThanhToan).length;
  const unpaid = total - paid;

  const familyCounts = activeRetreat.families.map((f) => ({
    ...f,
    count: activeVolunteers.filter((v) => v.giaDinhPhapDam === f.id).length,
  }));

  const unassigned = activeVolunteers.filter((v) => !v.giaDinhPhapDam).length;

  const stats = [
    { label: "Tổng TNV", value: total, icon: Users, color: "var(--text-primary)" },
    { label: "Đã duyệt", value: approved, icon: CheckCircle, color: "var(--green)" },
    { label: "Chờ duyệt", value: pending, icon: Clock, color: "var(--amber)" },
    { label: "Từ chối", value: rejected, icon: XCircle, color: "var(--red)" },
    { label: "Đã thanh toán", value: paid, icon: CreditCard, color: "var(--green)" },
    { label: "Chưa thanh toán", value: unpaid, icon: CreditCard, color: "var(--red)" },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {activeRetreat.posterUrl && (
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "10px",
              overflow: "hidden",
              border: "1.5px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              flexShrink: 0,
            }}>
              <img
                src={activeRetreat.posterUrl}
                alt={activeRetreat.ten}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
          <div>
            <h2 className="page-title" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{activeRetreat.ten}</h2>
            <p className="page-subtitle" style={{ margin: "2px 0 0 0" }}>📍 {activeRetreat.diaDiem}</p>
          </div>
        </div>
        <Link
          href="/cai-dat-retreat"
          className="btn"
          style={{
            padding: "8px 18px",
            fontSize: "12.5px",
            fontWeight: 700,
            borderRadius: "999px",
            border: "1.5px solid var(--accent)",
            background: "var(--accent-bg)",
            color: "var(--accent)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px var(--accent-glow)",
            transition: "all 0.15s ease",
            textDecoration: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "translateY(-1.5px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 90, 39, 0.2)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--accent-bg)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 2px 8px var(--accent-glow)";
          }}
        >
          <Settings size={14} /> Edit khoá tu
        </Link>
      </div>

      <div className="page-body">
        {/* Empty State when 0 volunteers */}
        {total === 0 ? (
          <div className="card text-center" style={{ padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>📋</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Chưa có Tình Nguyện Viên
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>
              Khóa tu <strong>{activeRetreat.ten}</strong> vừa được khởi tạo và chưa có dữ liệu hồ sơ. Hãy chọn phương thức tiếp nhận hồ sơ TNV dưới đây.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 10, width: "100%", maxWidth: 320, flexDirection: "column" }}>
              <Link href="/import" className="btn btn-primary" style={{ justifyContent: "center", borderRadius: "8px", padding: 12 }}>
                <Upload size={14} /> Import từ file CSV (Google Sheets)
              </Link>
              <Link href="/tinh-nguyen-vien/moi" className="btn btn-secondary" style={{ justifyContent: "center", borderRadius: "8px", padding: 12 }}>
                <Plus size={14} /> Thêm tình nguyện viên thủ công
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
              {stats.map((s, i) => (
                <div key={i} className={`stat-card animate-fade-in animate-delay-${(i % 4) + 1}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <s.icon size={15} color={s.color} />
                    <span className="stat-label">{s.label}</span>
                  </div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Family Breakdown */}
              <div className="card animate-fade-in animate-delay-1">
                <div className="section-title">🌿 Gia Đình Pháp Đàm</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {familyCounts.map((f) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20, lineHeight: 1 }}>{f.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{f.label}</span>
                          <span style={{ fontSize: 13, color: f.color, fontWeight: 700 }}>{f.count}</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: total > 0 ? `${(f.count / total) * 100}%` : "0%",
                              background: f.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {unassigned > 0 && (
                    <p style={{ fontSize: 12, color: "var(--amber)", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} /> {unassigned} TNV chưa được phân gia đình
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions & Date Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Quick actions */}
                <div className="card animate-fade-in animate-delay-2">
                  <div className="section-title">⚡ Thao Tác Nhanh</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link href="/tinh-nguyen-vien" className="btn btn-secondary" style={{ justifyContent: "flex-start", borderRadius: "8px" }}>
                      <Users size={14} /> Xem danh sách TNV
                    </Link>
                    <Link href="/import" className="btn btn-secondary" style={{ justifyContent: "flex-start", borderRadius: "8px" }}>
                      <Upload size={14} /> Import từ Google Sheets (CSV)
                    </Link>
                    <Link href="/tinh-nguyen-vien/moi" className="btn btn-primary" style={{ justifyContent: "flex-start", borderRadius: "8px" }}>
                      <Plus size={14} /> Thêm TNV thủ công
                    </Link>
                  </div>
                </div>

                {/* Retreat Dates */}
                <div className="card animate-fade-in animate-delay-3">
                  <div className="section-title">📅 Lịch Trình Khóa Tu</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Bắt đầu</span>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(activeRetreat.ngayBatDau).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Kết thúc</span>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(activeRetreat.ngayKetThuc).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 2, color: "var(--text-muted)", fontSize: 12 }}>
                      📍 {activeRetreat.diaDiem}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Volunteers */}
            <div className="card animate-fade-in animate-delay-4" style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="section-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
                  Tình Nguyện Viên Mới Nhất
                </div>
                <Link href="/tinh-nguyen-vien" className="btn btn-ghost btn-sm">
                  Xem tất cả →
                </Link>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Gia đình</th>
                      <th>Nhiệm vụ</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVolunteers.slice(0, 5).map((v) => {
                      const family = activeRetreat.families.find((f) => f.id === v.giaDinhPhapDam);
                      return (
                        <tr key={v.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="avatar">{v.hoTen.split(" ").pop()?.charAt(0) || "T"}</div>
                              <div>
                                <Link href={`/tinh-nguyen-vien/${v.id}`} className="volunteer-name" style={{ textDecoration: "none" }}>
                                  {v.hoTen}
                                </Link>
                                <span className="volunteer-email">{v.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {family ? (
                              <span className="filter-chip active" style={{
                                background: family.bgColor, borderColor: family.color + "60",
                                color: family.color, boxShadow: "none", padding: "3px 10px", fontSize: 12,
                              }}>
                                {family.emoji} {family.label}
                              </span>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12.5 }}>
                            {v.nhiemVu.length > 0 ? v.nhiemVu.join(", ") : <span style={{ color: "var(--text-muted)" }}>—</span>}
                          </td>
                          <td>
                            <span className={`badge ${v.daThanhToan ? "badge-paid" : "badge-unpaid"}`}>
                              {v.daThanhToan ? "✓ Đã TT" : "Chưa TT"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${v.trangThai === "Đã duyệt" ? "badge-approved" : v.trangThai === "Từ chối" ? "badge-rejected" : "badge-pending"}`}>
                              {v.trangThai}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
