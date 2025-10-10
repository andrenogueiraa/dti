import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Suspense } from "react";
import { getDocs } from "./server-actions";
import { DataTable } from "./table";

export const metadata = {
  title: "Documentos",
  description:
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet, fugit nostrum maxime consectetur obcaecati repellendus consequatur sequi omnis ab earum!",
};

export default function Page() {
  return (
    <Pg>
      <PgHeader>
        <PgTitle>{metadata.title}</PgTitle>
        <PgDescription>{metadata.description}</PgDescription>
      </PgHeader>

      <PgContent>
        <Suspense fallback={<div>Carregando...</div>}>
          <Docs />
        </Suspense>
      </PgContent>
    </Pg>
  );
}

async function Docs() {
  const docs = await getDocs();

  if (!docs) {
    return <div>Erro ao carregar documentos</div>;
  }

  if (docs.length === 0) {
    return <div>Nenhum documento encontrado</div>;
  }

  if (docs.length > 0) {
    return <DataTable data={docs} />;
  }

  return <div>Erro desconhecido</div>;
}
