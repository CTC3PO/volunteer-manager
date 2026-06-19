"use client";
import { useState, useCallback } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { parseCSV } from "@/shared/lib/csv-parser";
import { Volunteer } from "@/shared/types/volunteer";
import { Upload, CheckCircle, AlertCircle, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ImportState = "idle" | "parsing" | "preview" | "importing" | "done" | "error";

export default function ImportPage() {
  const router = useRouter();
  const addVolunteers = useVolunteerStore((s) => s.addVolunteers);
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);
  const retreats = useVolunteerStore((s) => s.retreats);

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);

  const [state, setState] = useState<ImportState>("idle");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Partial<Volunteer>[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = async (file: File) => {
    if (!activeRetreatId) {
      setError("Không xác định được khóa tu hiện tại. Vui lòng chọn lại khóa tu.");
      setState("error");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Vui lòng chọn file CSV (từ Google Sheets).");
      return;
    }
    setFileName(file.name);
    setState("parsing");
    setError("");
    try {
      const parsed = await parseCSV(file);
      // Map retreatId to all parsed volunteer objects
      const associated = parsed.map((v) => ({
        ...v,
        retreatId: activeRetreatId,
      }));
      setPreview(associated);
      setState("preview");
    } catch {
      setError("Không thể đọc file. Hãy kiểm tra định dạng CSV.");
      setState("error");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [activeRetreatId]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    setState("importing");
    setTimeout(() => {
      addVolunteers(preview as Volunteer[]);
      setState("done");
    }, 500);
  };

  const handleReset = () => {
    setState("idle");
    setPreview([]);
    setFileName("");
    setError("");
  };

  if (!activeRetreat) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <h3>Vui lòng chọn khóa tu</h3>
          <p>Bạn cần chọn một khóa tu hoạt động để import tình nguyện viên.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <h2 className="page-title">Import CSV</h2>
        <p className="page-subtitle">
          Nhập danh sách TNV từ Google Sheets (CSV) cho khóa tu: <strong>{activeRetreat.ten}</strong>
        </p>
      </div>

      <div className="page-body">
        {/* Instructions */}
        <div className="card" style={{ marginBottom: 24, borderLeft: "3px solid var(--accent)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
            📋 Cách lấy file CSV từ Google Form
          </h3>
          <ol style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 2.2, paddingLeft: 20 }}>
            <li>Mở <strong style={{ color: "var(--text-primary)" }}>Google Sheets</strong> được liên kết với form đăng ký TNV</li>
            <li>Chọn menu <strong style={{ color: "var(--text-primary)" }}>File → Download → CSV (.csv)</strong></li>
            <li>Kéo file vừa tải xuống vào ô bên dưới, hoặc nhấn để chọn file</li>
            <li>Xem trước và xác nhận import vào khóa tu: <strong>{activeRetreat.ten}</strong></li>
          </ol>
        </div>

        {state === "idle" && (
          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("csv-input")?.click()}
          >
            <input id="csv-input" type="file" accept=".csv" style={{ display: "none" }} onChange={onFileInput} />
            <Upload size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
              Kéo thả file CSV vào đây
            </p>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              hoặc <span style={{ color: "var(--accent)", textDecoration: "underline", cursor: "pointer" }}>nhấn để chọn file</span>
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
              Chỉ hỗ trợ file .CSV từ Google Sheets
            </p>
          </div>
        )}

        {state === "parsing" && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p>Đang đọc file <strong>{fileName}</strong>...</p>
          </div>
        )}

        {(state === "error") && (
          <div style={{ padding: 24, borderRadius: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--red)" }}>
              <AlertCircle size={18} />
              <strong>{error}</strong>
            </div>
            <button className="btn btn-secondary" onClick={handleReset} style={{ marginTop: 14 }}>
              Thử lại
            </button>
          </div>
        )}

        {state === "preview" && (
          <div>
            <div className="import-preview-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, width: "100%" }}>
                <FileText size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 700, color: "var(--text-primary)", wordBreak: "break-all" }}>{fileName}</p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Tìm thấy <strong style={{ color: "var(--accent)" }}>{preview.length} TNV</strong> — kiểm tra trước khi import vào <strong>{activeRetreat.ten}</strong>
                  </p>
                </div>
              </div>
              <div className="import-preview-actions">
                <button className="btn btn-ghost" onClick={handleReset}>
                  <X size={15} /> Hủy
                </button>
                <button className="btn btn-primary" onClick={handleImport}>
                  <CheckCircle size={15} />
                  Xác nhận import {preview.length} TNV
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--border)" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Ngày đến</th>
                    <th>Ngày rời</th>
                    <th>Giới tính</th>
                    <th>Quốc tịch</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((v, i) => (
                    <tr key={i}>
                      <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                      <td>
                        <span className="volunteer-name">{v.hoTen || <em>Chưa có</em>}</span>
                      </td>
                      <td style={{ fontSize: 12.5 }}>{v.email || "—"}</td>
                      <td style={{ fontSize: 12.5 }}>{v.ngayDen || "—"}</td>
                      <td style={{ fontSize: 12.5 }}>{v.ngayRoi || "—"}</td>
                      <td style={{ fontSize: 12.5 }}>{v.gioiTinh || "—"}</td>
                      <td style={{ fontSize: 12.5 }}>{v.quocTich || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {state === "importing" && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p>Đang import {preview.length} TNV...</p>
          </div>
        )}

        {state === "done" && (
          <div style={{ padding: 32, borderRadius: 12, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", textAlign: "center" }}>
            <CheckCircle size={40} color="var(--green)" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              Import thành công!
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
              Đã thêm <strong style={{ color: "var(--green)" }}>{preview.length} tình nguyện viên</strong> vào khóa tu <strong>{activeRetreat.ten}</strong>.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                Import thêm
              </button>
              <button className="btn btn-primary" onClick={() => router.push("/tinh-nguyen-vien")}>
                Xem danh sách TNV →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
