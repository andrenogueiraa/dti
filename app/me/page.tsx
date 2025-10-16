import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Bg } from "@/components/custom/bg";
import { Pg, PgContent, PgHeader, PgTitle } from "@/components/ui/pg";
import { db } from "@/drizzle";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  if (!user) {
    redirect("/login");
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Bg>
      <Pg className="relative">
        <PgHeader hidden>
          <PgTitle className="text-center">Meu perfil</PgTitle>
        </PgHeader>
        <PgContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-24">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/logout">
                <LogOut />
                Sign Out
              </Link>
            </Button>
          </div>

          <Suspense fallback={<div>Carregando dados do usuário...</div>}>
            <MyUser userId={user.id} />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function getMyUser(userId: string) {
  "use server";
  const user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
    with: {
      userDevTeams: {
        columns: {},
        with: {
          role: true,
          devTeam: {
            with: {
              projects: true,
            },
          },
        },
      },
    },
  });
  return user;
}

async function MyUser({ userId }: { userId: string }) {
  const user = await getMyUser(userId);

  if (!user) {
    return <div>Ocorreu um erro ao carregar o usuário</div>;
  }

  const devTeams = user.userDevTeams.map((userDevTeam) => userDevTeam.devTeam);
  const projects = devTeams.flatMap((devTeam) => devTeam.projects);

  return (
    <main className="prose space-y-8">
      <section>
        <h2>Equipes</h2>
        <ul>
          {user.userDevTeams.length > 0 ? (
            user.userDevTeams.map((userDevTeam) => {
              const { devTeam, role } = userDevTeam;
              return (
                <li key={devTeam.id}>
                  <span className="font-medium">{devTeam.name}</span>
                  <br />
                  <span className="text-muted-foreground">{role.name}</span>
                </li>
              );
            })
          ) : (
            <li className="text-muted-foreground">Nenhuma equipe encontrada</li>
          )}
        </ul>
      </section>

      <section>
        <h2>Projetos</h2>
        <ul>
          {projects.length > 0 ? (
            projects.map((project) => (
              <li key={project.id}>
                <span className="font-medium">{project.name}</span>
                <br />
                <span className="text-muted-foreground">
                  {project.description}
                </span>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">Nenhum projeto encontrado</li>
          )}
        </ul>
      </section>
    </main>
  );
}
