import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
        <DevTeams />
      </PgContent>
    </Pg>
  );
}

function DevTeams() {
  const devTeams = [
    {
      name: "Rubens",
      tags: ["Florestal"],
      src: "https://media.licdn.com/dms/image/v2/C4D03AQEJ6uw1lHR5wQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1579229541634?e=1761782400&v=beta&t=Dpe5OMxTPE_A6p1MisGL70lOSWtBKEqh6qJhhOdXeM0",
      projecs: [
        {
          name: "AQC - Autorização de Queima Controlada Automatizada",
          description:
            "Procedimento SIGA para autorização de queima controlada",
          color: "bg-green-100",
          sprints: [
            {
              name: "Sprint 1",
              progress: 100,
              startDate: "2025-01-01",
              endDate: "2025-01-15",
            },
            {
              name: "Sprint 2",
              progress: 100,
              startDate: "2025-01-16",
              endDate: "2025-01-31",
            },
            {
              name: "Sprint 3",
              progress: 50,
              startDate: "2025-02-01",
              endDate: "2025-02-15",
            },
          ],
        },
        {
          name: "Corte de Árvores Isoladas",
          description: "Procedimento SIGA para corte de árvores isoladas",
          color: "bg-blue-100",
        },
      ],
    },
    {
      name: "Breno",
      tags: ["Biodiversidade"],
      src: "https://media.licdn.com/dms/image/v2/D4D03AQEqlmR2UWDZEw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1725931294109?e=1761782400&v=beta&t=krGxuW_k2uFJA5fZkWEG2BuMS24DOEducWz0KA55FNI",
    },
    {
      name: "Isaías Araújo",
      tags: ["Fiscalização"],
      src: "https://media.licdn.com/dms/image/v2/D4E03AQFe5M60-Zm2Nw/profile-displayphoto-crop_800_800/B4EZjUXF_8GoAI-/0/1755909481718?e=1761782400&v=beta&t=9uqbdupAO6bZTGr-zKHQ8exF7pVZP3lTaaGe-gIU_7o",
    },
  ];

  return (
    <>
      {devTeams.map((devTeam) => (
        <div key={devTeam.name} className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center">
            <Image
              src={devTeam.src}
              alt={devTeam.name}
              width={100}
              height={100}
              className="rounded-full w-20 h-20"
            />
            <h1 className="font-semibold">{devTeam.name}</h1>
            <p>{devTeam.tags.join(", ")}</p>
          </div>

          {devTeam.projecs &&
            devTeam.projecs.map((project) => (
              <div
                key={project.name}
                className={cn("p-3 rounded-md", project.color)}
              >
                <h2 className="font-semibold">{project.name}</h2>
                <p>{project.description}</p>
                <div>
                  {project.sprints &&
                    project.sprints.map((sprint, index) => (
                      <div key={index}>
                        <small className="text-xs">{sprint.name}</small>
                        <Progress value={sprint.progress} />
                        <div className="flex justify-between">
                          <small>
                            {new Date(sprint.startDate).toLocaleDateString(
                              "pt-br"
                            )}
                          </small>
                          <small>
                            {new Date(sprint.endDate).toLocaleDateString(
                              "pt-br"
                            )}
                          </small>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </>
  );
}
