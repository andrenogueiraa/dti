import { Suspense } from "react";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { getActivities } from "./server-actions";
import { ActivityFeed } from "./client";

export const metadata = {
  title: "Feed de Atividades",
  description: "Acompanhe todas as atividades do sistema",
};

export default async function FeedPage() {
  return (
    <Bg>
      <Pg className="max-w-full relative">
        <ButtonClose href="/" />
        <PgHeader>
          <PgTitle>Feed de Atividades</PgTitle>
          <PgDescription>
            Acompanhe as criações e atualizações de projetos, tarefas, sprints e
            documentos
          </PgDescription>
        </PgHeader>

        <PgContent className="p-8">
          <Suspense
            fallback={
              <ContainerCenter>
                <LoadingSpinner />
              </ContainerCenter>
            }
          >
            <FeedContent />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function FeedContent() {
  const activities = await getActivities(100);

  return <ActivityFeed activities={activities} />;
}
