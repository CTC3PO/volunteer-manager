"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Users, Upload, Settings } from "lucide-react";
import { useVolunteerStore, startFirebaseSync, stopFirebaseSync } from "@/shared/lib/store";

const NAV = [
  { href: "/",                   Icon: LayoutDashboard, label: "Tổng Quan" },
  { href: "/tinh-nguyen-vien",   Icon: Users,           label: "TNV" },
  { href: "/import",             Icon: Upload,          label: "Import" },
  { href: "/cai-dat",            Icon: Settings,        label: "Cài Đặt" },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const themeMode = useVolunteerStore((s) => s.themeMode);
  const activeRetreatId = useVolunteerStore((s) => s.activeRetreatId);
  const retreats = useVolunteerStore((s) => s.retreats);
  const setActiveRetreatId = useVolunteerStore((s) => s.setActiveRetreatId);
  const firebaseConfig = useVolunteerStore((s) => s.firebaseConfig);

  // Theme Mode Effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (themeMode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [themeMode]);

  // Firebase Realtime Sync Effect
  useEffect(() => {
    if (firebaseConfig) {
      startFirebaseSync(firebaseConfig);
    } else {
      stopFirebaseSync();
    }
    return () => stopFirebaseSync();
  }, [firebaseConfig]);

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);

  const handleSwitchRetreat = () => {
    setActiveRetreatId(null);
    router.push("/");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh",
      overflow: "hidden", background: "#f5f2ee",
    }}>
      {/* ── Top header ── */}
      <header style={{
        flexShrink: 0, height: 52,
        background: "#fff", borderBottom: "1px solid #e8e3db",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" onClick={() => setActiveRetreatId(null)} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: "#2d5a27",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, flexShrink: 0,
            }}>🌿</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18", lineHeight: 1.2 }}>
                TNV Manager
              </div>
              <div style={{ fontSize: 11, color: "#9e9a92" }}>
                {activeRetreat ? activeRetreat.ten : "Chọn khóa tu để quản lý"}
              </div>
            </div>
          </Link>
        </div>

        {activeRetreat && (
          <button
            onClick={handleSwitchRetreat}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            🔄 Đổi khóa tu
          </button>
        )}
      </header>

      {/* ── Scrollable content ── */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav style={{
        flexShrink: 0, height: 58,
        background: "#fff", borderTop: "1px solid #e8e3db",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "row", alignItems: "stretch",
        zIndex: 50,
      }}>
        {NAV.map(({ href, Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isDisabled = !activeRetreatId && (href === "/tinh-nguyen-vien" || href === "/import");

          const content = (
            <>
              {/* Active indicator bar */}
              {active && !isDisabled && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 32, height: 3, background: "#2d5a27", borderRadius: "0 0 4px 4px",
                }} />
              )}
              <div style={{
                width: 32, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 8,
                background: active && !isDisabled ? "#e8f2e6" : "transparent",
                transition: "background 0.15s",
              }}>
                <Icon size={20} strokeWidth={active && !isDisabled ? 2.2 : 1.8} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: active && !isDisabled ? 700 : 500,
                whiteSpace: "nowrap", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {label}
              </span>
            </>
          );

          if (isDisabled) {
            return (
              <div
                key={href}
                title="Vui lòng chọn hoặc tạo khóa tu trước"
                style={{
                  flex: 1,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 2, padding: "6px 4px 4px",
                  color: "#d0cbbf",
                  cursor: "not-allowed",
                  position: "relative",
                }}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 2, textDecoration: "none", padding: "6px 4px 4px",
                color: active ? "#2d5a27" : "#9e9a92",
                position: "relative", transition: "color 0.15s",
                minWidth: 0,
              }}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
