"use client";
import { useParams, useRouter } from "next/navigation";
import { useVolunteerStore } from "@/shared/lib/store";
import { ArrowLeft, Printer, Mail, Phone, MapPin, Shield, Calendar, CreditCard, Award, HeartHandshake, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export default function InHoSoTNVPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const getVolunteer = useVolunteerStore((s) => s.getVolunteer);
  const retreats = useVolunteerStore((s) => s.retreats);

  const volunteer = getVolunteer(id);
  const activeRetreat = retreats.find((r) => r.id === volunteer?.retreatId);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ background: "#fff", minHeight: "100vh" }} />;
  }

  if (!volunteer) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Không tìm thấy tình nguyện viên</h3>
        <p>Hồ sơ tình nguyện viên này không tồn tại hoặc đã bị xóa.</p>
        <Link href="/admin/tinh-nguyen-vien" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Về danh sách
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const family = activeRetreat?.families.find((f) => f.id === volunteer.giaDinhPhapDam);

  const isPdf = (url?: string) => url?.startsWith("data:application/pdf");

  return (
    <div className="profile-print-page">
      {/* Printable controls bar */}
      <div className="print-control-bar">
        <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          Xuất Profile: {volunteer.hoTen}
        </span>
        <button className="btn btn-primary btn-sm" onClick={handlePrint} style={{ gap: 5 }}>
          <Printer size={14} /> In hồ sơ / PDF
        </button>
      </div>

      {/* Main A4 Document */}
      <div className="profile-document">
        {/* Header */}
        <div className="doc-header">
          <div className="doc-header-top">
            <span style={{ fontSize: 24 }}>🌿</span>
            <div className="doc-header-org">TU VIỆN VƯỜN ƯƠM — LÀNG MAI THÁI LAN</div>
          </div>
          <h1 className="doc-title">HỒ SƠ CHI TIẾT TÌNH NGUYỆN VIÊN</h1>
          {activeRetreat && <h2 className="doc-subtitle">Khóa tu: {activeRetreat.ten}</h2>}
        </div>

        <hr className="doc-divider" />

        {/* Profile Core & Portrait Block */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: 20, marginBottom: 24 }}>
          {/* Core Info */}
          <div>
            <h3 className="section-title">1. Thông tin cá nhân</h3>
            <table className="info-table">
              <tbody>
                <tr>
                  <td className="field-lbl">Họ và tên:</td>
                  <td className="field-val font-bold" style={{ fontSize: 15 }}>{volunteer.hoTen}</td>
                </tr>
                <tr>
                  <td className="field-lbl">Ngày sinh:</td>
                  <td className="field-val">{volunteer.ngaySinh} ({volunteer.tuoi} tuổi)</td>
                </tr>
                <tr>
                  <td className="field-lbl">Giới tính:</td>
                  <td className="field-val">{volunteer.gioiTinh}</td>
                </tr>
                <tr>
                  <td className="field-lbl">Quốc tịch:</td>
                  <td className="field-val">{volunteer.quocTich}</td>
                </tr>
                <tr>
                  <td className="field-lbl">Nghề nghiệp:</td>
                  <td className="field-val">{volunteer.ngheNghiep || "—"}</td>
                </tr>
                <tr>
                  <td className="field-lbl">Ngôn ngữ:</td>
                  <td className="field-val">{volunteer.ngonNgu?.join(", ") || "—"}</td>
                </tr>
                <tr>
                  <td className="field-lbl">Số hộ chiếu:</td>
                  <td className="field-val">{volunteer.soHoChieu || "—"} (Hạn: {volunteer.thoiHanHoChieu || "—"})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Portrait Image */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 140,
              height: 180,
              borderRadius: 8,
              border: "1px solid #e8e3db",
              background: "#faf8f5",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32
            }}>
              {volunteer.avatarUrl ? (
                <img src={volunteer.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                "👤"
              )}
            </div>
            <span style={{ fontSize: 10, color: "#9e9a92", marginTop: 6, fontWeight: 500 }}>ẢNH CHÂN DUNG</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="doc-section">
          <h3 className="section-title">2. Thông tin liên lạc & Khẩn cấp</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h4 className="sub-section-title">Liên hệ cá nhân</h4>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="field-lbl">Email:</td>
                    <td className="field-val font-bold">{volunteer.email}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">SĐT:</td>
                    <td className="field-val">{volunteer.soDienThoai}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Ứng dụng:</td>
                    <td className="field-val">{volunteer.ungDungLienLac?.join(", ") || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Địa chỉ:</td>
                    <td className="field-val" style={{ fontSize: 11.5 }}>
                      {volunteer.diaChi.soNhaTenDuong}, {volunteer.diaChi.thanhPho}, {volunteer.diaChi.quocGia}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="sub-section-title">Liên hệ khẩn cấp</h4>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="field-lbl">Người liên hệ:</td>
                    <td className="field-val font-bold">{volunteer.lienHeKhanCap.hoTen || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Mối quan hệ:</td>
                    <td className="field-val">{volunteer.lienHeKhanCap.quanHe || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">SĐT khẩn cấp:</td>
                    <td className="field-val font-bold">{volunteer.lienHeKhanCap.soDienThoai || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Schedule & Flight Info */}
        <div className="doc-section">
          <h3 className="section-title">3. Lịch trình & Chuyến bay</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="field-lbl">Ngày đến:</td>
                    <td className="field-val font-bold text-green">{formatDisplayDate(volunteer.ngayDen)}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Chuyến bay đến:</td>
                    <td className="field-val" style={{ fontSize: 11.5 }}>{volunteer.thongTinChuyenBayDen || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="field-lbl">Ngày rời:</td>
                    <td className="field-val font-bold text-red">{formatDisplayDate(volunteer.ngayRoi)}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Chuyến bay về:</td>
                    <td className="field-val" style={{ fontSize: 11.5 }}>{volunteer.thongTinChuyenBayVe || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial & Spiritual Assignment */}
        <div className="doc-section">
          <h3 className="section-title">4. Sắp xếp thực tập & Tài chính</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h4 className="sub-section-title">Phân công tại tu viện</h4>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="field-lbl">Gia đình Pháp đàm:</td>
                    <td className="field-val font-bold">
                      {family ? `${family.emoji} ${family.label}` : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Nhiệm vụ:</td>
                    <td className="field-val">{volunteer.nhiemVu?.join(", ") || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Phòng ở:</td>
                    <td className="field-val font-bold">{volunteer.phong || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Giới điệp:</td>
                    <td className="field-val">{volunteer.gioiDaTiepNhan?.join(", ") || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="sub-section-title">Giao dịch & Đóng góp</h4>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="field-lbl">Đã thanh toán:</td>
                    <td className="field-val font-bold">
                      {volunteer.daThanhToan ? "✓ Đã thanh toán" : "✗ Chưa thanh toán"}
                    </td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Phương thức:</td>
                    <td className="field-val">{volunteer.phuongThucThanhToan || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Ngày đóng phí:</td>
                    <td className="field-val">{volunteer.ngayThanhToan || "—"}</td>
                  </tr>
                  <tr>
                    <td className="field-lbl">Cúng dường thêm:</td>
                    <td className="field-val font-bold text-green">
                      {volunteer.cungDuongThem ? `${volunteer.cungDuongThem.toLocaleString("vi-VN")} Baht` : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Flight Ticket and Receipt attachments */}
        {(volunteer.veMayBayUrl || volunteer.hoaDonThanhToanUrl) && (
          <div className="doc-section page-break-inside-avoid">
            <h3 className="section-title">5. Chứng từ đính kèm (Vé máy bay / Hóa đơn)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Ticket */}
              <div>
                <h4 className="sub-section-title">Vé máy bay</h4>
                {volunteer.veMayBayUrl ? (
                  isPdf(volunteer.veMayBayUrl) ? (
                    <div className="attachment-pdf-placeholder">
                      📄 File PDF Vé máy bay đính kèm
                    </div>
                  ) : (
                    <div className="attachment-img-wrapper">
                      <img src={volunteer.veMayBayUrl} alt="Vé máy bay" />
                    </div>
                  )
                ) : (
                  <p className="no-attachment">Chưa đính kèm vé máy bay</p>
                )}
              </div>

              {/* Receipt */}
              <div>
                <h4 className="sub-section-title">Hóa đơn đóng phí</h4>
                {volunteer.hoaDonThanhToanUrl ? (
                  isPdf(volunteer.hoaDonThanhToanUrl) ? (
                    <div className="attachment-pdf-placeholder">
                      📄 File PDF Hóa đơn đính kèm
                    </div>
                  ) : (
                    <div className="attachment-img-wrapper">
                      <img src={volunteer.hoaDonThanhToanUrl} alt="Hóa đơn thanh toán" />
                    </div>
                  )
                ) : (
                  <p className="no-attachment">Chưa đính kèm hóa đơn đóng phí</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .profile-print-page {
          min-height: 100vh;
          background: #faf8f5;
          color: #1a1a18;
          padding-bottom: 60px;
        }

        .print-control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background: #fff;
          border-bottom: 1px solid #e8e3db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .profile-document {
          max-width: 21cm;
          margin: 30px auto;
          background: #fff;
          border: 1px solid #e8e3db;
          padding: 2cm;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          box-sizing: border-box;
        }

        .doc-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .doc-header-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }
        .doc-header-org {
          font-size: 11px;
          font-weight: 700;
          color: #2d5a27;
          letter-spacing: 0.15em;
        }
        .doc-title {
          font-size: 21px;
          font-weight: 800;
          color: #1a1a18;
          margin: 4px 0 2px;
        }
        .doc-subtitle {
          font-size: 14px;
          font-weight: 700;
          color: #5c5a54;
          margin: 0;
        }

        .doc-divider {
          border: none;
          height: 1.5px;
          background: #2d5a2740;
          margin: 16px 0 20px;
        }

        .section-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a1a18;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1.5px solid #2d5a27;
          padding-bottom: 5px;
          margin-bottom: 12px;
          margin-top: 18px;
        }

        .sub-section-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #2d5a27;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .info-table td {
          padding: 6px 4px;
          vertical-align: top;
        }
        .field-lbl {
          color: #8a8376;
          font-weight: 500;
          width: 130px;
        }
        .field-val {
          color: #1a1a18;
        }
        .font-bold {
          font-weight: 700;
        }
        .text-green { color: #22863a; }
        .text-red { color: #c0392b; }

        .attachment-pdf-placeholder {
          border: 1px dashed #e8e3db;
          background: #fdfcfb;
          border-radius: 6px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #8a8376;
          font-weight: 500;
        }
        .attachment-img-wrapper {
          border: 1px solid #e8e3db;
          border-radius: 6px;
          height: 110px;
          overflow: hidden;
          background: #faf8f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .attachment-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .no-attachment {
          font-size: 12px;
          color: #9e9a92;
          font-style: italic;
          margin-top: 4px;
        }

        .doc-section {
          margin-bottom: 18px;
        }

        /* Print Override */
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-control-bar {
            display: none !important;
          }
          .profile-document {
            margin: 0 !important;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            max-width: 100% !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}
