"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useVolunteerStore } from "@/shared/lib/store";
import { SidebarLayout } from "@/shared/components/SidebarLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useVolunteerStore((s) => s.currentUser);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page
    if (currentUser === null && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [currentUser, router, isLoginPage]);

  // Bypass layout wrapping on the login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // While checking auth, render nothing to avoid flash
  if (currentUser === null) {
    return null;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
