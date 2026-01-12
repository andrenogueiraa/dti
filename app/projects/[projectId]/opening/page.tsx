import { SimpleMarkdownPreview } from "@/components/custom/simple-markdown-preview";
import { Suspense } from "react";
import { getProjectOpening } from "./edit/server-actions";
import { Pg, PgContent } from "@/components/ui/pg";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Abertura de Projeto",
  description: "Documento de abertura do projeto.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  if (!projectId) {
    return <div>Project not found</div>;
  }

  return (
    <Bg>
      <Pg className="relative">
        <ButtonClose href={`/projects/${projectId}`} />
        <PgContent className="space-y-8">
          <Suspense
            fallback={
              <ContainerCenter>
                <LoadingSpinner />
              </ContainerCenter>
            }
          >
            <ProjectOpening projectId={projectId} />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function ProjectOpening({ projectId }: { projectId: string }) {
  const docOpening = await getProjectOpening(projectId);

  if (!docOpening) {
    redirect(`/projects/${projectId}/opening/edit`);
  }

  if (!docOpening.finishedAt) {
    redirect(`/projects/${projectId}/opening/edit`);
  }

  const images = docOpening.images;

  return (
    <>
      <SimpleMarkdownPreview
        content={docOpening.content}
        typeLabel="Documento de Abertura de Projeto"
        date={docOpening.date.toLocaleDateString("pt-BR")}
      />

      {images.length > 0 && (
        <section className="prose space-y-4">
          <h2>Anexos</h2>
          <div className="grid gap-6">
            {images.map((image) => (
              <div key={image.id}>
                <Image
                  src={image.url || ""}
                  alt={image.originalName}
                  width={image.width || 800}
                  height={image.height || 600}
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
