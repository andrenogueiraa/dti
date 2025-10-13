import { cn } from "@/lib/utils";

export function ContainerCenter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-dvh p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
