import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import { ButtonClose } from "@/components/custom/button-close";
import { Metadata } from "next";
import CreateDevTeam from "./client";

export const metadata: Metadata = {
  title: "Adicionar time de desenvolvimento",
  description: "Adicionar um novo time de desenvolvimento",
};

export default async function Page() {
  return (
    <Bg>
      <ContainerCenter>
        <Card className="max-w-md mx-auto mt-8 w-full relative">
          <ButtonClose href={`/`} />
          <CreateDevTeam />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}

