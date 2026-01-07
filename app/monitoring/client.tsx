"use client";

import Image from "next/image";
import Link from "next/link";
import { TeamMonitoringData } from "./server-actions";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type MonitoringClientProps = {
  teams: TeamMonitoringData[];
};

export function MonitoringClient({ teams }: MonitoringClientProps) {
  const getBorderColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "border-green-500";
      case "yellow":
        return "border-yellow-500";
      case "red":
        return "border-red-500";
    }
  };

  const getAlertColor = (alert: string) => {
    if (alert.includes("finalizada antes")) {
      return "text-red-600 dark:text-red-400";
    }
    if (alert.includes("Finalizar review")) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-yellow-600 dark:text-yellow-400";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatDays = (days: number | null) => {
    if (days === null) return "N/A";
    if (days === 0) return "Hoje";
    if (days === 1) return "1 dia";
    return `${days} dias`;
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma equipe encontrada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Card
          key={team.id}
          className={cn(
            "overflow-hidden transition-all hover:shadow-lg",
            getBorderColor(team.status),
            "border-4"
          )}
        >
          <CardHeader className="flex flex-col items-center text-center pb-4">
            <div className="relative mb-4">
              <Image
                src={team.imageUrl ?? "/oflow.webp"}
                alt={team.name ?? "Equipe"}
                width={120}
                height={120}
                className={cn(
                  "rounded-full w-[120px] h-[120px] object-cover",
                  "border-4",
                  getBorderColor(team.status)
                )}
              />
            </div>
            <h3 className="text-xl font-semibold">{team.name}</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sprint Anterior:</span>
                <span className="font-medium">
                  {team.previousSprint
                    ? formatDate(team.previousSprint.finishDate)
                    : "Sem sprints"}
                </span>
              </div>
              {team.previousSprint && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doc Review:</span>
                  <span
                    className={cn(
                      "font-medium",
                      team.previousSprint.hasDocReviewFinished
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {team.previousSprint.hasDocReviewFinished
                      ? "✓ Finalizado"
                      : "✗ Não finalizado"}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Próxima Sprint:</span>
                <span className="font-medium">
                  {team.nextSprint
                    ? formatDate(team.nextSprint.finishDate)
                    : "Sem próxima sprint"}
                </span>
              </div>
              {team.previousSprint && team.nextSprint && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">
                    Dias entre sprints:
                  </span>
                  <span className="font-medium">
                    {formatDays(
                      Math.floor(
                        (team.nextSprint.finishDate.getTime() -
                          team.previousSprint.finishDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}
                  </span>
                </div>
              )}
            </div>

            {team.state.alerts.length > 0 && (
              <div className="pt-2 border-t space-y-1">
                {team.state.alerts.map((alert, index) => (
                  <p
                    key={index}
                    className={cn(
                      "text-xs font-medium text-center",
                      getAlertColor(alert)
                    )}
                  >
                    {alert}
                  </p>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Link
                href={`/dev-teams/${team.id}`}
                className="text-sm text-primary hover:underline block text-center"
              >
                Ver detalhes da equipe →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
