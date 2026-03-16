import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import { ButtonClose } from "@/components/custom/button-close";
import { Metadata } from "next";
import EditDevTeam from "./client";
import { getDevTeamForEdit } from "./server-actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Editar time de desenvolvimento",
  description: "Editar time de desenvolvimento",
};

export default async function Page({
  params,
}: {
  params: Promise<{ devTeamId: string }>;
}) {
  const { devTeamId } = await params;
  const devTeam = await getDevTeamForEdit(devTeamId);

  if (!devTeam) {
    notFound();
  }

  return (
    <Bg>
      <ContainerCenter>
        <Card className="max-w-md mx-auto mt-8 w-full relative">
          <ButtonClose href={`/dev-teams/${devTeamId}`} />
          <EditDevTeam devTeam={devTeam} />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}

