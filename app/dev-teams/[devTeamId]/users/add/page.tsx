import { Bg } from "@/components/custom/bg";
import { Metadata } from "next";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import AddUserToTeam from "./client";
import { ButtonClose } from "@/components/custom/button-close";

export const metadata: Metadata = {
  title: "Adicionar usuário",
  description: "Adicionar usuário",
};

export default async function Page({
  params,
}: {
  params: Promise<{ devTeamId: string }>;
}) {
  const { devTeamId } = await params;

  return (
    <Bg>
      <ContainerCenter>
        <Card className="max-w-md mx-auto mt-8 w-full relative">
          <ButtonClose href={`/dev-teams/${devTeamId}`} />
          <AddUserToTeam devTeamId={devTeamId} />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}
