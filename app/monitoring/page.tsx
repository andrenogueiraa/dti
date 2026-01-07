"use cache";

import { Suspense } from "react";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { cacheLife } from "next/cache";
import { getTeamsMonitoringData } from "./server-actions";
import { MonitoringCalendar } from "./calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acompanhamento de Sprint Reviews",
  description:
    "Monitoramento de conformidade com a regra de máximo 15 dias sem doc review de sprint finalizado",
};

export default async function MonitoringPage() {
  cacheLife("max");
  return (
    <Bg>
      <div className="relative w-full h-screen">
        <ButtonClose href="/" />
        <Suspense
          fallback={
            <ContainerCenter>
              <LoadingSpinner />
            </ContainerCenter>
          }
        >
          <MonitoringContent />
        </Suspense>
      </div>
    </Bg>
  );
}

async function MonitoringContent() {
  const data = await getTeamsMonitoringData();

  if (!data || !data.teams || data.teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma equipe encontrada para monitoramento.
      </div>
    );
  }

  return (
    <MonitoringCalendar
      teams={data.teams}
      calendarStartDate={data.calendarStartDate}
      calendarEndDate={data.calendarEndDate}
    />
  );
}

