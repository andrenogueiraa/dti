"use client";

import { authClient } from "@/lib/auth-client";
import { LinkItem } from "./page";
import { LogInIcon, LogOutIcon } from "lucide-react";

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
