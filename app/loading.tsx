import { Bg } from "@/components/custom/bg";
import { ContainerCenter } from "@/components/custom/container-center";
import { LoadingSpinner } from "@/components/custom/loading-spinner";
import { Pg } from "@/components/ui/pg";

export default function Loading() {
  return (
    <Bg>
      <Pg>
        <ContainerCenter>
          <LoadingSpinner />
        </ContainerCenter>
      </Pg>
    </Bg>
  );
}
