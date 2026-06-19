"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useVolunteerStore } from "@/shared/lib/store";
import { exportToExcel } from "@/features/export/export-excel";
import { Volunteer, TrangThaiTNV } from "@/shared/types/volunteer";
import { Search, Download, Plus, Check, ChevronDown, Printer, Mail, Copy, Trash2 } from "lucide-react";

/* ── Design Tokens ── */
const T = {
  bg: "var(--bg-base)", surface: "var(--bg-surface)", subtle: "var(--bg-subtle)", muted: "var(--bg-muted)",
  border: "var(--border)", borderLight: "var(--border-light)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)",
  accent: "var(--accent)", accentBg: "var(--accent-bg)",
  green: "var(--green)", greenBg: "var(--green-bg)",
  amber: "var(--amber)", amberBg: "var(--amber-bg)",
  red: "var(--red)",   redBg: "var(--red-bg)",
};

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

/* ── Inline cell popover ── */
type PopoverProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};
function Popover({ anchorEl, open, onClose, children }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorEl]);

  if (!open || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + 4;
  const left = Math.min(rect.left, window.innerWidth - 200);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", zIndex: 999,
        top, left,
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
        padding: 6, minWidth: 170,
        animation: "fadeIn 0.12s ease",
      }}
    >
      {children}
    </div>
  );
}

function PopBtn({
  children, selected, onClick, color,
}: { children: React.ReactNode; selected?: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "7px 10px", border: "none",
        borderRadius: 8, fontSize: 13, cursor: "pointer",
        background: selected ? T.accentBg : "transparent",
        color: selected ? T.accent : (color || T.text),
        fontWeight: selected ? 600 : 400, fontFamily: "inherit",
        textAlign: "left", transition: "background 0.1s",
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = T.muted; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {selected && <Check size={12} color={T.accent} />}
      {children}
    </button>
  );
}

/* ── Family cell ── */
function FamilyCell({ volunteerId, value }: { volunteerId: string; value?: string }) {
  const update = useVolunteerStore(s => s.updateVolunteer);
  const activeRetreatId = useVolunteerStore(s => s.activeRetreatId);
  const retreats = useVolunteerStore(s => s.retreats);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const activeRetreat = retreats.find(r => r.id === activeRetreatId);

  if (!activeRetreat) return null;
  const family = activeRetreat.families.find(f => f.id === value);

  return (
    <>
      <div
        onClick={e => setAnchor(anchor ? null : e.currentTarget)}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        {family ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 999,
            background: family.bgColor, color: family.color,
            fontSize: 12, fontWeight: 600, border: `1px solid ${family.color}50`,
          }}>
            {family.emoji} {family.label}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: T.textMut, fontStyle: "italic" }}>— chọn —</span>
        )}
        <ChevronDown size={10} color={T.textMut} />
      </div>
      <Popover anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <PopBtn selected={!value} onClick={() => { update(volunteerId, { giaDinhPhapDam: undefined }); setAnchor(null); }}>
          <span style={{ color: T.textMut }}>— Chưa phân —</span>
        </PopBtn>
        {activeRetreat.families.map(f => (
          <PopBtn key={f.id} selected={value === f.id}
            onClick={() => { update(volunteerId, { giaDinhPhapDam: f.id }); setAnchor(null); }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 8px", borderRadius: 999,
              background: f.bgColor, color: f.color, fontSize: 12, fontWeight: 600,
            }}>{f.emoji} {f.label}</span>
          </PopBtn>
        ))}
      </Popover>
    </>
  );
}

