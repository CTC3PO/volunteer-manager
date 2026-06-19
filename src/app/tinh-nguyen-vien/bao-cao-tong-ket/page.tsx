"use client";
import { useRouter } from "next/navigation";
import { useVolunteerStore } from "@/shared/lib/store";
import { ArrowLeft, Printer, Calendar, MapPin, Users, Award, ShieldAlert, CreditCard } from "lucide-react";
import Link from "next/link";

export default function BaoCaoTongKetPage() {
  const router = useRouter();
  const volunteers = useVolunteerStore((s) => s.volunteers);
  const retreats = useVolunteerStore((s) => s.retreats);
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);
  const activeVolunteers = volunteers.filter((v) => v.retreatId === activeRetreatId);

  const handlePrint = () => {
    window.print();
  };

  if (!activeRetreat) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Vui lòng chọn khóa tu</h3>
        <p>Cần có một khóa tu hoạt động để xem báo cáo tổng kết.</p>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Về trang chủ
        </Link>
      </div>
    );
  }

  // Calculate statistics
  const total = activeVolunteers.length;
  const approved = activeVolunteers.filter((v) => v.trangThai === "Đã duyệt").length;
  const pending = activeVolunteers.filter((v) => v.trangThai === "Đang xét duyệt").length;
  const rejected = activeVolunteers.filter((v) => v.trangThai === "Từ chối").length;
  const paid = activeVolunteers.filter((v) => v.daThanhToan).length;
  const unpaid = total - paid;
  const qrCodeCount = activeVolunteers.filter((v) => v.phuongThucThanhToan === "QR Code").length;
  const cashCount = activeVolunteers.filter((v) => v.phuongThucThanhToan === "Tiền mặt").length;
  const extraOfferingsTotal = activeVolunteers.reduce((sum, v) => sum + (v.cungDuongThem || 0), 0);

  // Group by Family
  const familyList = activeRetreat.families.map((f) => {
    const members = activeVolunteers.filter((v) => v.giaDinhPhapDam === f.id);
    return { ...f, members };
  });
  const unassignedFamilyMembers = activeVolunteers.filter((v) => !v.giaDinhPhapDam);

  // Group by Task
  const taskList = activeRetreat.tasks.map((task) => {
    const members = activeVolunteers.filter((v) => v.nhiemVu.includes(task));
    return { name: task, members };
  });
  const unassignedTaskMembers = activeVolunteers.filter((v) => !v.nhiemVu || v.nhiemVu.length === 0);

  // Group by Room
  const roomGroups: { [key: string]: typeof activeVolunteers } = {};
  const unassignedRoomMembers: typeof activeVolunteers = [];
  activeVolunteers.forEach((v) => {
    if (v.phong) {
      if (!roomGroups[v.phong]) {
        roomGroups[v.phong] = [];
      }
      roomGroups[v.phong].push(v);
    } else {
      unassignedRoomMembers.push(v);
    }
  });

  // Health / Special attention list
  const specialAttentionList = activeVolunteers.filter(
    (v) => v.thuocKeDon || v.sucKhoeTamThan || v.hanCheTheChat
  );

  return (
    <div className="report-page-wrapper">
      {/* Control Bar (Hidden on print) */}
      <div className="report-control-bar">
        <div className="report-control-left">
          <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)" }}>
            Báo cáo tổng kết khóa tu
          </span>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={15} /> In Báo Cáo
        </button>
      </div>

      {/* Report Content */}
      <div className="report-document">
        {/* Document Header */}
        <div className="doc-header">
          <div className="doc-header-top">
            <span style={{ fontSize: 24 }}>🌿</span>
            <div className="doc-header-org">TU VIỆN VƯỜN ƯƠM — LÀNG MAI THÁI LAN</div>
          </div>
          <h1 className="doc-title">BÁO CÁO TỔNG KẾT KHÓA TU</h1>
          <h2 className="doc-retreat-name">{activeRetreat.ten.toUpperCase()}</h2>
          
          <div className="doc-meta-info">
            <span className="doc-meta-item"><Calendar size={13} /> {new Date(activeRetreat.ngayBatDau).toLocaleDateString("vi-VN")} - {new Date(activeRetreat.ngayKetThuc).toLocaleDateString("vi-VN")}</span>
            <span className="doc-meta-item"><MapPin size={13} /> {activeRetreat.diaDiem}</span>
          </div>
        </div>

        <hr className="doc-divider" />

        {/* Section 1: Statistics */}
        <div className="doc-section">
          <h3 className="section-heading"><Users size={16} /> 1. Số Liệu Thống Kê Tổng Quan</h3>
          
          <div className="report-stats-grid">
            <div className="report-stat-box">
              <span className="report-stat-num">{total}</span>
              <span className="report-stat-lbl">Tổng TNV</span>
            </div>
            <div className="report-stat-box green-border">
              <span className="report-stat-num text-green">{approved}</span>
              <span className="report-stat-lbl">Đã Duyệt</span>
            </div>
            <div className="report-stat-box amber-border">
              <span className="report-stat-num text-amber">{pending}</span>
              <span className="report-stat-lbl">Chờ Duyệt</span>
            </div>
            <div className="report-stat-box red-border">
              <span className="report-stat-num text-red">{rejected}</span>
              <span className="report-stat-lbl">Từ Chối</span>
            </div>
            <div className="report-stat-box">
              <span className="report-stat-num text-green">{paid}</span>
              <span className="report-stat-lbl">Đã Thanh Toán</span>
            </div>
            <div className="report-stat-box">
              <span className="report-stat-num text-red">{unpaid}</span>
              <span className="report-stat-lbl">Chưa Thanh Toán</span>
            </div>
          </div>

          <div className="stats-details-row">
            <div className="stats-details-card">
              <h4 className="card-sub-title"><CreditCard size={13} /> Chi Tiết Giao Dịch & Cúng Dường</h4>
              <table className="report-mini-table">
                <tbody>
                  <tr>
                    <td>Thanh toán QR Code</td>
                    <td className="align-right font-bold">{qrCodeCount} TNV</td>
                  </tr>
                  <tr>
                    <td>Thanh toán Tiền mặt</td>
                    <td className="align-right font-bold">{cashCount} TNV</td>
                  </tr>
                  <tr>
                    <td>Tổng cúng dường thêm</td>
                    <td className="align-right font-bold text-green">{extraOfferingsTotal.toLocaleString("vi-VN")} Baht</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Family distribution */}
        <div className="doc-section">
          <h3 className="section-heading"><Award size={16} /> 2. Phân Bổ Theo Gia Đình Pháp Đàm</h3>
          
          {familyList.map((f) => (
            <div key={f.id} className="report-group-container">
              <h4 className="group-heading" style={{ color: f.color, background: `${f.bgColor}` }}>
                {f.emoji} {f.label} ({f.members.length} người)
              </h4>
              {f.members.length === 0 ? (
                <p className="no-data-msg">Không có tình nguyện viên</p>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>STT</th>
                      <th style={{ width: "30%" }}>Họ và tên</th>
                      <th style={{ width: "25%" }}>Nhiệm vụ</th>
                      <th style={{ width: "15%" }}>Phòng</th>
                      <th style={{ width: "15%" }}>Trạng thái</th>
                      <th style={{ width: "10%" }}>Đã đóng phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.members.map((v, i) => (
                      <tr key={v.id}>
                        <td>{i + 1}</td>
                        <td className="font-bold">{v.hoTen}</td>
                        <td>{v.nhiemVu.join(", ") || "—"}</td>
                        <td>{v.phong || "—"}</td>
                        <td>{v.trangThai}</td>
                        <td>{v.daThanhToan ? "✓ Có" : "✗ Chưa"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}

          {unassignedFamilyMembers.length > 0 && (
            <div className="report-group-container">
              <h4 className="group-heading unassigned-heading">
                ⚠️ Chưa phân gia đình ({unassignedFamilyMembers.length} người)
              </h4>
              <table className="report-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>STT</th>
                    <th style={{ width: "35%" }}>Họ và tên</th>
                    <th style={{ width: "30%" }}>Nhiệm vụ</th>
                    <th style={{ width: "15%" }}>Phòng</th>
                    <th style={{ width: "15%" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedFamilyMembers.map((v, i) => (
                    <tr key={v.id}>
                      <td>{i + 1}</td>
                      <td className="font-bold">{v.hoTen}</td>
                      <td>{v.nhiemVu.join(", ") || "—"}</td>
                      <td>{v.phong || "—"}</td>
                      <td>{v.trangThai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Task breakdown */}
        <div className="doc-section page-break-inside-avoid">
          <h3 className="section-heading"><Award size={16} /> 3. Phân Phối Nhân Sự Theo Nhiệm Vụ</h3>
          
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Nhiệm vụ</th>
                <th style={{ width: "10%" }}>Số lượng</th>
                <th style={{ width: "60%" }}>Danh sách tình nguyện viên</th>
              </tr>
            </thead>
            <tbody>
              {taskList.map((task, i) => (
                <tr key={i}>
                  <td className="font-bold">{task.name}</td>
                  <td>{task.members.length}</td>
                  <td>
                    {task.members.length > 0
                      ? task.members.map((m) => m.hoTen).join(", ")
                      : <em className="text-muted">Không có người phân công</em>}
                  </td>
                </tr>
              ))}
              {unassignedTaskMembers.length > 0 && (
                <tr className="warning-row">
                  <td className="font-bold">⚠️ Chưa phân nhiệm vụ</td>
                  <td>{unassignedTaskMembers.length}</td>
                  <td>{unassignedTaskMembers.map((m) => m.hoTen).join(", ")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .report-page-wrapper {
          min-height: 100vh;
          background: #faf8f5;
          color: #1a1a18;
          padding-bottom: 60px;
        }

        .report-control-bar {
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
        .report-control-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .report-document {
          max-width: 21cm;
          margin: 30px auto;
          background: #fff;
          border: 1px solid #e8e3db;
          padding: 2.5cm 2cm;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          box-sizing: border-box;
        }

        .doc-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .doc-header-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }
        .doc-header-org {
          font-size: 11px;
          font-weight: 700;
          color: #2d5a27;
          letter-spacing: 0.15em;
        }
        .doc-title {
          font-size: 22px;
          font-weight: 800;
          color: #1a1a18;
          margin: 6px 0 2px;
          letter-spacing: -0.01em;
        }
        .doc-retreat-name {
          font-size: 16px;
          font-weight: 700;
          color: #2d5a27;
          margin: 0 0 12px;
        }
        .doc-meta-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 12px;
          color: #5c5a54;
          font-weight: 500;
        }
        .doc-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .doc-divider {
          border: none;
          height: 1.5px;
          background: #2d5a2740;
          margin: 20px 0 24px;
        }

        .doc-section {
          margin-bottom: 30px;
        }
        .section-heading {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a18;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1.5px solid #2d5a27;
          padding-bottom: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Stats Grid */
        .report-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .report-stat-box {
          border: 1px solid #e8e3db;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          background: #fdfcfb;
        }
        .report-stat-num {
          font-size: 20px;
          font-weight: 800;
          color: #1a1a18;
          line-height: 1;
        }
        .report-stat-lbl {
          font-size: 10px;
          color: #9e9a92;
          font-weight: 600;
          margin-top: 5px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .green-border { border-color: #22863a30; background: #edfaef40; }
        .amber-border { border-color: #b4530930; background: #fef9ee40; }
        .red-border { border-color: #c0392b30; background: #fef2f240; }

        .text-green { color: #22863a; }
        .text-amber { color: #b45309; }
        .text-red { color: #c0392b; }

        .stats-details-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .stats-details-card {
          border: 1px solid #e8e3db;
          border-radius: 8px;
          padding: 14px;
          background: #fdfcfb;
        }
        .card-sub-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #5c5a54;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .report-mini-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .report-mini-table td {
          padding: 6px 0;
          border-bottom: 1px solid #f0ede8;
          color: #5c5a54;
        }
        .report-mini-table tr:last-child td {
          border-bottom: none;
        }
        .align-right { text-align: right; }
        .font-bold { font-weight: 700; }

        /* Report Table */
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          margin-top: 10px;
        }
        .report-table th {
          background: #f5f2ee;
          color: #5c5a54;
          font-weight: 700;
          padding: 8px 10px;
          text-align: left;
          border: 1px solid #e8e3db;
        }
        .report-table td {
          padding: 8px 10px;
          border: 1px solid #e8e3db;
          color: #1a1a18;
          vertical-align: middle;
        }
        .no-data-msg {
          font-size: 13px;
          color: #9e9a92;
          font-style: italic;
          margin: 6px 0 10px;
        }

        .report-group-container {
          margin-bottom: 20px;
        }
        .group-heading {
          font-size: 13px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          margin: 12px 0 8px;
        }
        .unassigned-heading {
          background: #fef9ee;
          color: #b45309;
          border: 1px solid #b4530930;
        }

        .warning-row td {
          background: #fef9ee40;
          color: #b45309;
        }
        .danger-row th {
          background: #fef2f2 !important;
          color: #c0392b !important;
        }
        .alert-cell {
          background: #fef2f220;
          font-weight: 500;
          color: #c0392b !important;
        }

        /* Rooms breakdown */
        .rooms-report-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 10px;
        }
        .room-report-card {
          border: 1px solid #e8e3db;
          border-radius: 8px;
          overflow: hidden;
          background: #fdfcfb;
        }
        .room-card-title {
          background: #f5f2ee;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #2d5a27;
          border-bottom: 1px solid #e8e3db;
        }
        .room-card-body {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .room-member-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          border-bottom: 1px solid #f0ede8;
          padding-bottom: 4px;
        }
        .room-member-row:last-child {
          border-bottom: none;
        }

        /* Print formatting */
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-control-bar {
            display: none !important;
          }
          .report-document {
            margin: 0 !important;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            max-width: 100% !important;
          }
          .page-break-before {
            page-break-before: always;
            break-before: page;
          }
          .page-break-inside-avoid,
          .report-group-container,
          .report-table,
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          thead {
            display: table-header-group;
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
