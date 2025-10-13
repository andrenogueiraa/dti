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
import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { ButtonClose } from "@/components/custom/button-close";

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
    <Bg>
      <ContainerCenter>
        <Card className="w-full max-w-md mx-auto relative">
          <ButtonClose href="/" />
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Iniciar sessão</CardTitle>
            <CardDescription>
              Escolha uma opção de login para continuar
            </CardDescription>
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
      </ContainerCenter>
    </Bg>
  );
}