/* ── Task cell ── */
function TaskCell({ volunteerId, value }: { volunteerId: string; value: string[] }) {
  const update = useVolunteerStore(s => s.updateVolunteer);
  const activeRetreatId = useVolunteerStore(s => s.activeRetreatId);
  const retreats = useVolunteerStore(s => s.retreats);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const activeRetreat = retreats.find(r => r.id === activeRetreatId);

  if (!activeRetreat) return null;

  const toggle = (task: string) => {
    const next = value.includes(task) ? value.filter(t => t !== task) : [...value, task];
    update(volunteerId, { nhiemVu: next });
  };

  return (
    <>
      <div
        onClick={e => setAnchor(anchor ? null : e.currentTarget)}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, minWidth: 60 }}
      >
        <span style={{ fontSize: 12.5, color: value.length ? T.text : T.textMut, fontStyle: value.length ? "normal" : "italic" }}>
          {value.length > 0 ? value.join(", ") : "— chọn —"}
        </span>
        <ChevronDown size={10} color={T.textMut} />
      </div>
      <Popover anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <div style={{ padding: "4px 6px 2px", fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Nhiệm vụ
        </div>
        {activeRetreat.tasks.map(task => (
          <PopBtn key={task} selected={value.includes(task)} onClick={() => toggle(task)}>
            {task}
          </PopBtn>
        ))}
        {value.length > 0 && (
          <>
            <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
            <PopBtn onClick={() => { update(volunteerId, { nhiemVu: [] }); setAnchor(null); }}>
              <span style={{ color: T.red }}>✕ Bỏ tất cả</span>
            </PopBtn>
          </>
        )}
      </Popover>
    </>
  );
}

/* ── Room cell ── */
function RoomCell({ volunteerId, value }: { volunteerId: string; value?: string }) {
  const update = useVolunteerStore(s => s.updateVolunteer);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = () => {
    update(volunteerId, { phong: draft || undefined });
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(value || ""); setEditing(false); } }}
        style={{
          width: 70, padding: "4px 8px", borderRadius: 6,
          border: `1.5px solid ${T.accent}`, outline: "none",
          fontSize: 13, fontFamily: "inherit",
          boxShadow: `0 0 0 3px ${T.accentBg}`,
        }}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value || ""); setEditing(true); }}
      style={{ cursor: "pointer", fontSize: 13, color: value ? T.text : T.textMut, fontStyle: value ? "normal" : "italic" }}
      title="Click để sửa phòng"
    >
      {value || "—"}
    </span>
  );
}

