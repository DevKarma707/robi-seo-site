"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logVisit } from "@/lib/firebase";

/**
 * Logs one visit per (session, path) into Firestore — powers the homegrown
 * analytics in /admin. No-op if Firebase env vars are missing.
 */
export function VisitLogger() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return; // ne pas compter l'admin
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return;
    void logVisit(pathname);
  }, [pathname]);

  return null;
}
