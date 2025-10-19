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
import FileUpload from "@/components/custom/file-upload";

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
        <CarouselItem>
          <AspectRatio
            ratio={4 / 3}
            className="flex flex-col items-center justify-center space-y-4 border p-4 rounded-lg"
          >
            <form>
              <FileUpload
                config={{
                  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
                }}
                projectId={projectId}
              />
            </form>
          </AspectRatio>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
