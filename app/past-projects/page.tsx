import { Suspense } from "react";
import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { getConcludedProjects, getAllDevTeams } from "./server-actions";
import { PastProjectsCalendar } from "./calendar";

export const metadata = {
  title: "Projetos Concluídos",
  description: "Visualização em calendário dos projetos concluídos",
};

export default async function PastProjectsPage() {
  return (
    <Bg className="bg-background">
      <div className="relative w-full h-screen">
        <Suspense
          fallback={
            <ContainerCenter>
              <LoadingSpinner />
            </ContainerCenter>
          }
        >
          <PastProjectsCalendarWrapper />
        </Suspense>
      </div>
    </Bg>
  );
}

async function PastProjectsCalendarWrapper() {
  const [projects, allDevTeams] = await Promise.all([
    getConcludedProjects(),
    getAllDevTeams(),
  ]);

  return (
    <PastProjectsCalendar
      initialProjects={projects}
      allDevTeams={allDevTeams}
    />
  );
}
