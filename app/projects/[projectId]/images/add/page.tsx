import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import { Metadata } from "next";
import FormUploadImage from "./form";

const title = "Adicionar imagem ao projeto";
const description = "Adicionar imagem ao projeto";

export const metadata: Metadata = {
  title,
  description,
};

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <Bg>
      <ContainerCenter>
        <Card className="max-w-md mx-auto w-full relative">
          <ButtonClose href={`/projects/${projectId}`} />

          <FormUploadImage projectId={projectId} />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}
