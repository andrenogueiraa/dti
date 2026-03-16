"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function CreateDevTeamButton() {
  const { data: session } = useSession();

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Link href="/dev-teams/add">
        <Button variant="outline">Criar novo time</Button>
      </Link>
    </div>
  );
}

