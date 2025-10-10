"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
      console.error(error);
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithubLogin}
            disabled={isGithubLoading}
          >
            {isGithubLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github />
                Sign in with GitHub
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
