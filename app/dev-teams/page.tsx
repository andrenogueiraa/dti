import { Bg } from "@/components/custom/bg";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { db } from "@/drizzle";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";

export const metadata = {
  title: "Equipes",
  description: "Gerencie suas equipes",
};

export default function Server() {
  return (
    <Bg>
      <Pg className="relative">
        <ButtonClose href="/" />
        <PgHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Inicio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dev-teams">Equipes</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PgTitle>{metadata.title}</PgTitle>
          <PgDescription>{metadata.description}</PgDescription>
        </PgHeader>

        <PgContent>
          <Suspense
            fallback={
              <ContainerCenter>
                <LoadingSpinner />
              </ContainerCenter>
            }
          >
            <DevTeams />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function getDevTeams() {
  "use server";
  const devTeams = await db.query.devTeams.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
    },
  });
  return devTeams;
}

async function DevTeams() {
  const getCachedDevTeams = unstable_cache(getDevTeams, ["dev-teams"], {
    revalidate: 300,
  });

  const devTeams = await getCachedDevTeams();

  if (!devTeams) {
    return <div>Nenhuma equipe encontrada</div>;
  }

  if (devTeams.length === 0) {
    return <div>Nenhuma equipe encontrada</div>;
  }

  if (devTeams.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devTeams.map((devTeam) => (
          <DevTeam key={devTeam.id} devTeam={devTeam} />
        ))}
      </div>
    );
  }

  return <div>Erro desconhecido</div>;
}

function DevTeam({
  devTeam,
}: {
  devTeam: Awaited<ReturnType<typeof getDevTeams>>[number];
}) {
  return (
    <Link href={`/dev-teams/${devTeam.id}`}>
      <Card className="hover:border-primary">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center">
            <Image
              src={devTeam.imageUrl ?? ""}
              alt={devTeam.name ?? ""}
              width={100}
              height={100}
              className="rounded-full w-20 h-20"
            />
          </div>

          <CardTitle className="mt-4">{devTeam.name}</CardTitle>
          <CardDescription className="text-center">
            {devTeam.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
