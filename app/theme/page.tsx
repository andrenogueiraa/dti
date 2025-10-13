"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { ButtonClose } from "@/components/custom/button-close";
import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";

export default function ThemePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    {
      value: "light",
      label: "Light",
      description: "Light mode theme",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Dark mode theme",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follow system preference",
      icon: Monitor,
    },
  ];

  return (
    <Bg>
      <ContainerCenter>
        <Card className="w-full max-w-md relative">
          <ButtonClose />
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Tema</CardTitle>
            <CardDescription>
              Selecione um tema específico ou sincronize com o tema do seu
              sistema operacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isSelected = theme === themeOption.value;

                return (
                  <Button
                    key={themeOption.value}
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto justify-start gap-4 p-4"
                    onClick={() => setTheme(themeOption.value)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{themeOption.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {themeOption.description}
                        </div>
                      </div>
                      {isSelected && <Check className="h-5 w-5 ml-auto" />}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </ContainerCenter>
    </Bg>
  );
}