/* ── Payment cell ── */
function PaymentCell({ volunteerId, paid, method }: { volunteerId: string; paid: boolean; method: string }) {
  const update = useVolunteerStore(s => s.updateVolunteer);
  const activeRetreatId = useVolunteerStore(s => s.activeRetreatId);
  const retreats = useVolunteerStore(s => s.retreats);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const activeRetreat = retreats.find(r => r.id === activeRetreatId);

  if (!activeRetreat) return null;

  return (
    <>
      <div onClick={e => setAnchor(anchor ? null : e.currentTarget)}
        style={{ cursor: "pointer", display: "inline-flex", flexDirection: "column", gap: 2 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: paid ? T.greenBg : T.redBg,
          color: paid ? T.green : T.red,
        }}>
          {paid ? "✓ Đã TT" : "Chưa TT"}
          <ChevronDown size={8} />
        </span>
        {method && <span style={{ fontSize: 11, color: T.textMut }}>{method}</span>}
      </div>
      <Popover anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <div style={{ padding: "4px 6px 2px", fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Trạng thái TT
        </div>
        <PopBtn selected={paid} onClick={() => { update(volunteerId, { daThanhToan: true }); setAnchor(null); }}>
          <span style={{ color: T.green }}>✓ Đã thanh toán</span>
        </PopBtn>
        <PopBtn selected={!paid} onClick={() => { update(volunteerId, { daThanhToan: false }); setAnchor(null); }}>
          <span style={{ color: T.red }}>✗ Chưa thanh toán</span>
        </PopBtn>
        <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
        <div style={{ padding: "4px 6px 2px", fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Phương thức
        </div>
        {["QR Code", "Tiền mặt"].map(m => (
          <PopBtn key={m} selected={method === m}
            onClick={() => { update(volunteerId, { phuongThucThanhToan: m as Volunteer["phuongThucThanhToan"] }); setAnchor(null); }}>
            {m}
          </PopBtn>
        ))}
      </Popover>
    </>
  );
}

/* ── Status cell ── */
const STATUSES: TrangThaiTNV[] = ["Đang xét duyệt", "Đã duyệt", "Từ chối"];
const statusStyle = (s: TrangThaiTNV) => ({
  "Đã duyệt":        { bg: T.greenBg, color: T.green },
  "Đang xét duyệt":  { bg: T.amberBg, color: T.amber },
  "Từ chối":         { bg: T.redBg,   color: T.red   },
}[s]);

function StatusCell({ volunteerId, value }: { volunteerId: string; value: TrangThaiTNV }) {
  const update = useVolunteerStore(s => s.updateVolunteer);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const st = statusStyle(value);

  return (
    <>
      <div onClick={e => setAnchor(anchor ? null : e.currentTarget)}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span style={{
          padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: st.bg, color: st.color,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          {value} <ChevronDown size={8} />
        </span>
      </div>
      <Popover anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {STATUSES.map(s => {
          const ss = statusStyle(s);
          return (
            <PopBtn key={s} selected={value === s}
              onClick={() => { update(volunteerId, { trangThai: s }); setAnchor(null); }}>
              <span style={{ padding: "2px 8px", borderRadius: 999, background: ss.bg, color: ss.color, fontSize: 12, fontWeight: 600 }}>
                {s}
              </span>
            </PopBtn>
          );
        })}
      </Popover>
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
export default function VolunteersPage() {
  const volunteers = useVolunteerStore(s => s.volunteers);
  const activeRetreatId = useVolunteerStore(s => s.activeRetreatId);
  const retreats = useVolunteerStore(s => s.retreats);
  const emailTemplate = useVolunteerStore(s => s.emailTemplate);

  const activeRetreat = retreats.find(r => r.id === activeRetreatId);

  const [search, setSearch] = useState("");
  const [filterFamily, setFilterFamily] = useState("all");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // Bulk Email modal state
  const [showEmailCenter, setShowEmailCenter] = useState(false);
  const [sentStatus, setSentStatus] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Filter volunteers strictly belonging to active retreat
  const activeVolunteers = useMemo(() => {
    return volunteers.filter(v => v.retreatId === activeRetreatId);
  }, [volunteers, activeRetreatId]);

  const filtered = useMemo(() => {
    return activeVolunteers.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        v.hoTen.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.soDienThoai?.includes(search);
      const matchFamily = filterFamily === "all" || v.giaDinhPhapDam === filterFamily;
      const matchStatus = filterStatus === "Tất cả" || v.trangThai === filterStatus;
      return matchSearch && matchFamily && matchStatus;
    });
  }, [activeVolunteers, search, filterFamily, filterStatus]);

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(v => v.id)));

  const deleteVolunteer = useVolunteerStore(s => s.deleteVolunteer);

  const handleExport = () => {
    const toExport = filtered.filter(v => selected.has(v.id));
    if (toExport.length) exportToExcel(toExport);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Bạn có chắc muốn delete ${selected.size} tình nguyện viên đã chọn?`)) {
      selected.forEach(id => deleteVolunteer(id));
      setSelected(new Set());
    }
  };

  if (!activeRetreat) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <h3>Vui lòng chọn khóa tu</h3>
          <p>Bạn cần chọn một khóa tu hoạt động để xem danh sách tình nguyện viên.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Về trang chủ chọn khóa tu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{
        padding: "16px 16px 12px", background: T.bg,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 30,
      }}>
        <div className="page-header-flex">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>
              Danh sách tình nguyện viên
            </h2>
            <p style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>
              {filtered.length}/{activeVolunteers.length} người
              {selected.size > 0 && ` · Đã chọn ${selected.size}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {selected.size > 0 && (
              <>
                <Link
                  href={`/tinh-nguyen-vien/in-name-tags?ids=${Array.from(selected).join(",")}`}
                  target="_blank"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 999, border: `1px solid ${T.border}`,
                    background: T.surface, color: T.text, fontSize: 12.5, fontWeight: 600,
                    cursor: "pointer", textDecoration: "none",
                  }}
                >
                  <Printer size={13} /> In Thẻ Tên ({selected.size})
                </Link>
                <button
                  onClick={() => setShowEmailCenter(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 999, border: `1px solid ${T.border}`,
                    background: T.surface, color: T.text, fontSize: 12.5, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Mail size={13} /> Gửi Email ({selected.size})
                </button>
                <button onClick={handleExport} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", borderRadius: 999, border: `1px solid ${T.border}`,
                  background: T.surface, color: T.text, fontSize: 12.5, fontWeight: 600,
                  cursor: "pointer",
                }}>
                  <Download size={13} /> Export ({selected.size})
                </button>
              </>
            )}
            <button
              onClick={handleDeleteSelected}
              disabled={selected.size === 0}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 999,
                border: `1.5px solid ${selected.size > 0 ? "var(--red)" : "var(--border)"}`,
                background: selected.size > 0 ? "var(--red-bg)" : "var(--bg-subtle)",
                color: selected.size > 0 ? "var(--red)" : "var(--text-muted)",
                fontSize: 12.5, fontWeight: 600,
                cursor: selected.size > 0 ? "pointer" : "not-allowed",
                opacity: selected.size > 0 ? 1 : 0.6,
              }}
            >
              <Trash2 size={13} /> Xóa {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
            <Link href="/tinh-nguyen-vien/moi" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 14px", borderRadius: 999, border: "none",
              background: T.accent, color: "#fff", fontSize: 12.5, fontWeight: 600,
              cursor: "pointer", textDecoration: "none",
            }}>
              <Plus size={13} /> Thêm TNV
            </Link>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMut }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              style={{
                width: "100%", padding: "7px 10px 7px 32px",
                border: `1.5px solid ${T.border}`, borderRadius: 999,
                fontSize: 13, background: T.surface, outline: "none",
                fontFamily: "inherit", color: T.text,
              }}
            />
          </div>

          {/* Family chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ id: "all", label: "Tất cả", emoji: "" }, ...activeRetreat.families].map(f => {
              const active = filterFamily === f.id;
              const fam = activeRetreat.families.find(x => x.id === f.id);
              return (
                <button key={f.id} onClick={() => setFilterFamily(f.id)} style={{
                  padding: "5px 12px", borderRadius: 999, border: `1.5px solid ${active && fam ? fam.color : (active ? T.accent : T.border)}`,
                  background: active ? (fam ? fam.bgColor : T.accent) : T.surface,
                  color: active ? (fam ? fam.color : "#fff") : T.textSec,
                  fontSize: 12.5, fontWeight: active ? 600 : 400,
                  cursor: "pointer", transition: "all 0.13s",
                }}>
                  {"emoji" in f && f.emoji ? `${f.emoji} ` : ""}{f.label}
                </button>
              );
            })}
          </div>

          {/* Status dropdown */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: "6px 28px 6px 10px", borderRadius: 8,
              border: `1.5px solid ${T.border}`, background: T.surface,
              fontSize: 12.5, color: T.text, cursor: "pointer",
              outline: "none", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239e9a92' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
            }}
          >
            {["Tất cả", "Đã duyệt", "Đang xét duyệt", "Từ chối"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table or Cards ── */}
      <div style={{ padding: "16px 16px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 20px", color: T.textMut }}>
            <Search size={36} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 600 }}>Không tìm thấy TNV nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only-block table-wrapper" style={{ width: "100%", maxWidth: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: T.subtle }}>
                    <th style={{ padding: "9px 12px 9px 16px", textAlign: "left", borderBottom: `1px solid ${T.border}`, width: 40 }}>
                      <input type="checkbox"
                        checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                        style={{ accentColor: T.accent, cursor: "pointer" }}
                      />
                    </th>
                    {["TÊN TNV", "TUỔI", "NGÀY ĐẾN", "NGÀY ĐI", "TRẠNG THÁI", "THANH TOÁN", "GIA ĐÌNH", "NHIỆM VỤ", "PHÒNG"].map(h => (
                      <th key={h} style={{
                        padding: "9px 12px", textAlign: "left",
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.08em", color: T.textMut,
                        borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => (
                    <tr key={v.id} style={{ transition: "background 0.1s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.subtle; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <td style={{ padding: "11px 12px 11px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)}
                          style={{ accentColor: T.accent, cursor: "pointer" }} />
                      </td>

                      {/* Name */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: T.accentBg, color: T.accent,
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                            border: `1.5px solid ${T.border}`,
                            display: "flex", alignContent: "center", justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                          }}>
                            {v.avatarUrl ? (
                              <img src={v.avatarUrl} alt={v.hoTen} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              v.hoTen.split(" ").pop()?.charAt(0) || "T"
                            )}
                          </div>
                          <div>
                            <Link href={`/tinh-nguyen-vien/${v.id}`} style={{
                              fontWeight: 600, color: T.text, display: "block",
                              textDecoration: "none", fontSize: 13,
                            }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.accent; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
                            >
                              {v.hoTen}
                            </Link>
                            <span style={{ fontSize: 11.5, color: T.textMut }}>{v.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tuổi */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12.5, color: T.textSec }}>
                        {v.tuoi || "—"}
                      </td>

                      {/* Ngày đến */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12.5, color: T.textSec }}>
                        {formatDisplayDate(v.ngayDen)}
                      </td>

                      {/* Ngày đi */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12.5, color: T.textSec }}>
                        {formatDisplayDate(v.ngayRoi)}
                      </td>

                      {/* Trạng thái — inline editable */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <StatusCell volunteerId={v.id} value={v.trangThai} />
                      </td>

                      {/* Thanh toán — inline editable */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <PaymentCell volunteerId={v.id} paid={v.daThanhToan} method={v.phuongThucThanhToan || ""} />
                      </td>

                      {/* Gia đình — inline editable */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <FamilyCell volunteerId={v.id} value={v.giaDinhPhapDam} />
                      </td>

                      {/* Nhiệm vụ — inline editable */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}`, maxWidth: 160 }}>
                        <TaskCell volunteerId={v.id} value={v.nhiemVu} />
                      </td>

                      {/* Phòng — inline editable text */}
                      <td style={{ padding: "11px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
                        <RoomCell volunteerId={v.id} value={v.phong} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(v => {
                const isExpanded = expandedCardIds.has(v.id);
                return (
                  <div key={v.id} style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: isExpanded ? 12 : 0,
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s ease-in-out",
                  }}>
                    {/* Top Header details */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                      <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)}
                        style={{ accentColor: T.accent, cursor: "pointer", flexShrink: 0 }} />
                      
                      {/* Clickable Middle Section to expand */}
                      <div 
                        onClick={() => {
                          setExpandedCardIds(prev => {
                            const next = new Set(prev);
                            if (next.has(v.id)) {
                              next.delete(v.id);
                            } else {
                              next.add(v.id);
                            }
                            return next;
                          });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flex: 1,
                          cursor: "pointer",
                          minWidth: 0,
                          padding: "4px 0",
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: T.accentBg, color: T.accent,
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                          border: `1.5px solid ${T.border}`,
                          display: "flex", alignContent: "center", justifyContent: "center",
                          alignItems: "center", overflow: "hidden",
                        }}>
                          {v.avatarUrl ? (
                            <img src={v.avatarUrl} alt={v.hoTen} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            v.hoTen.split(" ").pop()?.charAt(0) || "T"
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontWeight: 600, color: T.text, display: "block",
                            fontSize: 14,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                          }}>
                            {v.hoTen}
                          </span>
                          <div style={{ fontSize: 11.5, color: T.textMut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {v.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <StatusCell volunteerId={v.id} value={v.trangThai} />
                        <button
                          onClick={() => {
                            setExpandedCardIds(prev => {
                              const next = new Set(prev);
                              if (next.has(v.id)) {
                                next.delete(v.id);
                              } else {
                                next.add(v.id);
                              }
                              return next;
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                          title={isExpanded ? "Thu gọn" : "Xem chi tiết"}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Details block inside Card */}
                    {isExpanded && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px 14px",
                        background: T.subtle,
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 12,
                        border: `1px solid ${T.borderLight}`,
                        animation: "fadeUp 0.2s ease both",
                        marginTop: 4,
                      }}>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            Khóa tu
                          </div>
                          <div style={{ color: T.textSec, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {retreats.find(r => r.id === v.retreatId)?.ten || "—"}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            Ngày đến/về
                          </div>
                          <div style={{ color: T.textSec }}>
                            {v.ngayDen ? new Date(v.ngayDen).toLocaleDateString("vi-VN") : "—"}
                            <span style={{ color: T.textMut, margin: "0 4px" }}>→</span>
                            {v.ngayRoi ? new Date(v.ngayRoi).toLocaleDateString("vi-VN") : "—"}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            Gia đình
                          </div>
                          <FamilyCell volunteerId={v.id} value={v.giaDinhPhapDam} />
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            Nhiệm vụ
                          </div>
                          <TaskCell volunteerId={v.id} value={v.nhiemVu} />
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            Phòng
                          </div>
                          <RoomCell volunteerId={v.id} value={v.phong} />
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            Thanh toán
                          </div>
                          <PaymentCell volunteerId={v.id} paid={v.daThanhToan} method={v.phuongThucThanhToan || ""} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bulk Email Center Modal */}
      {showEmailCenter && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 className="modal-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={18} color="var(--accent)" /> Gửi Email Hàng Loạt ({selected.size})
              </h3>
              <button 
                onClick={() => { setShowEmailCenter(false); setCopyFeedback(false); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 16 }}>
              Chuẩn bị và mở Gmail web gửi email chào mừng cá nhân hóa cho từng TNV được chọn.
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ gap: 6 }}
                onClick={() => {
                  const selectedVols = activeVolunteers.filter(v => selected.has(v.id));
                  const emails = selectedVols.map(v => v.email).filter(Boolean).join(", ");
                  navigator.clipboard.writeText(emails);
                  setCopyFeedback(true);
                  setTimeout(() => setCopyFeedback(false), 2000);
                }}
              >
                {copyFeedback ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                {copyFeedback ? "Đã copy danh sách!" : "Copy tất cả địa chỉ Email"}
              </button>
            </div>

            {/* List of Volunteers to Mail */}
            <div style={{ 
              maxHeight: 300, 
              overflowY: "auto", 
              border: "1px solid var(--border)", 
              borderRadius: 8, 
              background: "var(--bg-subtle)",
              display: "flex", 
              flexDirection: "column" 
            }}>
              {activeVolunteers.filter(v => selected.has(v.id)).map((v, i) => {
                const retreat = retreats.find((r) => r.id === v.retreatId) || retreats[0];
                const family = retreat?.families.find((f) => f.id === v.giaDinhPhapDam);
                const hasSent = sentStatus.has(v.id);

                const handleIndividualSend = () => {
                  const nameStr = v.hoTen || "";
                  const familyStr = family ? `${family.emoji} ${family.label}` : "Chưa phân gia đình";
                  const roomStr = v.phong || "Chưa phân phòng";
                  const tasksStr = v.nhiemVu && v.nhiemVu.length > 0
                    ? v.nhiemVu.join(", ")
                    : "Chưa phân công nhiệm vụ";
                  const arrivalStr = v.ngayDen
                    ? new Date(v.ngayDen).toLocaleDateString("vi-VN")
                    : "Chưa rõ ngày";
                  const departureStr = v.ngayRoi
                    ? new Date(v.ngayRoi).toLocaleDateString("vi-VN")
                    : "Chưa rõ ngày";

                  const mailBody = emailTemplate
                    .replace(/{name}/g, nameStr)
                    .replace(/{family}/g, familyStr)
                    .replace(/{room}/g, roomStr)
                    .replace(/{tasks}/g, tasksStr)
                    .replace(/{arrivalDate}/g, arrivalStr)
                    .replace(/{departureDate}/g, departureStr);

                  const subject = `Thông tin đón tiếp tình nguyện viên - ${nameStr}`;
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(v.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
                  
                  window.open(gmailUrl, "_blank");
                  
                  setSentStatus(prev => {
                    const next = new Set(prev);
                    next.add(v.id);
                    return next;
                  });
                };

                return (
                  <div key={v.id} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "10px 14px", 
                    borderBottom: i < selected.size - 1 ? "1px solid var(--border-light)" : "none" 
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, textAlign: "left" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{v.hoTen}</span>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {v.email} · {family ? `${family.emoji} ${family.label}` : "Chưa gia đình"}
                      </span>
                    </div>
                    <button
                      className={`btn ${hasSent ? "btn-secondary" : "btn-primary"} btn-sm`}
                      style={{ gap: 4 }}
                      onClick={handleIndividualSend}
                    >
                      <Mail size={12} /> {hasSent ? "Mở lại Gmail" : "Gửi Email"}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => { setShowEmailCenter(false); setCopyFeedback(false); }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
