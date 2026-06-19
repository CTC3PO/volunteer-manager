"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

function NameTagsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const volunteers = useVolunteerStore((s) => s.volunteers);
  const retreats = useVolunteerStore((s) => s.retreats);
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      setIds(idsParam.split(","));
    }
  }, [searchParams]);

  const selectedVolunteers = volunteers.filter((v) => ids.includes(v.id));

  // Auto print trigger when page load completes
  const handlePrint = () => {
    window.print();
  };

  if (!activeRetreat) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Vui lòng chọn khóa tu</h3>
        <p>Cần có một khóa tu hoạt động để in thẻ name tag.</p>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="print-page-wrapper">
      {/* Print Control Bar (Hidden on print) */}
      <div className="print-control-bar">
        <div className="print-control-left">
          <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)" }}>
            In thẻ tên cho {selectedVolunteers.length} tình nguyện viên (Khóa tu: {activeRetreat.ten})
          </span>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={15} /> In thẻ tên
        </button>
      </div>

      {selectedVolunteers.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <p>Không tìm thấy tình nguyện viên nào để in. Vui lòng quay lại danh sách và chọn TNV.</p>
        </div>
      ) : (
        <div className="badges-print-grid">
          {selectedVolunteers.map((v) => {
            const family = activeRetreat.families.find((f) => f.id === v.giaDinhPhapDam);
            const taskStr = v.nhiemVu && v.nhiemVu.length > 0 ? v.nhiemVu.join(", ") : "—";
            return (
              <div key={v.id} className="badge-card">
                <div className="badge-inner">
                  {/* Badge Header */}
                  <div className="badge-header-section">
                    <span className="badge-header-leaf">🌿</span>
                    <span className="badge-header-title">TU VIỆN VƯỜN ƯƠM</span>
                  </div>

                  {/* Badge Middle (Name) */}
                  <div className="badge-name-section">
                    <h2 className="badge-v-name">{v.hoTen}</h2>
                    <div className="badge-v-retreat">{activeRetreat.ten}</div>
                  </div>

                  {/* Badge Footer Grid */}
                  <div className="badge-footer-grid">
                    <div className="badge-footer-cell">
                      <div className="badge-footer-label">Gia Đình</div>
                      <div 
                        className="badge-footer-val" 
                        style={family ? { color: family.color, fontWeight: 700 } : {}}
                      >
                        {family ? `${family.emoji} ${family.label}` : "—"}
                      </div>
                    </div>
                    <div className="badge-footer-cell">
                      <div className="badge-footer-label">Nhiệm Vụ</div>
                      <div className="badge-footer-val font-semibold">{taskStr}</div>
                    </div>
                    <div className="badge-footer-cell">
                      <div className="badge-footer-label">Phòng</div>
                      <div className="badge-footer-val badge-room-box">{v.phong || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global CSS for page layout and print formatting */}
      <style jsx global>{`
        .print-page-wrapper {
          min-height: 100vh;
          background: #fff;
          color: #1a1a18;
        }

        .print-control-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background: #faf8f5;
          border-bottom: 1px solid #e8e3db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .print-control-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* 2x5 Name Tag grid on A4 */
        .badges-print-grid {
          display: grid;
          grid-template-columns: repeat(2, 9cm);
          grid-auto-rows: 5.5cm;
          grid-gap: 0.6cm;
          justify-content: center;
          padding: 1.5cm 0;
          background: #fff;
        }

        .badge-card {
          width: 9cm;
          height: 5.5cm;
          border: 1px dashed #c0bba9;
          padding: 0.35cm;
          box-sizing: border-box;
          background: #fff;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .badge-inner {
          border: 2px solid #2d5a27;
          border-radius: 8px;
          height: 100%;
          width: 100%;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          background: #fdfcfb;
        }

        .badge-header-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-bottom: 1px dotted #2d5a2740;
          padding-bottom: 5px;
        }
        .badge-header-leaf {
          font-size: 11px;
        }
        .badge-header-title {
          font-size: 9px;
          font-weight: 800;
          color: #2d5a27;
          letter-spacing: 0.12em;
        }

        .badge-name-section {
          text-align: center;
          margin: auto 0;
        }
        .badge-v-name {
          font-size: 19px;
          font-weight: 800;
          color: #1a1a18;
          margin: 0;
          line-height: 1.25;
          text-transform: uppercase;
        }
        .badge-v-retreat {
          font-size: 9.5px;
          color: #5c5a54;
          font-weight: 500;
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        .badge-footer-grid {
          display: grid;
          grid-template-columns: 1.3fr 1.3fr 0.7fr;
          gap: 6px;
          border-top: 1px dotted #2d5a2740;
          padding-top: 6px;
          font-size: 11px;
          text-align: left;
        }
        .badge-footer-cell {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-width: 0;
        }
        .badge-footer-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          color: #9e9a92;
          margin-bottom: 2px;
          letter-spacing: 0.04em;
        }
        .badge-footer-val {
          font-size: 11px;
          color: #1a1a18;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .badge-room-box {
          font-weight: 700;
          color: #2d5a27;
        }

        .font-semibold {
          font-weight: 600;
        }

        /* Print Override styles */
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
          .badges-print-grid {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 1cm 0.5cm;
          }
        }
      `}</style>
    </div>
  );
}

export default function InNameTagsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", background: "#fff", minHeight: "100vh" }}>Đang tải dữ liệu thẻ...</div>}>
      <NameTagsContent />
    </Suspense>
  );
}
