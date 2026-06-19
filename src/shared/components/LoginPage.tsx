"use client";
import { useState } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { LogIn, Key, Mail, Eye, EyeOff, ShieldAlert } from "lucide-react";

export function LoginPage() {
  const login = useVolunteerStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    // Simulate slight loading delay for premium feel
    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg("Email hoặc mật khẩu không chính xác.");
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail("volunteer@pvthailand.org");
    setPassword("plumvillage2026");
    setErrorMsg("");
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, var(--bg-base) 0%, var(--bg-muted) 100%)",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Nature abstract glowing blobs */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "-10%",
        width: "50%",
        height: "50%",
        background: "radial-gradient(circle, rgba(45, 90, 39, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "-10%",
        width: "55%",
        height: "55%",
        background: "radial-gradient(circle, rgba(82, 183, 71, 0.06) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />

      {/* Login Card */}
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "var(--bg-surface-translucent)",
        backdropFilter: "blur(16px)",
        border: "1.5px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "var(--shadow-lg)",
        padding: "32px 24px",
        zIndex: 10,
        position: "relative",
        animation: "fadeUp 0.3s ease both"
      }}>
        {/* Logo and Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            background: "var(--accent)",
            borderRadius: "14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            marginBottom: 14,
            boxShadow: "0 4px 12px var(--accent-glow)"
          }}>
            🌿
          </div>
          <h1 style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            margin: "0 0 4px"
          }}>
            TNV Manager
          </h1>
          <p style={{
            fontSize: "12.5px",
            color: "var(--text-muted)",
            margin: 0
          }}>
            Đăng nhập để quản lý tình nguyện viên khóa tu
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: "var(--red-bg)",
            border: "1px solid var(--red)",
            borderRadius: "8px",
            color: "var(--red)",
            fontSize: "12.5px",
            fontWeight: 500,
            marginBottom: 20,
            animation: "fadeIn 0.2s ease"
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "10px" }}>Email Hệ Thống</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} />
              <input
                type="email"
                className="form-input"
                placeholder="system@pvthailand.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "36px" }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: "10px" }}>Mật Khẩu</label>
            <div style={{ position: "relative" }}>
              <Key size={15} style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "36px", paddingRight: "36px" }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "999px",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              marginTop: 8,
              boxShadow: "0 4px 12px var(--accent-glow)",
              gap: 8
            }}
          >
            <LogIn size={15} />
            {isLoading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px dashed var(--border)",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
            Bạn chưa có tài khoản hoặc đang chạy thử nghiệm?
          </span>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              display: "block",
              margin: "6px auto 0",
              background: "var(--accent-bg)",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              fontSize: "11px",
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: "999px",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--accent)"}
            onMouseOut={(e) => e.currentTarget.style.background = "var(--accent-bg)"}
          >
            📋 Điền nhanh tài khoản Admin
          </button>
        </div>
      </div>
    </div>
  );
}
