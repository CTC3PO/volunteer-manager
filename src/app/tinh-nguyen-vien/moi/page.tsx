"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVolunteerStore } from "@/shared/lib/store";
import { Volunteer } from "@/shared/types/volunteer";
import { ArrowLeft, Save } from "lucide-react";

export default function NewVolunteerPage() {
  const router = useRouter();
  const addVolunteer = useVolunteerStore((s) => s.addVolunteer);
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);
  const retreats = useVolunteerStore((s) => s.retreats);

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);

  const [form, setForm] = useState<Partial<Volunteer>>({
    gioiTinh: "Nữ",
    ungDungLienLac: [],
    diaChi: { soNhaTenDuong: "", thanhPho: "", quocGia: "Việt Nam", maZip: "" },
    lienHeKhanCap: { hoTen: "", quanHe: "", soDienThoai: "" },
    chiPhiPhuongTien: true,
    chiPhiAnUong: true,
    phuongThucThanhToan: "",
    daThanhToan: false,
    xacNhanSucKhoe: true,
    camKetYTe: true,
    baoHiemDuLich: true,
    gioiDaTiepNhan: [],
    nhiemVu: [],
    trangThai: "Đang xét duyệt",
    nguonDuLieu: "manual",
  });

  if (!activeRetreat) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <h3>Vui lòng chọn khóa tu</h3>
          <p>Trang này yêu cầu một khóa tu hoạt động để tiếp nhận tình nguyện viên.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const set = (key: keyof Volunteer, val: unknown) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const volunteer: Volunteer = {
      ...form,
      id: `tnv-${Date.now()}`,
      retreatId: activeRetreatId!,
      ngayTao: now,
      ngayCapNhat: now,
    } as Volunteer;
    addVolunteer(volunteer);
    router.push(`/tinh-nguyen-vien/${volunteer.id}`);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/tinh-nguyen-vien" className="btn btn-ghost btn-sm">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h2 className="page-title">Thêm TNV Mới</h2>
            <p className="page-subtitle">Nhập thông tin tình nguyện viên thủ công cho {activeRetreat.ten}</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Personal */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Thông Tin Cá Nhân
              </h3>
              <div className="info-grid">
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Họ và tên (như hộ chiếu) *</label>
                  <input required className="form-input" placeholder="Nguyễn Thị Lan"
                    value={form.hoTen || ""} onChange={(e) => set("hoTen", e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Ảnh chân dung</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid var(--accent)",
                      background: "var(--accent-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {form.avatarUrl ? (
                        <img
                          src={form.avatarUrl}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>🌿</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      id="new-avatar-upload-input"
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
                    <label htmlFor="new-avatar-upload-input" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                      Chọn ảnh...
                    </label>
                    {form.avatarUrl && (
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
                <div className="form-group">
                  <label className="form-label">Ngày sinh (MM/DD/YYYY)</label>
                  <input className="form-input" placeholder="06/15/1990"
                    value={form.ngaySinh || ""} onChange={(e) => set("ngaySinh", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tuổi</label>
                  <input type="number" className="form-input"
                    value={form.tuoi || ""} onChange={(e) => set("tuoi", parseInt(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select className="form-select" value={form.gioiTinh || "Nữ"} onChange={(e) => set("gioiTinh", e.target.value)}>
                    <option>Nam</option><option>Nữ</option><option>Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nghề nghiệp</label>
                  <input className="form-input" value={form.ngheNghiep || ""} onChange={(e) => set("ngheNghiep", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quốc tịch</label>
                  <input className="form-input" value={form.quocTich || ""} onChange={(e) => set("quocTich", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input required type="email" className="form-input"
                    value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" placeholder="+84 901 234 567"
                    value={form.soDienThoai || ""} onChange={(e) => set("soDienThoai", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số hộ chiếu</label>
                  <input className="form-input" value={form.soHoChieu || ""} onChange={(e) => set("soHoChieu", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thời hạn hộ chiếu</label>
                  <input className="form-input" placeholder="MM/DD/YYYY"
                    value={form.thoiHanHoChieu || ""} onChange={(e) => set("thoiHanHoChieu", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Lịch Trình & Thanh Toán
              </h3>
              <div className="info-grid">
                <div className="form-group">
                  <label className="form-label">Ngày đến</label>
                  <input type="date" className="form-input" value={form.ngayDen || ""} onChange={(e) => set("ngayDen", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày rời</label>
                  <input type="date" className="form-input" value={form.ngayRoi || ""} onChange={(e) => set("ngayRoi", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phương thức thanh toán</label>
                  <select className="form-select" value={form.phuongThucThanhToan || ""}
                    onChange={(e) => set("phuongThucThanhToan", e.target.value)}>
                    <option value="">— Chưa xác định —</option>
                    <option value="QR Code">QR Code</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Đã thanh toán?</label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={!!form.daThanhToan} onChange={(e) => set("daThanhToan", e.target.checked)} />
                    Đã thanh toán
                  </label>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Phân Công (tùy chọn)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Gia đình Pháp đàm</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {activeRetreat.families.map((f) => (
                      <button type="button" key={f.id}
                        onClick={() => set("giaDinhPhapDam", form.giaDinhPhapDam === f.id ? undefined : f.id)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                          border: `2px solid ${form.giaDinhPhapDam === f.id ? f.color : "var(--border)"}`,
                          background: form.giaDinhPhapDam === f.id ? f.bgColor : "var(--bg-card)",
                          color: form.giaDinhPhapDam === f.id ? f.color : "var(--text-secondary)",
                          fontSize: 13, fontWeight: 600, transition: "all 0.15s ease",
                        }}
                      >
                        {f.emoji} {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phòng ở</label>
                  <input className="form-input" style={{ maxWidth: 180 }} placeholder="VD: P101"
                    value={form.phong || ""} onChange={(e) => set("phong", e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Link href="/tinh-nguyen-vien" className="btn btn-ghost">Hủy</Link>
              <button type="submit" className="btn btn-primary">
                <Save size={15} />
                Tạo hồ sơ TNV
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
