import { Bg } from "@/components/custom/bg";
import { Metadata } from "next";
import CreateFutureProject from "./client";
import { ContainerCenter } from "@/components/custom/container-center";
import { Card } from "@/components/ui/card";
import { ButtonClose } from "@/components/custom/button-close";

export const metadata: Metadata = {
  title: "Adicionar projeto futuro",
  description: "Adicionar projeto futuro",
};

export default async function Page() {
  return (
    <Bg>
      <ContainerCenter>
        <Card className="max-w-2xl mx-auto mt-8 w-full relative">
          <ButtonClose href="/future-projects" />
          <CreateFutureProject />
        </Card>
      </ContainerCenter>
    </Bg>
  );
}

