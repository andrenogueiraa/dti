import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";

export default function Home() {
  return (
    <Pg>
      <PgHeader>
        <PgTitle>Página Inicial</PgTitle>
        <PgDescription>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione
          dignissimos ullam vitae velit totam aut architecto. Facere adipisci
          quo illo.
        </PgDescription>
      </PgHeader>

      <PgContent>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione
          dignissimos ullam vitae velit totam aut architecto. Facere adipisci
          quo illo.
        </p>
      </PgContent>
    </Pg>
  );
}
