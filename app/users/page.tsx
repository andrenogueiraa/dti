import { Bg } from "@/components/custom/bg";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import Link from "next/link";
import { Suspense } from "react";
import { UsersDataTable } from "./table";
import { getUsers } from "./server-actions";
import { ButtonClose } from "@/components/custom/button-close";

export const metadata = {
  title: "Usuários",
  description:
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet, fugit nostrum maxime consectetur obcaecati repellendus consequatur sequi omnis ab earum!",
};

export default function Server() {
  return (
    <Bg>
      <Pg className="max-w-5xl relative">
        <ButtonClose />
        <PgHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Inicio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{metadata.title}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PgTitle>{metadata.title}</PgTitle>
          <PgDescription>{metadata.description}</PgDescription>
        </PgHeader>

        <PgContent>
          <Suspense fallback={<div>Carregando usuários...</div>}>
            <Users />
          </Suspense>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function Users() {
  const users = await getUsers();

  if (!users) {
    return <div>Erro ao carregar usuários</div>;
  }

  if (users.length === 0) {
    return <div>Nenhum usuário encontrado</div>;
  }

  if (users.length > 0) {
    return <UsersDataTable users={users} />;
  }

  return <div>Erro desconhecido</div>;
}
