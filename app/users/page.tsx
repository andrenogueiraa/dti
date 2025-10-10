import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { db } from "@/drizzle";
import { Suspense } from "react";

export const metadata = {
  title: "Usuários",
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

      <PgContent>
        <Suspense fallback={<div>Carregando usuários...</div>}>
          <Users />
        </Suspense>
      </PgContent>
    </Pg>
  );
}

async function Users() {
  const users = await db.query.user.findMany();

  if (!users) {
    return <div>Erro ao carregar usuários</div>;
  }

  if (users.length === 0) {
    return <div>Nenhum usuário encontrado</div>;
  }

  if (users.length > 0) {
    return (
      <div>
        {users.map((user) => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }

  return <div>Erro desconhecido</div>;
}
