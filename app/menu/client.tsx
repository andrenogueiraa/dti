"use client";

import { authClient } from "@/lib/auth-client";
import { LogInIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";

export function LogInLogOut() {
  const { data: session } = authClient.useSession();

  return (
    <LinkItem
      item={{
        icon: session ? <LogOutIcon /> : <LogInIcon />,
        label: session ? "Logout" : "Login",
        href: session ? "/logout" : "/login",
      }}
    />
  );
}

export function LinkItem({
  item,
}: {
  item: { icon: React.ReactNode; label: string; href: string };
}) {
  return (
    <Link
      href={item.href}
      className="bg-secondary hover:bg-primary hover:text-primary-foreground p-2 rounded-md flex items-center gap-2"
    >
      <div className="size-6 text-muted-foreground">{item.icon}</div>
      <span className="text-sm">{item.label}</span>
    </Link>
  );
}
