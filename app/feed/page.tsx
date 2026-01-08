import { Suspense } from "react";
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
    <Pg className="max-w-full relative">
      <PgHeader>
        <PgTitle>Feed de Atividades</PgTitle>
        <PgDescription>
          Acompanhe as criações e atualizações de projetos, tarefas, sprints e
          documentos
        </PgDescription>
      </PgHeader>

      <PgContent>
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
  );
}

async function FeedContent() {
  const activities = await getActivities(100);

  return <ActivityFeed activities={activities} />;
}
