"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { VariantProps } from "class-variance-authority";
import Link from "next/link";

export function ButtonLinkRole({
  variant = "secondary",
  size = "default",
  href,
  roles,
  label,
  allowedUsersIds,
}: {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  href: string;
  roles: string[];
  label: string;
  allowedUsersIds: string[];
}) {
  const {
    data: session,
    isPending,
    error,
    // refetch,
  } = authClient.useSession();

  if (isPending) {
    return null;
  }

  if (!session) {
    return null;
  }

  if (!session.user) {
    return null;
  }

  if (error) {
    return <div>Erro ao carregar botão: {error.message}</div>;
  }

  if (
    // (session.user.role && roles.includes(session.user.role as string)) ||
    allowedUsersIds.includes(session.user.id)
  ) {
    return (
      <Button variant={variant} size={size} asChild>
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  return null;
}
