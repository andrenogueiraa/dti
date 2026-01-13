import { Bg } from "@/components/custom/bg";
import CreateSprintForm from "./form";
import { canCreateSprint } from "./server-actions";
import { ButtonClose } from "@/components/custom/button-close";
import {
  Pg,
  PgDescription,
  PgTitle,
  PgHeader,
  PgContent,
} from "@/components/ui/pg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Server({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const canCreateSprintResult = await canCreateSprint(projectId);

  if (!canCreateSprintResult.success) {
    return (
      <Bg>
        <Pg className="relative">
          <ButtonClose href={`/projects/${projectId}`} />
          <PgHeader>
            <PgTitle>Não é possível criar uma nova sprint</PgTitle>
            <PgDescription>
              {canCreateSprintResult.message ||
                "Verifique os pré-requisitos antes de criar uma nova sprint."}
            </PgDescription>
          </PgHeader>
          <PgContent>
            <Button asChild>
              <Link href={`/projects/${projectId}`}>Voltar ao projeto</Link>
            </Button>
          </PgContent>
        </Pg>
      </Bg>
    );
  }

  return (
    <Bg className="pt-8">
      <CreateSprintForm />
    </Bg>
  );
}
