import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Progress } from "@/components/ui/progress";
import { db } from "@/drizzle";
import { projects } from "@/drizzle/core-schema";
import { cn } from "@/lib/utils";
import { desc } from "drizzle-orm";
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
    <Pg className="max-w-5xl">
      <PgHeader>
        <PgTitle>{metadata.title}</PgTitle>
        <PgDescription>{metadata.description}</PgDescription>
      </PgHeader>
      <PgContent className="space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <DevTeams />
        </Suspense>
      </PgContent>
    </Pg>
  );
}

async function getDevTeams() {
  return await db.query.devTeams.findMany({
    with: {
      projects: {
        orderBy: () => [desc(projects.createdAt)],
        limit: 2,
        with: {
          sprints: true,
        },
      },
    },
  });
}

async function DevTeams() {
  const devTeams = await getDevTeams();

  return (
    <>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div></div>
        <div className="font-semibold">Atual</div>
        <div className="font-semibold">Próximo</div>
      </div>
      {devTeams.map((devTeam) => (
        <div key={devTeam.name} className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center">
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
            devTeam.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={cn("block p-3 rounded-md", project.color)}
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
    </>
  );
}
