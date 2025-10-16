import { Bg } from "@/components/custom/bg";
import { Metadata } from "next";
import CreateProject from "./client";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Adicionar projeto",
  description: "Adicionar projeto",
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
        <Card className="max-w-md mx-auto mt-8 w-full">
          <CreateProject devTeamId={devTeamId} />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}
