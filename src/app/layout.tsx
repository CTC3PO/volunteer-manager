import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SidebarLayout } from "@/shared/components/SidebarLayout";

export const metadata: Metadata = {
  title: "TNV Manager – Quản Lý Tình Nguyện Viên",
  description: "Hệ thống quản lý tình nguyện viên cho khóa tu – Tu viện Vườn Ươm, Làng Mai Thái Lan",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TNV Manager",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
