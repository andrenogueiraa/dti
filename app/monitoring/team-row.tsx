"use client";

import Image from "next/image";
import Link from "next/link";
import { TeamMonitoringData } from "./server-actions";
import { MONITORING_CALENDAR_CONSTANTS } from "./constants";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamRowProps {
  team: TeamMonitoringData;
  startDate: Date;
  getDatePosition: (date: Date) => number;
  pixelsPerDay: number;
  rowHeight: number;
}

const { MARKER_SIZE } = MONITORING_CALENDAR_CONSTANTS;

export function TeamRow({
  team,
  startDate,
  getDatePosition,
  pixelsPerDay,
  rowHeight,
}: TeamRowProps) {
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

  const getMarkerColor = (hasDocReviewFinished: boolean) => {
    // Sprint anterior: verde se tem review, vermelho se não tem
    return hasDocReviewFinished
      ? "bg-green-500 border-green-600"
      : "bg-red-500 border-red-600";
  };

  const getRingMarkerColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "bg-transparent border-green-500";
      case "yellow":
        return "bg-transparent border-yellow-500";
      case "red":
        return "bg-transparent border-red-500";
    }
  };

  // Calcular posições dos marcadores
  const previousSprintPosition = team.previousSprint
    ? getDatePosition(team.previousSprint.finishDate)
    : null;

  const nextSprintPosition = team.nextSprint
    ? getDatePosition(team.nextSprint.finishDate)
    : null;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Verificar se a equipe não tem dados
  const hasNoData = previousSprintPosition === null && nextSprintPosition === null;

  return (
    <div
      className="relative border-b border-border/25"
      style={{ height: `${rowHeight}px` }}
    >
      {/* Indicador para equipes sem dados */}
      {hasNoData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">⚠️</span>
            <span className="text-xs font-medium">Sem reviews</span>
          </div>
        </div>
      )}
      {/* Linha de conexão entre marcadores */}
      {previousSprintPosition !== null && nextSprintPosition !== null && (() => {
        const daysBetween = team.previousSprint && team.nextSprint
          ? Math.floor(
              (team.nextSprint.finishDate.getTime() -
                team.previousSprint.finishDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        return (
          <>
            <div
              className="absolute top-1/2 -translate-y-1/2 border-t-2 border-dashed border-muted-foreground/30 z-0"
              style={{
                left: `${previousSprintPosition}px`,
                width: `${nextSprintPosition - previousSprintPosition}px`,
                height: "2px",
              }}
            />
            {/* Label com dias entre marcadores */}
            {daysBetween !== null && (
              <div
                className="absolute top-1/2 -translate-y-full -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm border rounded px-1.5 py-0.5 text-xs font-medium text-muted-foreground whitespace-nowrap"
                style={{
                  left: `${previousSprintPosition + (nextSprintPosition - previousSprintPosition) / 2}px`,
                  marginTop: "-4px",
                }}
              >
                {daysBetween} {daysBetween === 1 ? "dia" : "dias"}
              </div>
            )}
          </>
        );
      })()}

      {/* Marcador da Sprint Anterior (círculo cheio) */}
      {previousSprintPosition !== null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full border-2",
                getMarkerColor(team.previousSprint!.hasDocReviewFinished)
              )}
              style={{
                left: `${previousSprintPosition}px`,
                width: `${MARKER_SIZE}px`,
                height: `${MARKER_SIZE}px`,
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-card text-card-foreground">
            <div className="space-y-1">
              <p className="font-semibold text-sm">Sprint Anterior</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(team.previousSprint!.finishDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                {team.previousSprint!.hasDocReviewFinished
                  ? "✓ Doc Review finalizado"
                  : "✗ Doc Review não finalizado"}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Marcador da próxima sprint - anel vazio */}
      {nextSprintPosition !== null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full border-2",
                team.nextSprint!.hasDocReviewFinished
                  ? "bg-red-500/20 border-red-500"
                  : getRingMarkerColor(team.status)
              )}
              style={{
                left: `${nextSprintPosition}px`,
                width: `${MARKER_SIZE}px`,
                height: `${MARKER_SIZE}px`,
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-card text-card-foreground">
            <div className="space-y-1">
              <p className="font-semibold text-sm">Próxima Sprint</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(team.nextSprint!.finishDate)}
              </p>
              {team.nextSprint!.hasDocReviewFinished && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ Sprint Review finalizada antes de ocorrer a reunião
                </p>
              )}
              {team.previousSprint && team.nextSprint && (
                <p className="text-xs text-muted-foreground">
                  {Math.floor(
                    (team.nextSprint.finishDate.getTime() -
                      team.previousSprint.finishDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  dias desde a sprint anterior
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Alerta se não tem próxima sprint */}
      {nextSprintPosition === null && team.alert && (
        <div
          className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20 bg-yellow-500/10 border border-yellow-500 rounded px-3 py-1.5"
        >
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
            {team.alert}
          </p>
        </div>
      )}

      {/* Área de 15 dias (zona segura) - destacada a partir da sprint anterior */}
      {previousSprintPosition !== null && team.previousSprint?.hasDocReviewFinished && (() => {
        // Calcular cor da zona baseado na posição da próxima sprint
        let zoneColor = "green"; // padrão

        if (nextSprintPosition !== null && team.previousSprint) {
          const daysBetween = Math.floor(
            (team.nextSprint!.finishDate.getTime() -
              team.previousSprint.finishDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysBetween < 15) {
            if (daysBetween >= 12) {
              zoneColor = "yellow"; // próximo do limite
            } else {
              zoneColor = "green"; // dentro da zona
            }
          } else {
            zoneColor = "red"; // fora da zona
          }
        } else if (!nextSprintPosition) {
          // Sem próxima sprint
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const daysSincePrevious = Math.floor(
            (now.getTime() - team.previousSprint.finishDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysSincePrevious >= 7) {
            zoneColor = "red";
          } else if (daysSincePrevious >= 4) {
            zoneColor = "yellow";
          }
        }

        const getZoneColorClasses = (color: string) => {
          switch (color) {
            case "green":
              return "bg-green-500/5 border-l-2 border-r-2 border-green-500/20";
            case "yellow":
              return "bg-yellow-500/5 border-l-2 border-r-2 border-yellow-500/20";
            case "red":
              return "bg-red-500/5 border-l-2 border-r-2 border-red-500/20";
            default:
              return "bg-green-500/5 border-l-2 border-r-2 border-green-500/20";
          }
        };

        return (
          <div
            className={cn(
              "absolute top-0 bottom-0 z-0",
              getZoneColorClasses(zoneColor)
            )}
            style={{
              left: `${previousSprintPosition}px`,
              width: `${15 * pixelsPerDay}px`,
            }}
            title="Zona segura de 15 dias a partir da sprint anterior"
          />
        );
      })()}
    </div>
  );
}

