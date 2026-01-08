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

const title = "Acompanhamento de Sprint Reviews";
const description =
  "Monitoramento de conformidade com a regra de máximo 15 dias sem doc review de sprint finalizado";

export const metadata: Metadata = {
  title,
  description,
};

export default async function MonitoringPage() {
  cacheLife("max");
  return (
    <Bg className="h-screen bg-background">
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-shrink-0">
          <ButtonClose href="/" />
        </div>
        <div className="flex-1 min-h-0">
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
