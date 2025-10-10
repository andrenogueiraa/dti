"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export function ButtonClose() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2"
      onClick={() => router.back()}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
