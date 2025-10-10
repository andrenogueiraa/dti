"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await authClient.signOut();
        toast.success("Successfully signed out");
        router.push("/login");
        router.refresh();
      } catch (error) {
        toast.error("Failed to sign out");
        console.error(error);
        // Still redirect even if there's an error
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Signing out...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
