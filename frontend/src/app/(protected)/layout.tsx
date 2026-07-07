"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACCESS_TOKEN_KEY } from "@/lib/api";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 border-b p-3">
          <SidebarTrigger />
        </div>
        <div className="container flex-1 py-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
