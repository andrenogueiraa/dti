import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getProject } from "./server-actions";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProjectCarousel({
  images,
  projectId,
}: {
  images: Awaited<
    NonNullable<Awaited<ReturnType<typeof getProject>>>
  >["images"];
  projectId: string;
}) {
  return (
    <Carousel>
      <CarouselContent>
        {images.map((image) => {
          return (
            <CarouselItem key={image.id}>
              <AspectRatio
                ratio={
                  image.width && image.height
                    ? image.width / image.height
                    : 4 / 3
                }
              >
                <Image
                  src={image.url || ""}
                  alt={image.originalName}
                  width={image.width || 800}
                  height={image.height || 600}
                />
              </AspectRatio>
            </CarouselItem>
          );
        })}
        <CarouselItem className="flex flex-col justify-center items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/images/add`}>
              Adicionar imagem
            </Link>
          </Button>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
