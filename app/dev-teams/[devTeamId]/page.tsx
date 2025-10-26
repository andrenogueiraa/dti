"use cache";

import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { getDevTeam } from "./server-actions";
import { Suspense } from "react";
import { Bg } from "@/components/custom/bg";
import Image from "next/image";
import Link from "next/link";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";

import { Metadata } from "next";
// import { db } from "@/drizzle";
import { ButtonLinkRole } from "./client";

export const metadata: Metadata = {
  title: "Detalhes da equipe",
  description: "Detalhes da equipe",
};

// export async function generateStaticParams() {
//   const devTeams = await db.query.devTeams.findMany({
//     columns: {
//       id: true,
//     },
//   });

//   return devTeams.map((devTeam) => ({
//     id: devTeam.id,
//   }));
// }

export default async function Server({
  params,
}: {
  params: Promise<{ devTeamId: string }>;
}) {
  const { devTeamId } = await params;

  return (
    <Bg>
      <Pg className="relative">
        <ButtonClose href="/" />
        <Suspense
          fallback={
            <ContainerCenter>
              <LoadingSpinner />
            </ContainerCenter>
          }
        >
          <DevTeam devTeamId={devTeamId} />
        </Suspense>
      </Pg>
    </Bg>
  );
}

async function DevTeam({ devTeamId }: { devTeamId: string }) {
  const devTeam = await getDevTeam(devTeamId);

  if (!devTeam) {
    return <div>Equipe não encontrada</div>;
  }

  const usersIds = devTeam.userDevTeams.map(
    (userDevTeam) => userDevTeam.user.id
  );

  return (
    <>
      <PgHeader>
        <Image
          src={devTeam.imageUrl ?? ""}
          alt={devTeam.name ?? ""}
          width={150}
          height={150}
          className="rounded-lg w-32 h-32"
          priority
        />

        <PgTitle className="mt-4">Equipe {devTeam.name}</PgTitle>
        <PgDescription>{devTeam.description}</PgDescription>
      </PgHeader>

      <PgContent className="prose space-y-6">
        <section>
          <h2>Usuários</h2>

          <ul>
            {devTeam.userDevTeams.length > 0 ? (
              devTeam.userDevTeams.map((userDevTeam) => (
                <li key={userDevTeam.id}>
                  <span className="font-medium">{userDevTeam.user.name}</span>
                  <br />
                  <span className="text-muted-foreground text-sm">
                    {userDevTeam.role.name}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">
                Nenhum usuário encontrado
              </li>
            )}
          </ul>

          <div className="flex justify-end">
            <ButtonLinkRole
              variant="secondary"
              href={`/dev-teams/${devTeamId}/users/add`}
              roles={["admin"]}
              label="Adicionar usuário"
              allowedUsersIds={usersIds}
            />
          </div>
        </section>

        <section>
          <h2>Projetos</h2>

          <ul>
            {devTeam.projects.length > 0 ? (
              devTeam.projects.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    <span className="font-medium">{project.name}</span>
                    <br />
                    <span className="text-muted-foreground text-sm">
                      {project.description}
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">
                Nenhum projeto encontrado
              </li>
            )}
          </ul>

          <div className="flex justify-end">
            <ButtonLinkRole
              variant="secondary"
              href={`/dev-teams/${devTeamId}/projects/add`}
              roles={["admin"]}
              label="Adicionar projeto"
              allowedUsersIds={usersIds}
            />
          </div>
        </section>
      </PgContent>
    </>
  );
}
