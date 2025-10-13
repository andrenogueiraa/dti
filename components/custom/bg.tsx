import { cn } from "@/lib/utils";

function Bg({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bg"
      className={cn("w-full min-h-dvh bg-neutral-800", className)}
      {...props}
    />
  );
}

export { Bg };
