"use client";
import { useState, useEffect, use } from "react";
import { useVolunteerStore } from "@/shared/lib/store";
import { Retreat } from "@/shared/types/retreat";
import { MapPin, Calendar, ArrowLeft, BookOpen, Image as ImageIcon, Heart, Compass, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Design system colors
const C = {
  sage:      "#4d7c5e",
  sageDark:  "#2d5a3d",
  sageLight: "#e8f0eb",
  cream:     "#faf9f6",
  stone:     "#f4f2ee",
  white:     "#ffffff",
  ink:       "#1a2420",
  body:      "#4a5568",
  muted:     "#8b9aa3",
  border:    "#e4e8e3",
};

const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";

// Mock volunteer articles for dynamic rendering
const MOCK_ARTICLES = [
  {
    id: "art-1",
    title: "Nhặt rau trong chánh niệm — Niềm vui từ những việc đơn sơ",
    author: "Tâm Hạnh (TNV Khóa tu Việt 2026)",
    readTime: "4 phút đọc",
    excerpt: "Buổi sáng ở tu viện bắt đầu lúc 4:00. Tại bếp, việc nhặt rau chuẩn bị bữa trưa không đơn thuần là chuẩn bị thực phẩm, mà là cơ hội tuyệt vời để quay về...",
    content: "Buổi sáng ở tu viện bắt đầu lúc 4:00 khi sương mù còn che phủ các đồi thông. Tại bếp tu viện Vườn Ươm, các tình nguyện viên chúng tôi ngồi quây quần bên rổ rau lớn. Sư cô khuyên chúng tôi thực tập 'nhặt rau trong chánh niệm' — mỗi cọng rau nhặt ra đều mang theo sự chăm sóc và biết ơn. Không vội vàng, không nói chuyện ồn ào, chỉ có tiếng gió rì rào qua kẽ lá và nhịp thở nhẹ nhàng. Tôi nhận ra hạnh phúc không ở đâu xa xôi, nó nằm ngay trong từng khoảnh khắc hiện tại khi tay tôi chạm vào đất ấm và lá xanh.",
    date: "25/06/2026",
  },
  {
    id: "art-2",
    title: "Tìm lại bình yên nơi Vườn Ươm Thái Lan",
    author: "Somchai (TNV Khóa tu Thái 2026)",
    readTime: "6 phút đọc",
    excerpt: "Sau nhiều năm làm việc căng thẳng tại Bangkok, tôi quyết định đăng ký làm tình nguyện viên tại tu viện. 10 ngày ở đây đã thay đổi hoàn toàn cách tôi...",
    content: "Cuộc sống bận rộn ở Bangkok từng khiến tôi kiệt sức. Khi đặt chân đến tu viện Vườn Ươm, âm thanh đầu tiên tôi nghe thấy là tiếng chuông gió thanh tịnh. Là một TNV hỗ trợ kỹ thuật và đón thiền sinh, tôi được thực tập lắng nghe sâu. Mọi người ở đây đối xử với nhau như người thân trong gia đình. Việc được ăn cơm trong im lặng cùng tăng thân giúp tôi cảm nhận trọn vẹn hương vị của thức ăn và tình thương của người chuẩn bị. Tôi tìm thấy một không gian an trú vững chãi bên trong mình.",
    date: "20/06/2026",
  },
  {
    id: "art-3",
    title: "Chúng ta học được gì từ đời sống phụng sự?",
    author: "Diệu Âm (TNV Wake Up 2026)",
    readTime: "5 phút đọc",
    excerpt: "Làm tình nguyện viên khóa tu không chỉ là cống hiến sức lực, đó là quá trình chuyển hóa sâu sắc nội tâm thông qua các hoạt động hàng ngày và thiền tập...",
    content: "Nhiều người nghĩ đi làm TNV là để giúp đỡ tu viện. Nhưng sau một khóa tu, tôi nhận ra mình nhận lại nhiều hơn cống hiến. Tôi được học cách ôm ấp những khó khăn, bực dọc khi công việc không như ý. Tôi học cách lắng nghe không phán xét khi làm việc chung trong gia đình pháp đàm. Phụng sự chính là thiền hành trong hành động. Mỗi bước chân quét lá rụng, mỗi lần rửa bát đĩa đều là cơ hội để nuôi dưỡng tình thương và sự hiểu biết.",
    date: "15/06/2026",
  }
];

// Mock photos for gallery
const MOCK_PHOTOS = [
  { url: "/images/lang-mai-thai-1.jpg", caption: "Giờ thiền hành buổi sáng của đại chúng qua đồi thông" },
  { url: "/images/lang-mai-thai-2.jpg", caption: "TNV quây quần nhặt rau chuẩn bị bữa trưa trong chánh niệm" },
  { url: "/images/lang-mai-thai-3.jpg", caption: "Các gia đình pháp đàm chia sẻ dưới bóng mát cây rừng" },
  { url: "/images/lang-mai-thai-4.jpg", caption: "Cảnh hoàng hôn bình yên trên hồ nước tu viện Vườn Ươm" },
  { url: "/images/lang-mai-thai-5.jpg", caption: "Đoàn tình nguyện viên chụp ảnh kỷ niệm cuối khóa tu" },
  { url: "/images/khoa-tu-viet-2026.jpg", caption: "Hoạt động sinh hoạt chung ngoài trời ấm áp tình thân" }
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RetreatDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const retreats = useVolunteerStore((s) => s.retreats);
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "articles" | "photos">("info");
  const [selectedArticle, setSelectedArticle] = useState<typeof MOCK_ARTICLES[0] | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<typeof MOCK_PHOTOS[0] | null>(null);

  useEffect(() => {
    const found = retreats.find((r) => r.id === id);
    if (found) {
      setRetreat(found);
    }
  }, [id, retreats]);

  if (!retreat) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.muted, marginBottom: 16 }}>Đang tải thông tin khóa tu...</p>
          <Link href="/" style={{ color: C.sage, fontWeight: 600, textDecoration: "none" }}>← Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(retreat.ngayBatDau).toLocaleDateString("vi-VN");
  const endDate = new Date(retreat.ngayKetThuc).toLocaleDateString("vi-VN");

  return (
    <div style={{ fontFamily: FONT, color: C.ink, background: C.cream, minHeight: "100vh", paddingBottom: 80 }}>
      
      {/* Header Sticky */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100, height: 60,
        background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 24px",
        justifyContent: "space-between"
      }}>
        <button 
          onClick={() => router.push("/")}
          style={{ 
            background: "none", border: "none", cursor: "pointer", 
            display: "flex", alignItems: "center", gap: 8, 
            fontSize: 14, fontWeight: 600, color: C.body, padding: 0
          }}
        >
          <ArrowLeft size={16} /> Quay lại trang chủ
        </button>
        <Link 
          href={`/register/${retreat.id}`}
          style={{ 
            background: C.sage, color: "#fff", textDecoration: "none",
            padding: "8px 20px", borderRadius: 999, fontSize: 13, 
            fontWeight: 700, boxShadow: "0 4px 12px rgba(77, 124, 94, 0.2)",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = C.sageDark}
          onMouseOut={(e) => e.currentTarget.style.background = C.sage}
        >
          ✦ Đăng ký TNV
        </Link>
      </header>

      {/* Hero Banner */}
      <div style={{ 
        position: "relative", height: "35vh", minHeight: 240, 
        overflow: "hidden", background: "#1a2520" 
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${retreat.posterUrl || "/images/lang-mai-thai-1.jpg"}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.45, filter: "blur(2px)"
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(26,37,32,0.85) 0%, rgba(26,37,32,0.2) 100%)",
        }} />
        <div style={{ 
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 900, padding: "0 24px", color: "#fff"
        }}>
          <span style={{ 
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
            padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
            letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-block", marginBottom: 12
          }}>
            Khóa Tu Phụng Sự
          </span>
          <h1 style={{ fontSize: "clamp(24px, 4.5vw, 36px)", fontWeight: 800, margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>{retreat.ten}</h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 14, fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={14} /> {startDate} — {endDate}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> {retreat.diaDiem}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "32px 24px 0" }}>
        
        {/* Navigation Tabs */}
        <div style={{ 
          display: "flex", borderBottom: `2.5px solid ${C.border}`, 
          marginBottom: 32, gap: 8 
        }}>
          {[
            { id: "info", label: "Thông tin khóa tu", icon: Compass },
            { id: "articles", label: "Góc nhìn TNV (Bài viết)", icon: BookOpen },
            { id: "photos", label: "Hình ảnh sinh hoạt", icon: ImageIcon }
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 18px", fontSize: 14.5, fontWeight: 700,
                  color: active ? C.sage : C.body,
                  borderBottom: `3px solid ${active ? C.sage : "transparent"}`,
                  marginBottom: -2.5,
                  transition: "all 0.2s",
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === "info" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
            {/* Left: General Info */}
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: C.white, padding: 28, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>Giới thiệu khóa tu</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: C.body, fontWeight: 300 }}>
                  {retreat.moTa || "Khóa tu tĩnh lặng nuôi dưỡng chánh niệm và bình an trong lòng. Đây là cơ hội tuyệt vời để cùng đại chúng thực tập hơi thở chánh niệm, thiền hành, lắng nghe pháp thoại và đóng góp tấm lòng phụng sự, kết nối tình thân giữa những người con Phật."}
                </p>
              </div>

              <div style={{ background: C.white, padding: 28, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>🌿 Đời sống Tình Nguyện Viên tại Vườn Ươm</h3>
                <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.7, color: C.body, fontWeight: 300 }}>
                  Khi đăng ký làm tình nguyện viên (TNV), bạn sẽ cùng chúng tôi sinh hoạt, thực tập thiền môn và hỗ trợ ban tổ chức trong các hoạt động phục vụ khóa tu.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ color: C.sage, fontSize: 18 }}>🧘</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>Thiền tập hằng ngày</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: C.body, fontWeight: 300 }}>Ngồi thiền, nghe pháp thoại, thiền hành đồi thông.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ color: C.sage, fontSize: 18 }}>🥣</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>Bếp chánh niệm</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: C.body, fontWeight: 300 }}>Phụ bếp nấu ăn chay dinh dưỡng phục vụ khóa tu.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ color: C.sage, fontSize: 18 }}>🌲</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>Làm vườn & Vệ sinh</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: C.body, fontWeight: 300 }}>Quét lá, tưới cây, chuẩn bị thiền đường sạch mát.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ color: C.sage, fontSize: 18 }}>💬</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>Gia đình pháp đàm</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: C.body, fontWeight: 300 }}>Sinh hoạt nhóm, lắng nghe sâu và chia sẻ từ tâm.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sidebar Status Card */}
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ 
                background: C.white, padding: 24, borderRadius: 20, 
                border: `1px solid ${C.border}`, position: "sticky", top: 84 
              }}>
                <div style={{ 
                  background: C.sageLight, color: C.sage, borderRadius: 12, 
                  padding: "10px 14px", fontSize: 12.5, fontWeight: 700, 
                  textAlign: "center", marginBottom: 20, display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <CheckCircle2 size={15} /> Nhận đơn đăng ký
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.muted }}>Địa điểm</span>
                    <span style={{ fontWeight: 600, textAlign: "right", maxWidth: 160 }}>Tu viện Vườn Ươm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.muted }}>Ngày đến dự kiến</span>
                    <span style={{ fontWeight: 600 }}>{startDate}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.muted }}>Ngày đi dự kiến</span>
                    <span style={{ fontWeight: 600 }}>{endDate}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.muted }}>Hạn chót đón TNV</span>
                    <span style={{ fontWeight: 600, color: C.sage }}>Trước 3 ngày</span>
                  </div>
                </div>

                <Link 
                  href={`/register/${retreat.id}`}
                  style={{ 
                    background: C.sage, color: "#fff", textDecoration: "none",
                    padding: "13px", borderRadius: 999, fontSize: 14, 
                    fontWeight: 700, display: "block", textAlign: "center",
                    boxShadow: "0 4px 18px rgba(77, 124, 94, 0.28)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = C.sageDark; e.currentTarget.style.transform = "translateY(-1.5px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = C.sage; e.currentTarget.style.transform = "none"; }}
                >
                  Đăng Ký TNV Ngay
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "articles" && (
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {MOCK_ARTICLES.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setSelectedArticle(art)}
                style={{ 
                  background: C.white, padding: 24, borderRadius: 20, 
                  border: `1px solid ${C.border}`, cursor: "pointer",
                  transition: "all 0.2s" 
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = C.sage; e.currentTarget.style.boxShadow = "0 8px 24px rgba(77, 124, 94, 0.04)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{art.title}</h3>
                  <span style={{ fontSize: 12, color: C.muted, flexShrink: 0, marginLeft: 12 }}>{art.date}</span>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6, color: C.body, fontWeight: 300 }}>{art.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.sage, fontWeight: 600 }}>Tác giả: {art.author}</span>
                  <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 500 }}>{art.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="reveal" style={{ 
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", 
            gap: 20 
          }}>
            {MOCK_PHOTOS.map((ph, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedPhoto(ph)}
                style={{ 
                  background: C.white, borderRadius: 20, overflow: "hidden", 
                  border: `1px solid ${C.border}`, cursor: "pointer",
                  transition: "all 0.3s ease" 
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.06)";
                  const overlay = e.currentTarget.querySelector(".img-overlay") as HTMLDivElement;
                  if (overlay) overlay.style.opacity = "1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                  const overlay = e.currentTarget.querySelector(".img-overlay") as HTMLDivElement;
                  if (overlay) overlay.style.opacity = "0";
                }}
              >
                <div style={{ height: 190, position: "relative", overflow: "hidden", background: C.stone }}>
                  <img src={ph.url} alt={ph.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div 
                    className="img-overlay"
                    style={{ 
                      position: "absolute", inset: 0, background: "rgba(77,124,94,0.15)",
                      opacity: 0, transition: "opacity 0.2s"
                    }} 
                  />
                </div>
                <div style={{ padding: 14 }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.body, fontWeight: 500, lineHeight: 1.4 }}>{ph.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Article Detail Lightbox Modal */}
      {selectedArticle && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedArticle(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,20,15,0.65)",
            backdropFilter: "blur(6px)", display: "flex", alignItems: "center", 
            justifyContent: "center", padding: 16
          }}
        >
          <div style={{
            background: C.white, borderRadius: 24, width: "100%", maxWidth: 640,
            maxHeight: "85vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
            padding: "36px 36px 40px", animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: "uppercase", letterSpacing: "0.05em" }}>Chia sẻ từ TNV</span>
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 20 }}
              >
                ✕
              </button>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.3, color: C.ink }}>{selectedArticle.title}</h2>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.muted, borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 20 }}>
              <span>Tác giả: <strong>{selectedArticle.author}</strong></span>
              <span>Ngày đăng: {selectedArticle.date} · {selectedArticle.readTime}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: C.body, fontWeight: 300, whiteSpace: "pre-line" }}>
              {selectedArticle.content}
            </p>
            <div style={{ textAlign: "center", marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{ 
                  background: C.stone, border: "none", borderRadius: 999,
                  padding: "10px 30px", fontSize: 13, fontWeight: 700, 
                  color: C.body, cursor: "pointer" 
                }}
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPhoto(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,20,15,0.85)",
            backdropFilter: "blur(12px)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 16
          }}
        >
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "75vh" }}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              style={{ 
                position: "absolute", top: -40, right: 0, background: "none", 
                border: "none", cursor: "pointer", color: "#fff", fontSize: 24 
              }}
            >
              ✕
            </button>
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption} 
              style={{ width: "100%", height: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: 16 }} 
            />
          </div>
          <p style={{ color: "#fff", marginTop: 16, fontSize: 14, textAlign: "center", maxWidth: 480 }}>{selectedPhoto.caption}</p>
        </div>
      )}

      <style>{`
        /* Keyframe animation */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .reveal {
          animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
      `}</style>

    </div>
  );
}
