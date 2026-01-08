import { Bg } from "@/components/custom/bg";
import { Metadata } from "next";
import EditFutureProject from "./client";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import { ButtonClose } from "@/components/custom/button-close";
import { getFutureProjectForEdit } from "./server-actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Editar projeto futuro",
  description: "Editar projeto futuro",
};

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getFutureProjectForEdit(projectId);

  if (!project) {
    notFound();
  }

  return (
    <Bg>
      <ContainerCenter>
        <Card className="max-w-2xl mx-auto mt-8 w-full relative">
          <ButtonClose href="/future-projects" />
          <EditFutureProject project={project} />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}
