"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Upload, Settings, LogOut } from "lucide-react";
import { useVolunteerStore, startFirebaseSync, stopFirebaseSync } from "@/shared/lib/store";
import { LoginPage } from "@/shared/components/LoginPage";

const NAV = [
  { href: "/",                   Icon: Home,            label: "Tổng Quan" },
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
  const cleanupVolunteersData = useVolunteerStore((s) => s.cleanupVolunteersData);
  const currentUser = useVolunteerStore((s) => s.currentUser);
  const logout = useVolunteerStore((s) => s.logout);

  const [mounted, setMounted] = useState(false);

  // Mount Effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Run data cleanup on mount
  useEffect(() => {
    if (mounted) {
      cleanupVolunteersData();
    }
  }, [cleanupVolunteersData, mounted]);

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

  const isPrintRoute = pathname?.includes("/in-name-tags") || pathname?.includes("/bao-cao-tong-ket");

  if (!mounted) {
    return <div style={{ background: "var(--bg-base)", minHeight: "100vh" }} />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  if (isPrintRoute) {
    return <div className="print-container">{children}</div>;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh",
      overflow: "hidden", background: "var(--bg-base)",
    }}>
      {/* ── Top header ── */}
      <header style={{
        flexShrink: 0, height: 52,
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" onClick={() => setActiveRetreatId(null)} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, flexShrink: 0,
            }}>🌿</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                TNV Manager
              </div>
              <div style={{
                fontSize: 11, color: "var(--text-muted)",
                maxWidth: 140, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"
              }}>
                {activeRetreat ? activeRetreat.ten : "Chọn khóa tu để quản lý"}
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {activeRetreat && (
            <button
              onClick={handleSwitchRetreat}
              style={{
                background: "var(--accent-bg)",
                border: "1.5px solid var(--accent)",
                borderRadius: "999px",
                padding: "5px 12px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "var(--accent)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                boxShadow: "0 2px 6px var(--accent-glow)",
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(45, 90, 39, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--accent-bg)";
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 6px var(--accent-glow)";
              }}
            >
              🔄 Đổi khóa tu
            </button>
          )}

          <button
            onClick={logout}
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "11.5px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--red-bg)";
              e.currentTarget.style.color = "var(--red)";
              e.currentTarget.style.borderColor = "var(--red)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-muted)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <LogOut size={13} /> Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav style={{
        flexShrink: 0, height: 50,
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "row", alignItems: "center",
        justifyContent: "space-around",
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
                  width: 32, height: 3, background: "var(--accent)", borderRadius: "0 0 4px 4px",
                }} />
              )}
              <div style={{
                width: 38, height: 38,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%",
                background: active && !isDisabled ? "var(--accent-bg)" : "transparent",
                transition: "all 0.2s ease",
              }}>
                <Icon size={20} strokeWidth={active && !isDisabled ? 2.2 : 1.8} />
              </div>
            </>
          );

          if (isDisabled) {
            return (
              <div
                key={href}
                title="Vui lòng chọn hoặc tạo khóa tu trước"
                style={{
                  display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)",
                  opacity: 0.35,
                  cursor: "not-allowed",
                  position: "relative",
                  width: 50, height: 50,
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
              title={label}
              aria-label={label}
              style={{
                display: "flex",
                alignItems: "center", justifyContent: "center",
                color: active ? "var(--accent)" : "var(--text-muted)",
                position: "relative", transition: "color 0.15s",
                width: 50, height: 50,
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
