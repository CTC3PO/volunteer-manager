"use client";
import { useState, useEffect, use } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { Retreat } from "@/shared/types/retreat";
import { getFirebaseDb } from "@/shared/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ArrowLeft, User, Plane, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Design tokens
const C = {
  sage:      "#4d7c5e",
  sageDark:  "#2d5a3d",
  sageLight: "#e8f0eb",
  cream:     "#faf9f6",
  stone:     "#f4f2ee",
  white:     "#ffffff",
  ink:       "#1a2420",
  body:      "#4a5568",
  muted:     "#8b9aa3",
  border:    "#e4e8e3",
};

const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RegistrationFormPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const retreats = useVolunteerStore((s) => s.retreats);
  const firebaseConfig = useVolunteerStore((s) => s.firebaseConfig);
  const [retreat, setRetreat] = useState<Retreat | null>(null);

  // Form Step Wizard
  const [step, setStep] = useState(1);

  // Form Fields
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    ngaySinh: "",
    tuoi: "",
    gioiTinh: "Nam",
    ngheNghiep: "",
    quocTich: "",
    ngonNgu: [] as string[],
    ungDungLienLac: [] as string[],
    
    soHoChieu: "",
    thoiHanHoChieu: "",
    ngayDen: "",
    ngayRoi: "",
    thongTinChuyenBayDen: "",
    thongTinChuyenBayVe: "",
    chiPhiPhuongTien: false,
    chiPhiAnUong: false,
    
    lienHeKhanCapHoTen: "",
    lienHeKhanCapQuanHe: "",
    lienHeKhanCapSoDienThoai: "",
    tangThan: "",
    gioiDaTiepNhan: [] as string[],
    thuocKeDon: "",
    sucKhoeTamThan: "",
    hanCheTheChat: "",
    mongMuonHocHoi: "",
    
    xacNhanSucKhoe: false,
    camKetYTe: false,
    baoHiemDuLich: false
  });

  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const found = retreats.find((r) => r.id === id);
    if (found) {
      setRetreat(found);
    }
  }, [id, retreats]);

  if (!retreat) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.muted, marginBottom: 16 }}>Đang tìm thông tin khóa tu...</p>
          <Link href="/" style={{ color: C.sage, fontWeight: 600, textDecoration: "none" }}>← Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  // Calculate age when DOB changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    let calculatedAge = "";
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age.toString();
    }
    setFormData({ ...formData, ngaySinh: dob, tuoi: calculatedAge });
  };

  const handleLangCheckbox = (lang: string) => {
    const next = formData.ngonNgu.includes(lang)
      ? formData.ngonNgu.filter((l) => l !== lang)
      : [...formData.ngonNgu, lang];
    setFormData({ ...formData, ngonNgu: next });
  };

  const handleAppCheckbox = (app: string) => {
    const next = formData.ungDungLienLac.includes(app)
      ? formData.ungDungLienLac.filter((a) => a !== app)
      : [...formData.ungDungLienLac, app];
    setFormData({ ...formData, ungDungLienLac: next });
  };

  const handlePreceptCheckbox = (prec: string) => {
    const next = formData.gioiDaTiepNhan.includes(prec)
      ? formData.gioiDaTiepNhan.filter((p) => p !== prec)
      : [...formData.gioiDaTiepNhan, prec];
    setFormData({ ...formData, gioiDaTiepNhan: next });
  };

  // Step Nav validation
  const validateStep = (currentStep: number) => {
    setValidationError("");
    if (currentStep === 1) {
      if (!formData.hoTen.trim()) return "Vui lòng điền Họ và tên.";
      if (!formData.email.trim()) return "Vui lòng điền Email liên hệ.";
      if (!formData.soDienThoai.trim()) return "Vui lòng điền Số điện thoại.";
      if (!formData.quocTich.trim()) return "Vui lòng điền Quốc tịch.";
      if (!formData.ngaySinh) return "Vui lòng chọn Ngày sinh.";
    } else if (currentStep === 2) {
      if (!formData.ngayDen) return "Vui lòng chọn Ngày đến dự kiến.";
      if (!formData.ngayRoi) return "Vui lòng chọn Ngày đi dự kiến.";
    } else if (currentStep === 3) {
      if (!formData.lienHeKhanCapHoTen.trim()) return "Vui lòng điền Họ tên người liên hệ khẩn cấp.";
      if (!formData.lienHeKhanCapSoDienThoai.trim()) return "Vui lòng điền SĐT liên hệ khẩn cấp.";
      if (!formData.xacNhanSucKhoe || !formData.camKetYTe || !formData.baoHiemDuLich) {
        return "Vui lòng xác nhận các điều khoản về Sức khỏe, Y tế và Bảo hiểm.";
      }
    }
    return "";
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      setValidationError(err);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(3);
    if (err) {
      setValidationError(err);
      return;
    }

    setStatus("sending");
    setValidationError("");

    const id = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const payload = {
      id,
      retreatId: retreat.id,
      hoTen: formData.hoTen.trim(),
      email: formData.email.trim(),
      soDienThoai: formData.soDienThoai.trim(),
      ngaySinh: formData.ngaySinh,
      tuoi: parseInt(formData.tuoi) || 0,
      gioiTinh: formData.gioiTinh,
      ngheNghiep: formData.ngheNghiep.trim(),
      quocTich: formData.quocTich.trim(),
      ngonNgu: formData.ngonNgu,
      ungDungLienLac: formData.ungDungLienLac,
      
      soHoChieu: formData.soHoChieu.trim(),
      thoiHanHoChieu: formData.thoiHanHoChieu,
      ngayDen: formData.ngayDen,
      ngayRoi: formData.ngayRoi,
      thongTinChuyenBayDen: formData.thongTinChuyenBayDen.trim() || undefined,
      thongTinChuyenBayVe: formData.thongTinChuyenBayVe.trim() || undefined,
      
      chiPhiPhuongTien: formData.chiPhiPhuongTien,
      chiPhiAnUong: formData.chiPhiAnUong,
      
      diaChi: {
        soNhaTenDuong: "",
        thanhPho: "",
        quocGia: formData.quocTich.trim(),
        maZip: ""
      },
      
      lienHeKhanCap: {
        hoTen: formData.lienHeKhanCapHoTen.trim(),
        quanHe: formData.lienHeKhanCapQuanHe.trim(),
        soDienThoai: formData.lienHeKhanCapSoDienThoai.trim()
      },
      
      tangThan: formData.tangThan.trim() || undefined,
      gioiDaTiepNhan: formData.gioiDaTiepNhan.length > 0 ? formData.gioiDaTiepNhan : ["Chưa tiếp nhận"],
      thuocKeDon: formData.thuocKeDon.trim() || undefined,
      sucKhoeTamThan: formData.sucKhoeTamThan.trim() || undefined,
      hanCheTheChat: formData.hanCheTheChat.trim() || undefined,
      mongMuonHocHoi: formData.mongMuonHocHoi.trim() || undefined,
      
      nhiemVu: [],
      trangThai: "Đang xét duyệt",
      nguonDuLieu: "form",
      ngayTao: now,
      ngayCapNhat: now
    };

    try {
      const { getEffectiveConfig } = await import("@/shared/lib/store");
      const { getFirebaseDb } = await import("@/shared/lib/firebase");
      
      const effectiveConfig = getEffectiveConfig(firebaseConfig);
      const db = getFirebaseDb(effectiveConfig);
      
      if (db) {
        await setDoc(doc(db, "volunteers", id), payload);
        setStatus("ok");
      } else {
        // Fallback if db config not ready, write to local Zustand store directly (which then syncs once db is ready)
        useVolunteerStore.getState().addVolunteer(payload as any);
        setStatus("ok");
      }
    } catch (e) {
      console.error("Submission failed:", e);
      setStatus("err");
    }
  };

  const inpStyle = { width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14.5, outline: "none", fontFamily: FONT, background: "#fafafa", boxSizing: "border-box" as const, color: C.ink };
  const selectStyle = { ...inpStyle, appearance: "none" as const };
  const lblStyle = { fontSize: 11.5, fontWeight: 700, color: C.body, display: "block", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.06em" };

  return (
    <div style={{ fontFamily: FONT, color: C.ink, background: C.cream, minHeight: "100vh", paddingBottom: 80 }}>
      
      {/* Top Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100, height: 60,
        background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 24px"
      }}>
        <button 
          onClick={() => router.push(`/retreat/${retreat.id}`)}
          style={{ 
            background: "none", border: "none", cursor: "pointer", 
            display: "flex", alignItems: "center", gap: 8, 
            fontSize: 14, fontWeight: 600, color: C.body, padding: 0
          }}
        >
          <ArrowLeft size={16} /> Quay lại trang thông tin
        </button>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px 0" }}>
        
        {/* Progress Bar & Title */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.sage, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ĐƠN ĐĂNG KÝ PHỤNG SỰ
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 8px", color: C.ink }}>
            {retreat.ten}
          </h2>
          <p style={{ fontSize: 13.5, color: C.muted, margin: "0 0 24px" }}>
            Vui lòng điền thông tin trung thực để ban tổ chức sắp xếp công việc và chỗ ở.
          </p>

          {status !== "ok" && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: step >= s ? C.sage : "transparent",
                    border: `2px solid ${step >= s ? C.sage : C.border}`,
                    color: step >= s ? "#fff" : C.muted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12.5, fontWeight: 700
                  }}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div style={{
                      width: 48, height: 2,
                      background: step > s ? C.sage : C.border,
                      marginLeft: 8, marginRight: 8
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Core */}
        {status === "ok" ? (
          <div className="reveal" style={{ background: C.white, borderRadius: 24, padding: "48px 32px", border: `1px solid ${C.border}`, textAlign: "center", boxShadow: "0 12px 36px rgba(77, 124, 94, 0.05)" }}>
            <CheckCircle2 size={56} color={C.sage} style={{ margin: "0 auto 20px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: "0 0 10px" }}>Đăng Ký Thành Công!</h2>
            <p style={{ fontSize: 14.5, color: C.body, lineHeight: 1.6, margin: "0 0 28px", fontWeight: 300 }}>
              Hồ sơ của bạn đã được ghi nhận trên hệ thống nội bộ của tu viện Vườn Ươm. 
              Ban tổ chức sẽ xem xét thông tin và liên hệ xác nhận chi tiết qua Email trong vòng 3–5 ngày tới.
            </p>
            <button 
              onClick={() => router.push("/")}
              style={{ 
                background: C.sage, color: "#fff", border: "none", borderRadius: 999,
                padding: "12px 36px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(77, 124, 94, 0.25)"
              }}
            >
              Về trang chủ Vườn Ươm
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: C.white, borderRadius: 24, padding: "36px 32px", border: `1px solid ${C.border}`, boxShadow: "0 12px 36px rgba(77, 124, 94, 0.03)" }}>
            
            {validationError && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", background: "#fff5f5", border: "1.5px solid #feb2b2",
                borderRadius: 10, color: "#c53030", fontSize: 13.5, fontWeight: 500, marginBottom: 20
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 800, borderBottom: `1.5px solid ${C.stone}`, paddingBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={18} color={C.sage} /> 1. Thông tin cá nhân
                </h3>

                <div className="form-group">
                  <label style={lblStyle}>Họ và tên *</label>
                  <input required placeholder="Ví dụ: Nguyễn Văn A" value={formData.hoTen} onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })} style={inpStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label style={lblStyle}>Ngày sinh *</label>
                    <input required type="date" value={formData.ngaySinh} onChange={handleDobChange} style={inpStyle} />
                  </div>
                  <div className="form-group">
                    <label style={lblStyle}>Tuổi</label>
                    <input readOnly placeholder="Hệ thống tự tính" value={formData.tuoi} style={{ ...inpStyle, background: "#f1f1f1", cursor: "not-allowed" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label style={lblStyle}>Giới tính</label>
                    <select value={formData.gioiTinh} onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })} style={selectStyle}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={lblStyle}>Nghề nghiệp</label>
                    <input placeholder="Học sinh, kỹ sư, tự do..." value={formData.ngheNghiep} onChange={(e) => setFormData({ ...formData, ngheNghiep: e.target.value })} style={inpStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label style={lblStyle}>Quốc tịch *</label>
                    <input required placeholder="Ví dụ: Việt Nam" value={formData.quocTich} onChange={(e) => setFormData({ ...formData, quocTich: e.target.value })} style={inpStyle} />
                  </div>
                  <div className="form-group">
                    <label style={lblStyle}>Số điện thoại *</label>
                    <input required placeholder="Ví dụ: 0912345678" value={formData.soDienThoai} onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })} style={inpStyle} />
                  </div>
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Email nhận tin *</label>
                  <input required type="email" placeholder="example@gmail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inpStyle} />
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Ngôn ngữ sử dụng (Chọn nhiều)</label>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                    {["Tiếng Việt", "Tiếng Anh", "Tiếng Thái", "Tiếng Pháp"].map((lang) => (
                      <label key={lang} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
                        <input type="checkbox" checked={formData.ngonNgu.includes(lang)} onChange={() => handleLangCheckbox(lang)} style={{ accentColor: C.sage }} />
                        {lang}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Ứng dụng liên lạc bạn dùng</label>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                    {["Zalo", "Whatsapp", "Viber"].map((app) => (
                      <label key={app} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
                        <input type="checkbox" checked={formData.ungDungLienLac.includes(app)} onChange={() => handleAppCheckbox(app)} style={{ accentColor: C.sage }} />
                        {app}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Passport & Travel */}
            {step === 2 && (
              <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 800, borderBottom: `1.5px solid ${C.stone}`, paddingBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <Plane size={18} color={C.sage} /> 2. Hộ chiếu & Di chuyển
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label style={lblStyle}>Số hộ chiếu</label>
                    <input placeholder="Điền nếu ngoài VN" value={formData.soHoChieu} onChange={(e) => setFormData({ ...formData, soHoChieu: e.target.value })} style={inpStyle} />
                  </div>
                  <div className="form-group">
                    <label style={lblStyle}>Thời hạn hộ chiếu</label>
                    <input type="date" value={formData.thoiHanHoChieu} onChange={(e) => setFormData({ ...formData, thoiHanHoChieu: e.target.value })} style={inpStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label style={lblStyle}>Ngày đến dự kiến *</label>
                    <input required type="date" value={formData.ngayDen} onChange={(e) => setFormData({ ...formData, ngayDen: e.target.value })} style={inpStyle} />
                  </div>
                  <div className="form-group">
                    <label style={lblStyle}>Ngày rời dự kiến *</label>
                    <input required type="date" value={formData.ngayRoi} onChange={(e) => setFormData({ ...formData, ngayRoi: e.target.value })} style={inpStyle} />
                  </div>
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Thông tin chuyến bay ĐẾN (Mã hiệu bay, giờ hạ cánh)</label>
                  <input placeholder="Ví dụ: VJ901 hạ cánh lúc 13:00 tại BKK" value={formData.thongTinChuyenBayDen} onChange={(e) => setFormData({ ...formData, thongTinChuyenBayDen: e.target.value })} style={inpStyle} />
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Thông tin chuyến bay VỀ (Mã hiệu bay, giờ cất cánh)</label>
                  <input placeholder="Ví dụ: VJ902 bay lúc 17:00 từ BKK" value={formData.thongTinChuyenBayVe} onChange={(e) => setFormData({ ...formData, thongTinChuyenBayVe: e.target.value })} style={inpStyle} />
                </div>

                <div className="form-group" style={{ background: C.stone, padding: "16px 18px", borderRadius: 12, marginTop: 10 }}>
                  <label style={{ ...lblStyle, color: C.ink, marginBottom: 8 }}>Hoan hỷ đóng góp chi phí sinh hoạt (tự nguyện)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, cursor: "pointer", lineHeight: 1.4 }}>
                      <input type="checkbox" checked={formData.chiPhiPhuongTien} onChange={(e) => setFormData({ ...formData, chiPhiPhuongTien: e.target.checked })} style={{ accentColor: C.sage, marginTop: 3 }} />
                      <span>Đóng góp phương tiện đưa đón 2 chiều (bến xe/sân bay) [1,400 Baht]</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, cursor: "pointer", lineHeight: 1.4 }}>
                      <input type="checkbox" checked={formData.chiPhiAnUong} onChange={(e) => setFormData({ ...formData, chiPhiAnUong: e.target.checked })} style={{ accentColor: C.sage, marginTop: 3 }} />
                      <span>Đóng góp thực phẩm ăn uống & điện nước tại Tu viện [2,400 Baht]</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Practice & Health */}
            {step === 3 && (
              <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: 16, fontWeight: 800, borderBottom: `1.5px solid ${C.stone}`, paddingBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldAlert size={18} color={C.sage} /> 3. Sức khỏe & Thực tập tâm linh
                </h3>

                {/* Emergency Contact */}
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, background: "#fafafa" }}>
                  <label style={{ ...lblStyle, color: C.sage, borderBottom: `1px solid ${C.border}`, paddingBottom: 4, marginBottom: 10 }}>Liên hệ khẩn cấp *</label>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label style={{ ...lblStyle, fontSize: 10.5 }}>Họ và tên người liên hệ *</label>
                    <input required placeholder="Ví dụ: Nguyễn Văn B" value={formData.lienHeKhanCapHoTen} onChange={(e) => setFormData({ ...formData, lienHeKhanCapHoTen: e.target.value })} style={inpStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ ...lblStyle, fontSize: 10.5 }}>Mối quan hệ *</label>
                      <input required placeholder="Bố mẹ, vợ chồng..." value={formData.lienHeKhanCapQuanHe} onChange={(e) => setFormData({ ...formData, lienHeKhanCapQuanHe: e.target.value })} style={inpStyle} />
                    </div>
                    <div>
                      <label style={{ ...lblStyle, fontSize: 10.5 }}>SĐT liên hệ *</label>
                      <input required placeholder="Số điện thoại" value={formData.lienHeKhanCapSoDienThoai} onChange={(e) => setFormData({ ...formData, lienHeKhanCapSoDienThoai: e.target.value })} style={inpStyle} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Giới luật đã tiếp nhận</label>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                    {["5 Giới", "14 Giới"].map((prec) => (
                      <label key={prec} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
                        <input type="checkbox" checked={formData.gioiDaTiepNhan.includes(prec)} onChange={() => handlePreceptCheckbox(prec)} style={{ accentColor: C.sage }} />
                        {prec}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Tăng thân thực tập đang tham gia (nếu có)</label>
                  <input placeholder="Tên tăng thân hoặc nhóm thiền bạn đang sinh hoạt" value={formData.tangThan} onChange={(e) => setFormData({ ...formData, tangThan: e.target.value })} style={inpStyle} />
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Thuốc kê đơn đang sử dụng (nếu có)</label>
                  <textarea placeholder="Ghi rõ tên thuốc và liều lượng sử dụng..." rows={2} value={formData.thuocKeDon} onChange={(e) => setFormData({ ...formData, thuocKeDon: e.target.value })} style={{ ...inpStyle, resize: "vertical" }} />
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Tiền sử hoặc vấn đề sức khỏe tâm thần (nếu có)</label>
                  <textarea placeholder="Trầm cảm, lo âu,... ban tổ chức cam kết bảo mật tuyệt đối..." rows={2} value={formData.sucKhoeTamThan} onChange={(e) => setFormData({ ...formData, sucKhoeTamThan: e.target.value })} style={{ ...inpStyle, resize: "vertical" }} />
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Hạn chế về thể chất / Chấn thương (nếu có)</label>
                  <textarea placeholder="Đau lưng, khó đi lại đồi dốc, cần nằm giường tầng dưới..." rows={2} value={formData.hanCheTheChat} onChange={(e) => setFormData({ ...formData, hanCheTheChat: e.target.value })} style={{ ...inpStyle, resize: "vertical" }} />
                </div>

                <div className="form-group">
                  <label style={lblStyle}>Lý do / Mong muốn học hỏi khi tham gia phụng sự</label>
                  <textarea placeholder="Những trải nghiệm bạn kỳ vọng gặt hái được..." rows={3} value={formData.mongMuonHocHoi} onChange={(e) => setFormData({ ...formData, mongMuonHocHoi: e.target.value })} style={{ ...inpStyle, resize: "vertical" }} />
                </div>

                {/* Confirmations */}
                <div style={{ background: "#fffaf0", padding: "16px 18px", borderRadius: 12, border: "1px solid #feebc8", display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer", lineHeight: 1.4 }}>
                    <input required type="checkbox" checked={formData.xacNhanSucKhoe} onChange={(e) => setFormData({ ...formData, xacNhanSucKhoe: e.target.checked })} style={{ accentColor: C.sage, marginTop: 3 }} />
                    <span>Tôi xác nhận tình trạng sức khỏe ổn định để sinh hoạt thiền môn. *</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer", lineHeight: 1.4 }}>
                    <input required type="checkbox" checked={formData.camKetYTe} onChange={(e) => setFormData({ ...formData, camKetYTe: e.target.checked })} style={{ accentColor: C.sage, marginTop: 3 }} />
                    <span>Tôi cam kết tự chịu trách nhiệm về các vấn đề y tế phát sinh cá nhân. *</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer", lineHeight: 1.4 }}>
                    <input required type="checkbox" checked={formData.baoHiemDuLich} onChange={(e) => setFormData({ ...formData, baoHiemDuLich: e.target.checked })} style={{ accentColor: C.sage, marginTop: 3 }} />
                    <span>Tôi có bảo hiểm du lịch quốc tế hợp lệ cho hành trình sang Thái Lan. *</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 24, marginTop: 28 }}>
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  style={{
                    flex: 1, padding: "12px", background: C.stone, color: C.body,
                    border: "none", borderRadius: 999, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  style={{
                    flex: 2, padding: "12px", background: C.sage, color: "#fff",
                    border: "none", borderRadius: 999, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 4px 14px rgba(77, 124, 94, 0.2)"
                  }}
                >
                  Tiếp theo <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={status === "sending"}
                  style={{
                    flex: 2, padding: "12px", background: C.sage, color: "#fff",
                    border: "none", borderRadius: 999, fontSize: 14, fontWeight: 700,
                    cursor: status === "sending" ? "not-allowed" : "pointer", 
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 4px 14px rgba(77, 124, 94, 0.25)",
                    opacity: status === "sending" ? 0.7 : 1
                  }}
                >
                  {status === "sending" ? "Đang gửi đăng ký..." : "Gửi Đơn Đăng Ký"}
                </button>
              )}
            </div>

          </form>
        )}

      </div>

      <style>{`
        /* Keyframe animation */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reveal {
          animation: slideUp 0.4s ease-out both;
        }
      `}</style>

    </div>
  );
}
