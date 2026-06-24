"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, Settings, LogOut } from "lucide-react";
import { useVolunteerStore, startFirebaseSync, stopFirebaseSync, getEffectiveConfig } from "@/shared/lib/store";

const NAV = [
  { href: "/admin",                    Icon: Home,     label: "Trang Chủ" },
  { href: "/admin/tinh-nguyen-vien",   Icon: Users,    label: "TNV" },
  { href: "/admin/cai-dat",            Icon: Settings, label: "Cài Đặt" },
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
    const effectiveConfig = getEffectiveConfig(firebaseConfig);
    if (effectiveConfig) {
      startFirebaseSync(effectiveConfig);
    } else {
      stopFirebaseSync();
    }
    return () => stopFirebaseSync();
  }, [firebaseConfig]);

  // PWA Offline Install Prompt state & logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check display mode
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    if (ios) {
      const dismissed = sessionStorage.getItem("pwa-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowInstallBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("pwa-dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Để cài đặt trên iOS: Nhấn nút 'Chia sẻ' ở dưới cùng trình duyệt Safari, sau đó cuộn xuống chọn 'Thêm vào MH chính' (Add to Home Screen).");
      setShowInstallBanner(false);
      sessionStorage.setItem("pwa-dismissed", "true");
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa-dismissed", "true");
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa-dismissed", "true");
  };

  const activeRetreat = retreats.find((r) => r.id === activeRetreatId);

  const handleSwitchRetreat = () => {
    setActiveRetreatId(null);
    router.push("/admin");
  };

  const isPrintRoute = pathname?.includes("/in-name-tags") || pathname?.includes("/bao-cao-tong-ket");

  if (!mounted) {
    return <div style={{ background: "var(--bg-base)", minHeight: "100vh" }} />;
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
          <Link href="/admin" onClick={() => setActiveRetreatId(null)} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
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
          const active = href === "/admin" ? (pathname === "/admin" || pathname === "/admin/") : pathname.startsWith(href);
          const isDisabled = !activeRetreatId && href === "/admin/tinh-nguyen-vien";

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

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div style={{
          position: "fixed",
          bottom: 68, // above bottom nav + safety offset
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: 400,
          background: "var(--bg-surface)",
          border: "1.5px solid var(--accent)",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          padding: "12px 14px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          animation: "fadeUp 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📲</span>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Tải ứng dụng ngoại tuyến
              </span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                Sử dụng offline & quản lý mượt mà hơn
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button 
              onClick={handleInstallClick}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              Cài đặt
            </button>
            <button 
              onClick={handleDismissBanner}
              style={{
                background: "transparent",
                color: "var(--text-muted)",
                border: "none",
                fontSize: 14,
                cursor: "pointer",
                padding: 4,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
