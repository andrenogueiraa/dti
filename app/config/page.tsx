import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";

export const metadata = {
  title: "Configurações",
  description:
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet, fugit nostrum maxime consectetur obcaecati repellendus consequatur sequi omnis ab earum!",
};

export default function Server() {
  return (
    <Pg>
      <PgHeader>
        <PgTitle>{metadata.title}</PgTitle>
        <PgDescription>{metadata.description}</PgDescription>
      </PgHeader>

      <PgContent></PgContent>
    </Pg>
  );
}
