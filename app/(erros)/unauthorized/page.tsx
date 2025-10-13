import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import { Pg, PgDescription, PgHeader, PgTitle } from "@/components/ui/pg";

export const metadata = {
  title: "Unauthorized",
  description: "You are not authorized to access this page",
};

export default function Server() {
  return (
    <Bg>
      <Pg className="relative">
        <ButtonClose />

        <PgHeader>
          <PgTitle>{metadata.title}</PgTitle>
          <PgDescription>{metadata.description}</PgDescription>
        </PgHeader>
      </Pg>
    </Bg>
  );
}
