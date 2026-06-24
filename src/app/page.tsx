"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useVolunteerStore, getEffectiveConfig } from "@/shared/lib/store";
import { Retreat } from "@/shared/types/retreat";
import { MapPin, Calendar, Globe, ArrowDown } from "lucide-react";
import Link from "next/link";

// ─── Design tokens ─────────────────────────────────────────────
const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";
const C = {
  sage:      "#4d7c5e",
  sageDark:  "#2d5a3d",
  sageMid:   "#6b9e7a",
  sageBand:  "#4a6e58",   // the Deer Park green band
  sageLight: "#e8f0eb",
  cream:     "#faf9f6",
  stone:     "#f4f2ee",
  white:     "#ffffff",
  ink:       "#1a2420",
  body:      "#4a5568",
  muted:     "#8b9aa3",
  border:    "#e4e8e3",
};

// ─── i18n ───────────────────────────────────────────────────────
type Lang = "vi" | "en" | "th";
const T = {
  vi: {
    langLabel: "Vi", navProgram: "Chương Trình", navRetreats: "Khóa Tu", navContact: "Liên Hệ",
    heroEyebrow: "Tu viện Vườn Ươm · Làng Mai Thái Lan",
    heroTitle: "Chương Trình\nTình Nguyện Viên",
    heroTagline: "Sống trong chánh niệm — Phụng sự từ tâm",
    heroCta1: "Tìm hiểu", heroCta2: "Đăng ký TNV", heroScroll: "Cuộn để khám phá",
    aboutLabel1: "Chúng tôi là ai", aboutLabel2: "TNV làm gì", aboutLabel3: "Bạn nhận được gì",
    aboutDesc1: "Tu viện Vườn Ươm là tu viện Làng Mai tại Thái Lan. Chương trình TNV mở ra cơ hội phụng sự và tu tập cho những ai muốn đóng góp thời gian và trái tim.",
    aboutDesc2: "Nấu ăn, làm vườn, tiếp đón thiền sinh, hỗ trợ thiền đường, văn phòng và vận chuyển. Mỗi nhiệm vụ là một sự thực tập chánh niệm.",
    aboutDesc3: "Chỗ ở, bữa ăn, và quý giá hơn — không gian tu tập sâu sắc, cộng đồng ấm áp, và sự bình an từ việc phụng sự.",
    aboutBody: "Tu viện Vườn Ươm là cửa ngõ dẫn vào đời sống chánh niệm. Đến với chúng tôi như về nhà — bạn sẽ có cơ hội ôm ấp hạnh phúc hiện tại, mỉm cười và sống trọn vẹn từng khoảnh khắc.",
    aboutQuote: "i have arrived · i am home",
    upcomingEyebrow: "Khóa tu sắp diễn ra",
    upcomingTitle: "Khóa Tu Sắp Diễn Ra",
    upcomingEmpty: "Hiện chưa có khóa tu nào sắp diễn ra. Hãy theo dõi để cập nhật.",
    pastTitle: "Những Khóa Tu Đã Qua",
    pastEmpty: "Ảnh và bài viết từ tình nguyện viên sẽ sớm được chia sẻ tại đây.",
    statusUpcoming: "Sắp diễn ra", statusOngoing: "Đang diễn ra", statusPast: "Đã qua",
    btnInfo: "Thông tin", btnRegister: "Đăng ký",
    modalRegBtn: "Đăng Ký Tình Nguyện Viên", modalClose: "Đóng",
    regTitle: "Đăng Ký Tình Nguyện Viên",
    regSub: "Điền thông tin — ban tổ chức sẽ liên hệ xác nhận trong vòng 3–5 ngày.",
    regName: "Họ và tên *", regEmail: "Email *", regPhone: "Số điện thoại",
    regNat: "Quốc tịch", regArr: "Ngày đến dự kiến", regDep: "Ngày đi dự kiến",
    regMsg: "Lý do / Điều muốn chia sẻ",
    regSubmit: "Gửi Đơn Đăng Ký", regSending: "Đang gửi...",
    regOk: "Đăng ký thành công! Ban tổ chức sẽ liên hệ sớm.", regErr: "Có lỗi. Vui lòng thử lại.", regReq: "Vui lòng điền đầy đủ họ tên và email.",
    footAddr: "Tu viện Vườn Ươm, Làng Mai Thái Lan", footEmail: "tnv@pvthailand.org", footRights: "© 2026 Tu viện Vườn Ươm",
  },
  en: {
    langLabel: "En", navProgram: "Program", navRetreats: "Retreats", navContact: "Contact",
    heroEyebrow: "Vườn Ươm Monastery · Plum Village Thailand",
    heroTitle: "Volunteer\nProgram",
    heroTagline: "Living mindfully — Serving from the heart",
    heroCta1: "Learn more", heroCta2: "Register", heroScroll: "Scroll to explore",
    aboutLabel1: "Who we are", aboutLabel2: "What volunteers do", aboutLabel3: "What you receive",
    aboutDesc1: "Vườn Ươm Monastery is Plum Village in Thailand. Our volunteer program opens a door for those who wish to contribute their time and heart in service.",
    aboutDesc2: "Cooking, gardening, welcoming retreatants, supporting the meditation hall, office work and transport — each task a mindfulness practice.",
    aboutDesc3: "Accommodation, meals, and more precious — a space for deep practice, a warm community, and the peace that comes from serving.",
    aboutBody: "Vườn Ươm Monastery is the online entrance to mindful living in Thailand. Visiting us is like coming home — you will have opportunities to embrace present happiness, smile, and fully live each moment.",
    aboutQuote: "i have arrived · i am home",
    upcomingEyebrow: "Upcoming retreats",
    upcomingTitle: "Upcoming Retreats",
    upcomingEmpty: "No upcoming retreats at this time. Please check back soon.",
    pastTitle: "Past Retreats",
    pastEmpty: "Photos and stories from volunteers will be shared here soon.",
    statusUpcoming: "Upcoming", statusOngoing: "Ongoing", statusPast: "Past",
    btnInfo: "Info", btnRegister: "Register",
    modalRegBtn: "Register as Volunteer", modalClose: "Close",
    regTitle: "Volunteer Registration",
    regSub: "Fill in your details — our team will contact you within 3–5 days.",
    regName: "Full name *", regEmail: "Email *", regPhone: "Phone",
    regNat: "Nationality", regArr: "Expected arrival", regDep: "Expected departure",
    regMsg: "Reason / Message",
    regSubmit: "Submit Application", regSending: "Submitting...",
    regOk: "Application submitted! Our team will contact you soon.", regErr: "Something went wrong. Please try again.", regReq: "Please fill in your name and email.",
    footAddr: "Vườn Ươm Monastery, Plum Village Thailand", footEmail: "tnv@pvthailand.org", footRights: "© 2026 Vườn Ươm Monastery",
  },
  th: {
    langLabel: "ไทย", navProgram: "โปรแกรม", navRetreats: "ปฏิบัติธรรม", navContact: "ติดต่อ",
    heroEyebrow: "วัดสวนกล้า · หมู่บ้านพลัม ประเทศไทย",
    heroTitle: "โครงการ\nอาสาสมัคร",
    heroTagline: "ใช้ชีวิตอย่างมีสติ — รับใช้จากใจ",
    heroCta1: "เรียนรู้", heroCta2: "สมัคร", heroScroll: "เลื่อนดูเพิ่มเติม",
    aboutLabel1: "เราคือใคร", aboutLabel2: "อาสาสมัครทำอะไร", aboutLabel3: "คุณได้รับอะไร",
    aboutDesc1: "วัดสวนกล้าเป็นวัดหมู่บ้านพลัมในประเทศไทย โครงการอาสาสมัครเปิดโอกาสให้ผู้ที่ต้องการมอบเวลาและหัวใจในการรับใช้",
    aboutDesc2: "ทำอาหาร ทำสวน ต้อนรับผู้ปฏิบัติธรรม ดูแลห้องนั่งสมาธิ งานสำนักงาน และการขนส่ง — ทุกงานคือการฝึกสติ",
    aboutDesc3: "ที่พัก อาหาร และสิ่งที่มีค่ายิ่งกว่า — พื้นที่สำหรับการปฏิบัติลึก ชุมชนที่อบอุ่น และความสงบจากการรับใช้",
    aboutBody: "วัดสวนกล้าคือประตูสู่ชีวิตแห่งสติในประเทศไทย การมาเยี่ยมเราเหมือนการกลับบ้าน — คุณจะมีโอกาสโอบรับความสุขในปัจจุบัน ยิ้ม และใช้ชีวิตอย่างเต็มที่ในทุกขณะ",
    aboutQuote: "มาถึงแล้ว · ฉันอยู่ที่บ้าน",
    upcomingEyebrow: "การปฏิบัติธรรมที่กำลังจะมา",
    upcomingTitle: "การปฏิบัติธรรมที่กำลังจะมา",
    upcomingEmpty: "ยังไม่มีการปฏิบัติธรรม โปรดติดตามเร็วๆ นี้",
    pastTitle: "การปฏิบัติธรรมที่ผ่านมา",
    pastEmpty: "รูปภาพและเรื่องราวจากอาสาสมัครจะถูกแบ่งปันที่นี่เร็วๆ นี้",
    statusUpcoming: "กำลังจะมาถึง", statusOngoing: "กำลังดำเนินการ", statusPast: "ผ่านไปแล้ว",
    btnInfo: "ข้อมูล", btnRegister: "สมัคร",
    modalRegBtn: "สมัครเป็นอาสาสมัคร", modalClose: "ปิด",
    regTitle: "ลงทะเบียนอาสาสมัคร",
    regSub: "กรอกข้อมูล — ทีมงานจะติดต่อยืนยันภายใน 3–5 วัน",
    regName: "ชื่อ-นามสกุล *", regEmail: "อีเมล *", regPhone: "เบอร์โทรศัพท์",
    regNat: "สัญชาติ", regArr: "วันที่คาดว่าจะมาถึง", regDep: "วันที่คาดว่าจะออก",
    regMsg: "เหตุผล / ข้อความ",
    regSubmit: "ส่งใบสมัคร", regSending: "กำลังส่ง...",
    regOk: "ส่งใบสมัครเรียบร้อย! ทีมงานจะติดต่อคุณเร็วๆ นี้", regErr: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง", regReq: "กรุณากรอกชื่อและอีเมล",
    footAddr: "วัดสวนกล้า หมู่บ้านพลัม ประเทศไทย", footEmail: "tnv@pvthailand.org", footRights: "© 2026 วัดสวนกล้า",
  },
};

