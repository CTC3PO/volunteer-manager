"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVolunteerStore } from "@/shared/lib/store";
import { SidebarLayout } from "@/shared/components/SidebarLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useVolunteerStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (currentUser === null) {
      router.replace("/admin/login");
    }
  }, [currentUser, router]);

  // While checking auth, render nothing to avoid flash
  if (currentUser === null) {
    return null;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
