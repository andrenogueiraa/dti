"use client";

import Image from "next/image";
import Link from "next/link";
import { TeamMonitoringData } from "./server-actions";
import { cn } from "@/lib/utils";

interface TeamColumnProps {
  team: TeamMonitoringData;
  height: number;
}

export function TeamColumn({ team, height }: TeamColumnProps) {
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

  const getDaysTextColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "text-green-600 dark:text-green-400";
      case "yellow":
        return "text-yellow-600 dark:text-yellow-400";
      case "red":
        return "text-red-600 dark:text-red-400";
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

  return (
    <div className="flex items-center" style={{ height: `${height}px` }}>
      <Link
        href={`/dev-teams/${team.id}`}
        className="flex items-center gap-4 hover:opacity-80 transition-opacity whitespace-nowrap px-4"
      >
        {/* Image with colored border */}
        {team.imageUrl ? (
          <Image
            src={team.imageUrl}
            alt={team.name ?? "Equipe"}
            width={128}
            height={128}
            className={cn(
              "rounded-full w-16 h-16 object-cover flex-shrink-0 border-4",
              getBorderColor(team.status)
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded-full w-16 h-16 flex items-center justify-center bg-muted border-4",
              getBorderColor(team.status)
            )}
          >
            <span className="text-xs font-medium">
              {team.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col justify-center py-2">
          <h3 className="font-medium">{team.name}</h3>

          {/* Renderizar todos os alertas */}
          {team.state.alerts.map((alert, index) => (
            <p
              key={index}
              className={cn("text-xs font-medium mt-0.5", getAlertColor(alert))}
            >
              {alert}
            </p>
          ))}

          {/* Mensagem de estado baseada no tipo */}
          {team.state.type === "no_sprints" && (
            <p className="text-xs text-muted-foreground mt-0.5">Sem sprints</p>
          )}

          {team.state.type === "ok" && team.state.alerts.length === 0 && (
            <p
              className={cn(
                "text-xs font-medium mt-0.5",
                getDaysTextColor(team.status)
              )}
            >
              ✓ Review OK
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
