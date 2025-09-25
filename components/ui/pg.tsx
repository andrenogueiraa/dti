import * as React from "react";

import { cn } from "@/lib/utils";

function Pg({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pg"
      className={cn(
        "max-w-prose mx-auto bg-card text-card-foreground flex flex-col gap-6 py-6",
        className
      )}
      {...props}
    />
  );
}

function PgHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pg-header"
      className={cn(
        "@container/card-header prose grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function PgTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 data-slot="pg-title" className={cn("", className)} {...props} />;
}

function PgDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="pg-description"
      className={cn("text-muted-foreground text-lg", className)}
      {...props}
    />
  );
}

function PgAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pg-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function PgContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="pg-content" className={cn("px-6", className)} {...props} />
  );
}

function PgFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pg-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export { Pg, PgHeader, PgFooter, PgTitle, PgAction, PgDescription, PgContent };