// ─── Scroll-reveal ──────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const run = () => {
      const els = document.querySelectorAll(".reveal:not(.revealed)");
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }),
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    };
    const cleanup = run();
    return cleanup;
  });
}

// ─── Main Page ─────────────────────────────────────────────────
const HERO_IMAGES = [
  "/images/lang-mai-thai-1.jpg",
  "/images/lang-mai-thai-2.jpg",
  "/images/lang-mai-thai-3.jpg",
  "/images/lang-mai-thai-4.jpg",
  "/images/lang-mai-thai-5.jpg"
];

export default function PublicLandingPage() {
  const retreats = useVolunteerStore((s) => s.retreats);
  const firebaseConfig = useVolunteerStore((s) => s.firebaseConfig);
  const [lang, setLang] = useState<Lang>("vi");
  const [mounted, setMounted] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const retreatsSectionRef = useRef<HTMLDivElement>(null);

  useScrollReveal();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      setScrolled(window.scrollY > 80);

      // Scrollspy
      const sections = ["about", "retreats", "contact"];
      let currentSection: string | null = null;
      const navHeight = 80;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navHeight + 150 && rect.bottom > navHeight + 150) {
            currentSection = id;
            break;
          }
        }
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        currentSection = "contact";
      }

      setActiveSection(currentSection);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(onScroll, 100);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fading slideshow timer
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [mounted]);

  useEffect(() => {
    (async () => {
      const { startFirebaseSync } = await import("@/shared/lib/store");
      const cfg = getEffectiveConfig(firebaseConfig);
      if (cfg) startFirebaseSync(cfg);
    })();
  }, [firebaseConfig]);

  const t = T[lang];
  const today = new Date();
  const cat = (r: Retreat) => {
    const s = new Date(r.ngayBatDau), e = new Date(r.ngayKetThuc);
    if (today > e) return "past";
    if (today >= s) return "ongoing";
    return "upcoming";
  };
  const upcoming = retreats.filter((r) => cat(r) !== "past");
  const past = retreats.filter((r) => cat(r) === "past");

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 62;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setShowLangMenu(false);
  }, []);

  if (!mounted) return <div style={{ minHeight: "100vh", background: C.cream }} />;

  // About cards data (Deer Park style)
  const aboutCards = [
    { bg: "#c4af97", image: "/images/lang-mai-thai-2.jpg", label: t.aboutLabel1, desc: t.aboutDesc1 },
    { bg: "#8da1b9", image: "/images/lang-mai-thai-3.jpg", label: t.aboutLabel2, desc: t.aboutDesc2 },
    { bg: "#98a680", image: "/images/lang-mai-thai-1.jpg", label: t.aboutLabel3, desc: t.aboutDesc3 },
  ];

  return (
    <div style={{ fontFamily: FONT, color: C.ink, overflowX: "hidden" }}>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 62,
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px",
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.07)" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div style={{ width: 34, height: 34, background: C.sage, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fff" }}>🌿</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: scrolled ? C.ink : "#fff", lineHeight: 1.2, fontFamily: FONT, transition: "color 0.3s" }}>Tu viện Vườn Ươm</div>
            <div style={{ fontSize: 10, color: scrolled ? C.muted : "rgba(255,255,255,0.75)", fontFamily: FONT, transition: "color 0.3s" }}>Plum Village Thailand</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {([["about", t.navProgram], ["retreats", t.navRetreats], ["contact", t.navContact]] as [string, string][]).map(([id, lbl]) => {
            const isActive = activeSection === id;
            return (
              <button key={id} onClick={() => scrollToSection(id)}
                style={{ 
                  background: isActive ? (scrolled ? C.sageLight : "rgba(255,255,255,0.18)") : "transparent", 
                  border: "none", cursor: "pointer", padding: "8px 14px", 
                  fontSize: 13.5, fontWeight: isActive ? 600 : 500, 
                  color: isActive ? (scrolled ? C.sage : "#fff") : (scrolled ? C.body : "rgba(255,255,255,0.85)"), 
                  borderRadius: 8, fontFamily: FONT, transition: "all 0.2s" 
                }}
                onMouseOver={(e) => { 
                  if (!isActive) {
                    e.currentTarget.style.color = scrolled ? C.sage : "#fff"; 
                    e.currentTarget.style.background = scrolled ? C.sageLight : "rgba(255,255,255,0.15)"; 
                  }
                }}
                onMouseOut={(e) => { 
                  if (!isActive) {
                    e.currentTarget.style.color = scrolled ? C.body : "rgba(255,255,255,0.85)"; 
                    e.currentTarget.style.background = "transparent"; 
                  }
                }}
              >{lbl}</button>
            );
          })}
          <div style={{ position: "relative", marginLeft: 8 }}>
            <button onClick={() => setShowLangMenu(!showLangMenu)}
              style={{ 
                display: "flex", alignItems: "center", gap: 5, 
                background: scrolled ? C.sageLight : "rgba(255,255,255,0.12)", 
                border: `1px solid ${scrolled ? C.border : "rgba(255,255,255,0.2)"}`, 
                borderRadius: 999, padding: "6px 12px", 
                fontSize: 12, fontWeight: 600, 
                color: scrolled ? C.sage : "#fff", 
                cursor: "pointer", fontFamily: FONT, transition: "all 0.2s" 
              }}>
              <Globe size={12} /> {t.langLabel}
            </button>
            {showLangMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.1)", overflow: "hidden", minWidth: 148, zIndex: 200 }}>
                {(["vi", "en", "th"] as Lang[]).map((l) => (
                  <button key={l} onClick={() => { setLang(l); setShowLangMenu(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: l === lang ? 600 : 400, background: l === lang ? C.sageLight : "transparent", border: "none", cursor: "pointer", color: l === lang ? C.sage : C.body, fontFamily: FONT }}>
                    {l === "vi" ? "🇻🇳 Tiếng Việt" : l === "en" ? "🇬🇧 English" : "🇹🇭 ภาษาไทย"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO (100vh Full-Bleed Slideshow) ────────────── */}
      <section style={{
        height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        background: "#121a16",
      }}>
        {/* Fading Background Images */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {HERO_IMAGES.map((src, idx) => (
            <div
              key={src}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url('${src}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: idx === heroIdx ? 1 : 0,
                transition: "opacity 2.0s ease-in-out",
                transform: idx === heroIdx ? "scale(1.05)" : "scale(1)",
                animation: idx === heroIdx ? "kenBurnsActive 8s ease-out forwards" : "none",
              }}
            />
          ))}
        </div>

        {/* Soft Vignette Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(18,26,22,0.5) 0%, rgba(18,26,22,0.3) 50%, rgba(18,26,22,0.65) 100%)",
          zIndex: 1,
        }} />

        {/* Simple centered typography over top */}
        <div style={{ textAlign: "center", padding: "0 24px", zIndex: 10, maxWidth: 840, margin: "0 auto", color: "#fff" }}>
          <div style={{ 
            display: "inline-flex", alignItems: "center", gap: 7, 
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", 
            border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, 
            padding: "6px 18px", fontSize: 12.5, color: "#fff", 
            fontWeight: 500, marginBottom: 28, fontFamily: FONT,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }}>
            🌿 {t.heroEyebrow}
          </div>
          <h1 style={{ 
            fontFamily: FONT, fontSize: "clamp(42px, 8.5vw, 76px)", 
            fontWeight: 800, color: "#fff", lineHeight: 1.1, 
            margin: "0 0 24px", letterSpacing: "-0.03em", 
            textShadow: "0 4px 24px rgba(0,0,0,0.3)", whiteSpace: "pre-line" 
          }}>
            {t.heroTitle}
          </h1>
          <p style={{ 
            fontFamily: FONT, fontSize: "clamp(15px, 2vw, 19px)", 
            color: "rgba(255,255,255,0.92)", fontWeight: 300, 
            margin: "0 auto", maxWidth: 540, lineHeight: 1.6, 
            letterSpacing: "0.01em", textShadow: "0 2px 14px rgba(0,0,0,0.4)" 
          }}>
            {t.heroTagline}
          </p>
        </div>

        {/* Prominent scroll cue — bottom of hero */}
        <button onClick={() => scrollToSection("about")} style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", padding: 8, transition: "color 0.2s", zIndex: 10 }}
          onMouseOver={(e) => e.currentTarget.style.color = "#fff"}
          onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
        >
          <span style={{ fontSize: 10.5, fontFamily: FONT, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.heroScroll}</span>
          <ArrowDown size={18} style={{ animation: "gentleBounce 2.2s ease-in-out infinite" }} />
        </button>
      </section>

      {/* ── ABOUT SECTION (Forest Green & Muted Earthy Cards, Deer Park style) ── */}
      <section id="about" style={{ scrollMarginTop: 62, background: "#3e5647", padding: "96px 24px 96px" }}>
        
        {/* Intro Text Block (Thai Plum Village style, with light text color) */}
        <div className="reveal" style={{ maxWidth: 840, margin: "0 auto 68px", textAlign: "center" }}>
          <span style={{ 
            fontSize: 12, fontWeight: 700, color: "#b0ccb6", 
            letterSpacing: "0.15em", textTransform: "uppercase", 
            fontFamily: FONT, display: "block", marginBottom: 12 
          }}>
            {lang === "vi" ? "GIỚI THIỆU" : lang === "en" ? "INTRODUCTION" : "เกี่ยวกับเรา"}
          </span>
          <h2 style={{ 
            fontFamily: FONT, fontSize: "clamp(26px, 4vw, 40px)", 
            fontWeight: 700, color: "#ffffff", lineHeight: 1.25, 
            margin: "0 0 24px", letterSpacing: "-0.02em" 
          }}>
            {lang === "vi" ? "Sống Chánh Niệm & Phụng Sự Từ Tâm" : lang === "en" ? "Mindful Living & Heartfelt Service" : "การดำเนินชีวิตอย่างมีสติและการรับใช้จากใจ"}
          </h2>
          <p style={{ 
            fontFamily: FONT, fontSize: "clamp(15px, 1.8vw, 17.5px)", 
            color: "rgba(255,255,255,0.9)", lineHeight: 1.8, fontWeight: 300, 
            margin: "0 auto", maxWidth: 720 
          }}>
            {t.aboutBody}
          </p>
          <div style={{ 
            fontSize: 14.5, color: "#c2dfca", fontStyle: "italic", 
            fontFamily: FONT, fontWeight: 500, letterSpacing: "0.02em", 
            marginTop: 22 
          }}>
            🌿 “{t.aboutQuote}”
          </div>
        </div>

        {/* 3 Columns (Less boxy, organic cards with arched top images) */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {aboutCards.map((card, i) => (
              <div key={i} className="reveal" style={{ 
                transitionDelay: `${i * 100}ms`, 
                background: card.bg, 
                borderRadius: 28, 
                padding: "24px 24px 36px", 
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.08)", 
                border: "none",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 48px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.08)";
              }}
              >
                {/* Arched Image */}
                {card.image && (
                  <img src={card.image} alt={card.label} style={{
                    width: "100%",
                    height: 250,
                    objectFit: "cover",
                    borderTopLeftRadius: 120,
                    borderTopRightRadius: 120,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    marginBottom: 20
                  }} />
                )}
                <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: "#1a2420", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>{card.label}</h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(26, 36, 32, 0.85)", lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING RETREATS (Deer Park Style Card Grid) ── */}
      <section id="retreats" ref={retreatsSectionRef} style={{ background: C.stone, padding: "96px 24px", scrollMarginTop: 62 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.sage, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: FONT }}>📅 {t.upcomingEyebrow}</span>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: C.ink, margin: "12px 0 0", letterSpacing: "-0.025em" }}>{t.upcomingTitle}</h2>
          </div>
          {upcoming.length === 0 ? (
            <div className="reveal" style={{ textAlign: "center", padding: "56px 24px", background: C.white, borderRadius: 24, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🌱</div>
              <p style={{ fontFamily: FONT, fontSize: 15, color: C.muted }}>{t.upcomingEmpty}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 32 }}>
              {upcoming.map((r, idx) => {
                const c = cat(r);
                const statusLbl = c === "ongoing" ? t.statusOngoing : t.statusUpcoming;
                const statusClr = c === "ongoing" ? "#16a34a" : C.sage;
                return (
                  <div key={r.id} className="reveal" style={{ 
                    transitionDelay: `${idx * 60}ms`, 
                    background: C.white, 
                    borderRadius: 24, 
                    overflow: "hidden", 
                    border: `1px solid ${C.border}`, 
                    display: "flex", 
                    flexDirection: "column", 
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" 
                  }}
                  onMouseOver={(e) => { 
                    e.currentTarget.style.boxShadow = "0 20px 48px rgba(77, 124, 94, 0.08)"; 
                    e.currentTarget.style.transform = "translateY(-6px)"; 
                  }}
                  onMouseOut={(e) => { 
                    e.currentTarget.style.boxShadow = "none"; 
                    e.currentTarget.style.transform = "none"; 
                  }}
                  >
                    <div style={{ height: 220, position: "relative", background: `linear-gradient(135deg, ${C.sageLight}, ${C.border})`, overflow: "hidden", flexShrink: 0 }}>
                      {r.posterUrl
                        ? <img src={r.posterUrl} alt={r.ten} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, opacity: 0.2 }}>🌿</div>
                      }
                      <span style={{ 
                        position: "absolute", top: 16, right: 16, 
                        background: "rgba(255,255,255,0.95)", color: statusClr, 
                        borderRadius: 999, padding: "5px 14px", fontSize: 11, 
                        fontWeight: 700, fontFamily: FONT, backdropFilter: "blur(8px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>{statusLbl}</span>
                    </div>
                    <div style={{ padding: "26px 26px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <span style={{ 
                        fontSize: 12, fontWeight: 700, color: C.sage, 
                        letterSpacing: "0.08em", textTransform: "uppercase", 
                        fontFamily: FONT, marginBottom: 8, display: "block" 
                      }}>
                        📅 {new Date(r.ngayBatDau).toLocaleDateString("vi-VN")} — {new Date(r.ngayKetThuc).toLocaleDateString("vi-VN")}
                      </span>
                      <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: C.ink, margin: "0 0 10px", lineHeight: 1.3, letterSpacing: "-0.015em" }}>{r.ten}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: C.body, fontFamily: FONT, marginBottom: 20 }}>
                        <MapPin size={13} color={C.sage} /> {r.diaDiem}
                      </div>
                      <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                        <Link href={`/retreat/${r.id}`} style={{ flex: 1, textDecoration: "none" }}>
                          <button style={{ width: "100%", padding: "11px", background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 999, fontSize: 13, fontWeight: 600, color: C.body, cursor: "pointer", fontFamily: FONT, transition: "all 0.15s" }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = C.sage; e.currentTarget.style.color = C.sage; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.body; }}
                          >{t.btnInfo}</button>
                        </Link>
                        <Link href={`/register/${r.id}`} style={{ flex: 2, textDecoration: "none" }}>
                          <button style={{ width: "100%", padding: "11px", background: C.sage, border: "none", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: FONT, transition: "all 0.2s" }}
                            onMouseOver={(e) => { e.currentTarget.style.background = C.sageDark; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = C.sage; }}
                          >✦ {t.btnRegister}</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── PAST RETREATS ─────────────────────────────────── */}
      {past.length > 0 && (
        <section style={{ padding: "96px 24px", background: C.cream, scrollMarginTop: 62 }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: FONT, fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>{t.pastTitle}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {past.map((r, i) => (
                <div key={r.id} className="reveal" style={{ transitionDelay: `${i * 50}ms`, borderRadius: 16, overflow: "hidden", height: 200, position: "relative", background: C.stone, border: `1px solid ${C.border}` }}>
                  {r.posterUrl && <img src={r.posterUrl} alt={r.ten} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,36,32,0.65) 0%, transparent 50%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px 16px" }}>
                    <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", fontFamily: FONT, marginBottom: 3 }}>{t.statusPast}</span>
                    <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>{r.ten}</h3>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
              <div style={{ display: "inline-block", background: C.white, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "18px 32px", color: C.muted, fontSize: 13.5, fontFamily: FONT }}>
                📸 {t.pastEmpty}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer id="contact" style={{ background: C.ink, padding: "52px 32px 36px", scrollMarginTop: 62 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 36, marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌿</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: FONT }}>Tu viện Vườn Ươm</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.45)", margin: 0, fontFamily: FONT }}>{t.footAddr}</p>
            </div>
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: FONT }}>Contact</h4>
              <a href={`mailto:${t.footEmail}`} style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none", fontFamily: FONT, transition: "color 0.15s" }}
                onMouseOver={(e) => e.currentTarget.style.color = "#fff"}
                onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
              >{t.footEmail}</a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>{t.footRights}</span>
            <a href="/admin" title="Admin" style={{ fontSize: 16, opacity: 0.12, textDecoration: "none", transition: "opacity 0.3s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.5"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "0.12"}
            >🌿</a>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: ${C.cream}; }

        /* Scroll reveal */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .revealed { opacity: 1 !important; transform: translateY(0) !important; }

        /* Keyframes */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gentleBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        @keyframes kenBurnsActive {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.09); }
        }
      `}</style>
    </div>
  );
}
