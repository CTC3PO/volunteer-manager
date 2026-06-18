"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useVolunteerStore } from "@/shared/lib/store";
import { Volunteer } from "@/shared/types/volunteer";
import {
  ArrowLeft, Edit2, Save, X, CheckCircle, Clock, XCircle, Trash2,
  Phone, Mail, MapPin, Shield, Heart, BookOpen, Users, Briefcase, Download
} from "lucide-react";

type Tab = "ho-so" | "phan-cong" | "suc-khoe" | "tam-linh";

function InfoItem({ label, value, empty = "—" }: { label: string; value?: string | number | boolean | string[]; empty?: string }) {
  const display = Array.isArray(value)
    ? value.length > 0 ? value.join(", ") : empty
    : value !== undefined && value !== "" && value !== null
      ? String(value)
      : empty;
  const isEmpty = display === empty;

  return (
    <div className="info-item">
      <div className="info-item-label">{label}</div>
      <div className={`info-item-value ${isEmpty ? "empty" : ""}`}>{display}</div>
    </div>
  );
}

export default function VolunteerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Zustand State
  const volunteer = useVolunteerStore((s) => s.getVolunteer(id));
  const updateVolunteer = useVolunteerStore((s) => s.updateVolunteer);
  const deleteVolunteer = useVolunteerStore((s) => s.deleteVolunteer);
  const retreats = useVolunteerStore((s) => s.retreats);
  const emailTemplate = useVolunteerStore((s) => s.emailTemplate);

  const [activeTab, setActiveTab] = useState<Tab>("ho-so");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Volunteer>>(volunteer || {});
  const [saved, setSaved] = useState(false);

  if (!volunteer) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <h3>Không tìm thấy TNV</h3>
          <p>Hồ sơ này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <Link href="/tinh-nguyen-vien" className="btn btn-secondary" style={{ marginTop: 12 }}>
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Find the retreat config associated with this volunteer, or default to the active retreat
  const volunteerRetreat = retreats.find((r) => r.id === volunteer.retreatId) || retreats[0];
  const family = volunteerRetreat?.families.find((f) => f.id === volunteer.giaDinhPhapDam);

  const handleSave = () => {
    updateVolunteer(id, form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const handleCancel = () => {
    setForm(volunteer);
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ của tình nguyện viên "${volunteer.hoTen}" khỏi hệ thống?`)) {
      deleteVolunteer(volunteer.id);
      router.push("/tinh-nguyen-vien");
    }
  };

  const handleSendWelcomeEmail = () => {
    if (!volunteer) return;

    const nameStr = volunteer.hoTen || "";
    const familyStr = family ? `${family.emoji} ${family.label}` : "Chưa phân gia đình";
    const roomStr = volunteer.phong || "Chưa phân phòng";
    const tasksStr = volunteer.nhiemVu && volunteer.nhiemVu.length > 0
      ? volunteer.nhiemVu.join(", ")
      : "Chưa phân công nhiệm vụ";
    const arrivalStr = volunteer.ngayDen
      ? new Date(volunteer.ngayDen).toLocaleDateString("vi-VN")
      : "Chưa rõ ngày";
    const departureStr = volunteer.ngayRoi
      ? new Date(volunteer.ngayRoi).toLocaleDateString("vi-VN")
      : "Chưa rõ ngày";

    const mailBody = emailTemplate
      .replace(/{name}/g, nameStr)
      .replace(/{family}/g, familyStr)
      .replace(/{room}/g, roomStr)
      .replace(/{tasks}/g, tasksStr)
      .replace(/{arrivalDate}/g, arrivalStr)
      .replace(/{departureDate}/g, departureStr);

    const subject = `Thông tin đón tiếp tình nguyện viên - ${nameStr}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(volunteer.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
    
    window.open(gmailUrl, "_blank");
  };

  const set = (key: keyof Volunteer, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ho-so", label: "Hồ Sơ Cá Nhân", icon: <Users size={14} /> },
    { id: "phan-cong", label: "Phân Công", icon: <Briefcase size={14} /> },
    { id: "suc-khoe", label: "Sức Khỏe", icon: <Heart size={14} /> },
    { id: "tam-linh", label: "Tâm Linh", icon: <BookOpen size={14} /> },
  ];

  const data = editing ? form : volunteer;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/tinh-nguyen-vien" className="btn btn-ghost btn-sm">
              <ArrowLeft size={15} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--accent)",
                background: "var(--accent-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt={data.hoTen || ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
                    {(data.hoTen || "").split(" ").pop()?.charAt(0) || "T"}
                  </span>
                )}
              </div>
              <div>
                <h2 className="page-title">{volunteer.hoTen}</h2>
                <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                  {family && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "2px 10px", borderRadius: 20,
                      background: family.bgColor, color: family.color,
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {family.emoji} {family.label}
                    </span>
                  )}
                  <span className={`badge ${
                    volunteer.trangThai === "Đã duyệt" ? "badge-approved" :
                    volunteer.trangThai === "Từ chối" ? "badge-rejected" : "badge-pending"
                  }`}>
                    {volunteer.trangThai === "Đã duyệt" && <CheckCircle size={11} />}
                    {volunteer.trangThai === "Đang xét duyệt" && <Clock size={11} />}
                    {volunteer.trangThai === "Từ chối" && <XCircle size={11} />}
                    {volunteer.trangThai}
                  </span>
                  <span className={`badge ${volunteer.daThanhToan ? "badge-paid" : "badge-unpaid"}`}>
                    {volunteer.daThanhToan ? "✓ Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {editing ? (
              <>
                <button className="btn btn-ghost" onClick={handleCancel}>
                  <X size={15} /> Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={15} /> Lưu thay đổi
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn"
                  onClick={handleDelete}
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    color: "var(--red)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    gap: 5,
                  }}
                >
                  <Trash2 size={14} /> Xóa hồ sơ
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendWelcomeEmail}
                  style={{ gap: 5 }}
                >
                  <Mail size={14} /> Gửi Email
                </button>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  <Edit2 size={15} /> Chỉnh sửa
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick info bar */}
        <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
            <Mail size={13} /> {volunteer.email}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
            <Phone size={13} /> {volunteer.soDienThoai}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
            <MapPin size={13} /> {volunteer.diaChi.thanhPho}, {volunteer.diaChi.quocGia}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
            <Shield size={13} /> HC: {volunteer.soHoChieu}
          </span>
        </div>
      </div>

      <div className="page-body">
        {saved && (
          <div className="toast success" style={{ position: "relative", inset: "auto", marginBottom: 16, animation: "none" }}>
            <CheckCircle size={16} color="var(--green)" />
            Đã lưu thay đổi thành công!
          </div>
        )}

        {/* Tabs */}
        <div className="tab-list">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Hồ sơ */}
        {activeTab === "ho-so" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Personal */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Thông Tin Cá Nhân
              </h3>
              {editing ? (
                <div className="info-grid">
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input className="form-input" value={data.hoTen || ""} onChange={(e) => set("hoTen", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input className="form-input" value={data.ngaySinh || ""} onChange={(e) => set("ngaySinh", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tuổi</label>
                    <input type="number" className="form-input" value={data.tuoi || ""} onChange={(e) => set("tuoi", parseInt(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giới tính</label>
                    <select className="form-select" value={data.gioiTinh || ""} onChange={(e) => set("gioiTinh", e.target.value)}>
                      <option>Nam</option><option>Nữ</option><option>Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nghề nghiệp</label>
                    <input className="form-input" value={data.ngheNghiep || ""} onChange={(e) => set("ngheNghiep", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quốc tịch</label>
                    <input className="form-input" value={data.quocTich || ""} onChange={(e) => set("quocTich", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ảnh chân dung</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="avatar-upload-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              set("avatarUrl", reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="avatar-upload-input" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                        Chọn ảnh...
                      </label>
                      {data.avatarUrl && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--red)", padding: "4px 8px" }}
                          onClick={() => set("avatarUrl", undefined)}
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <InfoItem label="Họ và tên" value={volunteer.hoTen} />
                  <InfoItem label="Ngày sinh" value={volunteer.ngaySinh} />
                  <InfoItem label="Tuổi" value={volunteer.tuoi} />
                  <InfoItem label="Giới tính" value={volunteer.gioiTinh} />
                  <InfoItem label="Nghề nghiệp" value={volunteer.ngheNghiep} />
                  <InfoItem label="Quốc tịch" value={volunteer.quocTich} />
                  <InfoItem label="Ngôn ngữ" value={volunteer.ngonNgu} />
                </div>
              )}
            </div>

            {/* Passport */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Hộ Chiếu
              </h3>
              {editing ? (
                <div className="info-grid">
                  <div className="form-group">
                    <label className="form-label">Số hộ chiếu</label>
                    <input className="form-input" value={data.soHoChieu || ""} onChange={(e) => set("soHoChieu", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời hạn hộ chiếu</label>
                    <input className="form-input" value={data.thoiHanHoChieu || ""} onChange={(e) => set("thoiHanHoChieu", e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <InfoItem label="Số hộ chiếu" value={volunteer.soHoChieu} />
                  <InfoItem label="Thời hạn" value={volunteer.thoiHanHoChieu} />
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Liên Hệ
              </h3>
              {editing ? (
                <div className="info-grid">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={data.email || ""} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-input" value={data.soDienThoai || ""} onChange={(e) => set("soDienThoai", e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <InfoItem label="Email" value={volunteer.email} />
                  <InfoItem label="Số điện thoại" value={volunteer.soDienThoai} />
                  <InfoItem label="Ứng dụng liên lạc" value={volunteer.ungDungLienLac} />
                </div>
              )}
            </div>

            {/* Address */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Địa Chỉ Thường Trú
              </h3>
              {editing ? (
                <div className="info-grid">
                  <div className="form-group" style={{ gridColumn: "1/-1" }}>
                    <label className="form-label">Số nhà, tên đường</label>
                    <input className="form-input" value={(data.diaChi as Volunteer["diaChi"])?.soNhaTenDuong || ""}
                      onChange={(e) => set("diaChi", { ...volunteer.diaChi, soNhaTenDuong: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tỉnh / Thành phố</label>
                    <input className="form-input" value={(data.diaChi as Volunteer["diaChi"])?.thanhPho || ""}
                      onChange={(e) => set("diaChi", { ...volunteer.diaChi, thanhPho: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quốc gia</label>
                    <input className="form-input" value={(data.diaChi as Volunteer["diaChi"])?.quocGia || ""}
                      onChange={(e) => set("diaChi", { ...volunteer.diaChi, quocGia: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mã bưu chính</label>
                    <input className="form-input" value={(data.diaChi as Volunteer["diaChi"])?.maZip || ""}
                      onChange={(e) => set("diaChi", { ...volunteer.diaChi, maZip: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <InfoItem label="Địa chỉ" value={volunteer.diaChi.soNhaTenDuong} />
                  <InfoItem label="Thành phố" value={volunteer.diaChi.thanhPho} />
                  <InfoItem label="Quốc gia" value={volunteer.diaChi.quocGia} />
                  <InfoItem label="Mã bưu chính" value={volunteer.diaChi.maZip} />
                </div>
              )}
            </div>

            {/* Emergency contact */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Liên Hệ Khẩn Cấp
              </h3>
              <div className="info-grid">
                <InfoItem label="Họ tên" value={volunteer.lienHeKhanCap.hoTen} />
                <InfoItem label="Quan hệ" value={volunteer.lienHeKhanCap.quanHe} />
                <InfoItem label="Số điện thoại" value={volunteer.lienHeKhanCap.soDienThoai} />
              </div>
            </div>

            {/* Flight & payment */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Lịch Trình & Chi Phí
              </h3>
              {editing ? (
                <div className="info-grid">
                  <div className="form-group">
                    <label className="form-label">Ngày đến</label>
                    <input type="date" className="form-input" value={data.ngayDen || ""} onChange={(e) => set("ngayDen", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày rời</label>
                    <input type="date" className="form-input" value={data.ngayRoi || ""} onChange={(e) => set("ngayRoi", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chuyến bay đến</label>
                    <input className="form-input" value={(data.thongTinChuyenBayDen as string) || ""}
                      onChange={(e) => set("thongTinChuyenBayDen", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chuyến bay về</label>
                    <input className="form-input" value={(data.thongTinChuyenBayVe as string) || ""}
                      onChange={(e) => set("thongTinChuyenBayVe", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phương thức thanh toán</label>
                    <select className="form-select" value={(data.phuongThucThanhToan as string) || ""}
                      onChange={(e) => set("phuongThucThanhToan", e.target.value)}>
                      <option value="">— Chưa xác định —</option>
                      <option value="QR Code">QR Code</option>
                      <option value="Tiền mặt">Tiền mặt</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày thanh toán</label>
                    <input type="date" className="form-input" value={(data.ngayThanhToan as string) || ""}
                      onChange={(e) => set("ngayThanhToan", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cúng dường thêm (Baht)</label>
                    <input type="number" className="form-input" value={(data.cungDuongThem as number) || ""}
                      onChange={(e) => set("cungDuongThem", parseFloat(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đã thanh toán?</label>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={!!data.daThanhToan}
                        onChange={(e) => set("daThanhToan", e.target.checked)} />
                      Đã thanh toán
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" value={(data.trangThai as string) || ""}
                      onChange={(e) => set("trangThai", e.target.value)}>
                      <option>Đang xét duyệt</option>
                      <option>Đã duyệt</option>
                      <option>Từ chối</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1/-1" }}>
                    <label className="form-label">Vé máy bay</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="ticket-upload-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1.5 * 1024 * 1024) {
                              alert("Kích thước file quá lớn! Vui lòng chọn ảnh nhỏ hơn 1.5MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              set("veMayBayUrl", reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="ticket-upload-input" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                        Tải vé máy bay lên...
                      </label>
                      {data.veMayBayUrl && (
                        <>
                          <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Đã chọn vé</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--red)", padding: "4px 8px" }}
                            onClick={() => set("veMayBayUrl", undefined)}
                          >
                            Xóa vé
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <InfoItem label="Ngày đến" value={volunteer.ngayDen} />
                  <InfoItem label="Ngày rời" value={volunteer.ngayRoi} />
                  <InfoItem label="Chuyến bay đến" value={volunteer.thongTinChuyenBayDen} />
                  <InfoItem label="Chuyến bay về" value={volunteer.thongTinChuyenBayVe} />
                  <InfoItem label="Phương thức TT" value={volunteer.phuongThucThanhToan || "—"} />
                  <InfoItem label="Ngày thanh toán" value={volunteer.ngayThanhToan} />
                  <InfoItem label="Cúng dường thêm" value={volunteer.cungDuongThem ? `${volunteer.cungDuongThem} Baht` : undefined} />
                  <InfoItem label="Đã thanh toán" value={volunteer.daThanhToan ? "✓ Có" : "✗ Chưa"} />
                  
                  <div className="info-item" style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 6 }}>
                    <div className="info-item-label" style={{ marginBottom: 6 }}>Vé máy bay</div>
                    {volunteer.veMayBayUrl ? (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{
                          width: 120,
                          height: 80,
                          borderRadius: 6,
                          overflow: "hidden",
                          border: "1px solid var(--border)",
                          background: "var(--bg-primary)",
                          cursor: "zoom-in"
                        }}
                        onClick={() => window.open(volunteer.veMayBayUrl, "_blank")}
                        title="Click để xem hình ảnh gốc"
                        >
                          <img 
                            src={volunteer.veMayBayUrl} 
                            alt="Vé máy bay" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            Nhấp vào hình ảnh để xem kích thước đầy đủ trong tab mới.
                          </span>
                          <a 
                            href={volunteer.veMayBayUrl} 
                            download={`${volunteer.hoTen.toLowerCase().replace(/\s+/g, "_")}_ve_may_bay.jpg`}
                            className="btn btn-secondary btn-sm"
                            style={{ alignSelf: "flex-start", gap: 5, padding: "5px 10px", fontSize: 11.5, textDecoration: "none" }}
                          >
                            <Download size={12} /> Tải xuống vé
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                        Chưa tải lên vé máy bay
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Phân công */}
        {activeTab === "phan-cong" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Gia Đình Pháp Đàm
              </h3>
              {editing ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button
                    className={`filter-chip ${!data.giaDinhPhapDam ? "active" : ""}`}
                    onClick={() => set("giaDinhPhapDam", undefined)}
                  >
                    Chưa phân công
                  </button>
                  {volunteerRetreat?.families.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => set("giaDinhPhapDam", f.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 20,
                        border: `2px solid ${data.giaDinhPhapDam === f.id ? f.color : "var(--border)"}`,
                        background: data.giaDinhPhapDam === f.id ? f.bgColor : "var(--bg-card)",
                        color: data.giaDinhPhapDam === f.id ? f.color : "var(--text-secondary)",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
              ) : (
                family ? (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", borderRadius: 20,
                    background: family.bgColor, color: family.color,
                    fontSize: 15, fontWeight: 700, border: `1px solid ${family.color}40`,
                  }}>
                    {family.emoji} {family.label}
                  </span>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa được phân gia đình</p>
                )
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Nhiệm Vụ
              </h3>
              {editing ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {volunteerRetreat?.tasks.map((task) => {
                    const currentTasks = (data.nhiemVu as string[]) || [];
                    const isSelected = currentTasks.includes(task);
                    return (
                      <button
                        key={task}
                        onClick={() => {
                          const next = isSelected
                            ? currentTasks.filter((t) => t !== task)
                            : [...currentTasks, task];
                          set("nhiemVu", next);
                        }}
                        className={`filter-chip ${isSelected ? "active" : ""}`}
                        style={{ padding: "7px 14px" }}
                      >
                        {task}
                      </button>
                    );
                  })}
                </div>
              ) : (
                volunteer.nhiemVu.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {volunteer.nhiemVu.map((t) => (
                      <span key={t} style={{
                        padding: "6px 14px", borderRadius: 20,
                        background: "var(--accent-light)", color: "var(--accent)",
                        fontSize: 13, fontWeight: 600,
                        border: "1px solid var(--accent)",
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa được phân nhiệm vụ</p>
                )
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Phòng Ở
              </h3>
              {editing ? (
                <div className="form-group" style={{ maxWidth: 200 }}>
                  <input
                    className="form-input"
                    placeholder="VD: P101, Phòng 02..."
                    value={(data.phong as string) || ""}
                    onChange={(e) => set("phong", e.target.value)}
                  />
                </div>
              ) : (
                volunteer.phong ? (
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 80, height: 80, borderRadius: 12,
                    background: "var(--bg-primary)", border: "2px solid var(--accent)",
                    fontSize: 18, fontWeight: 700, color: "var(--accent)",
                    boxShadow: "0 0 20px var(--accent-glow)",
                  }}>
                    {volunteer.phong}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Chưa được phân phòng</p>
                )
              )}
            </div>
          </div>
        )}

        {/* Tab: Sức khỏe */}
        {activeTab === "suc-khoe" && (
          <div className="card">
            <div className="info-grid" style={{ gap: 20 }}>
              <InfoItem label="Xác nhận sức khỏe tốt" value={volunteer.xacNhanSucKhoe ? "✓ Đã xác nhận" : "✗ Chưa xác nhận"} />
              <InfoItem label="Cam kết y tế" value={volunteer.camKetYTe ? "✓ Đã cam kết" : "✗ Chưa"} />
              <InfoItem label="Bảo hiểm du lịch" value={volunteer.baoHiemDuLich ? "✓ Có bảo hiểm" : "✗ Chưa có"} />
              <InfoItem label="Thuốc kê đơn" value={volunteer.thuocKeDon} />
              <InfoItem label="Sức khỏe tâm thần" value={volunteer.sucKhoeTamThan} />
              <InfoItem label="Hạn chế thể chất" value={volunteer.hanCheTheChat} />
            </div>
          </div>
        )}

        {/* Tab: Tâm linh */}
        {activeTab === "tam-linh" && (
          <div className="card">
            <div className="info-grid" style={{ gap: 20 }}>
              <InfoItem label="Tăng thân" value={volunteer.tangThan} />
              <InfoItem label="Giới đã tiếp nhận" value={volunteer.gioiDaTiepNhan} />
              <div className="info-item" style={{ gridColumn: "1/-1" }}>
                <div className="info-item-label">Mong muốn học hỏi</div>
                <div className="info-item-value" style={{ lineHeight: 1.7 }}>
                  {volunteer.mongMuonHocHoi || <span className="empty">—</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
