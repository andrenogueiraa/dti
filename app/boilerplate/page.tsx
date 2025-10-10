import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Suspense } from "react";
import { getItems, ItemType } from "./server-actions";

export const metadata = {
  title: "Boilerplate",
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
          <Items />
        </Suspense>
      </PgContent>
    </Pg>
  );
}

async function Items() {
  const items = await getItems();

  if (!items) {
    return <div>Erro ao carregar itens</div>;
  }

  if (items.length === 0) {
    return <div>Nenhum item encontrado</div>;
  }

  if (items.length > 0) {
    return (
      <div>
        {items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return <div>Erro desconhecido</div>;
}

function Item({ item }: { item: ItemType }) {
  return <pre>{JSON.stringify(item, null, 2)}</pre>;
}
