import { Button } from "@/components/ui/button";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle";
import { cn } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Equipes de Desenvolvimento",
  description:
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet, fugit nostrum maxime consectetur obcaecati repellendus consequatur sequi omnis ab earum!",
};

export default function Server() {
  return (
    <Pg className="max-w-full">
      <PgHeader>
        <PgTitle>{metadata.title}</PgTitle>
        <PgDescription>{metadata.description}</PgDescription>
      </PgHeader>

      <PgContent className="space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <DevTeams />
        </Suspense>

        <Separator />

        <Button>
          <Link href="/projects/create">Novo Projeto</Link>
        </Button>
      </PgContent>
    </Pg>
  );
}

async function getDevTeams() {
  "use server";
  return await db.query.devTeams.findMany({
    orderBy: (devTeams, { asc }) => [asc(devTeams.name)],
    with: {
      projects: {
        orderBy: (projects, { asc }) => [asc(projects.id)],
        with: {
          sprints: {
            orderBy: (sprints, { asc }) => [asc(sprints.createdAt)],
          },
        },
      },
    },
  });
}

async function DevTeams() {
  const cachedDevTeams = unstable_cache(getDevTeams, ["dev-teams"], {
    revalidate: 10,
  });

  const devTeams = await cachedDevTeams();

  return (
    <section className="space-y-8">
      <div className="flex gap-6 text-center pt-6">
        <div className="min-w-48 font-semibold"></div>
        <div className="w-full max-w-sm font-semibold">Projeto Atual</div>
        <div className="w-full max-w-sm font-semibold">Próximo</div>
      </div>

      {devTeams.map((devTeam) => (
        <div key={devTeam.name} className="flex gap-6">
          <div className="flex flex-col items-center justify-center min-w-48">
            <Image
              src={devTeam.imageUrl ?? ""}
              alt={devTeam.name ?? ""}
              width={100}
              height={100}
              className="rounded-full w-20 h-20"
            />
            <h1 className="font-semibold mt-2">{devTeam.name}</h1>
            <p className="leading-4 text-sm text-muted-foreground">
              {devTeam.description ?? ""}
            </p>
          </div>

          {devTeam.projects &&
            devTeam.projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={cn(
                  "block p-3 rounded-md w-full max-w-sm",
                  index > 1 ? "bg-slate-100" : project.color
                )}
              >
                <h2 className="font-medium">{project.name}</h2>
                <p className="text-muted-foreground">{project.description}</p>

                <div>
                  {project.sprints &&
                    project.sprints.map((sprint, index) => (
                      <div key={index}>
                        <small className="text-xs">{sprint.name}</small>
                        <Progress value={sprint.progress} />
                        <div className="flex justify-between">
                          <small>
                            {new Date(
                              sprint.startDate ?? ""
                            ).toLocaleDateString("pt-br")}
                          </small>
                          <small>
                            {new Date(
                              sprint.finishDate ?? ""
                            ).toLocaleDateString("pt-br")}
                          </small>
                        </div>
                      </div>
                    ))}
                </div>
              </Link>
            ))}
        </div>
      ))}
    </section>
  );
}
