"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isPublic && !token) {
      router.replace("/login");
    }
  }, [isPublic, token, router]);

  if (!isPublic && !token) {
    return null;
  }

  return <>{children}</>;
}
