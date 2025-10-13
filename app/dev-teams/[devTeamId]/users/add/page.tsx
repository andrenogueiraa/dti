import { Pg, PgContent, PgHeader, PgTitle } from "@/components/ui/pg";
import { Suspense } from "react";
import { addUserToDevTeam, getRoles, getUsers } from "./server-actions";
import ButtonSubmit from "@/components/custom/button-submit";
import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";

export default async function Server({
  params,
}: {
  params: Promise<{ devTeamId: string }>;
}) {
  const { devTeamId } = await params;

  return (
    <Bg className="flex items-center justify-center">
      <Pg className="w-full max-w-md mx-auto relative min-h-fit rounded-lg">
        <PgHeader>
          <ButtonClose />
          <PgTitle className="font-semibold text-2xl">
            Adicionar usuário
          </PgTitle>
        </PgHeader>

        <PgContent>
          <form action={addUserToDevTeam} className="space-y-4">
            <input type="hidden" name="devTeamId" value={devTeamId} />

            <Suspense fallback={<div>Carregando usuários...</div>}>
              <UsersList />
            </Suspense>

            <Suspense fallback={<div>Carregando papéis...</div>}>
              <RolesList />
            </Suspense>

            <ButtonSubmit label="Adicionar" className="w-full" />
          </form>
        </PgContent>
      </Pg>
    </Bg>
  );
}

async function UsersList() {
  const user = await getUsers();

  if (!user) {
    return <div>Erro ao buscar usuários</div>;
  }

  if (user.length === 0) {
    return <div>Nenhum usuário encontrado</div>;
  }

  if (user.length > 0) {
    return (
      <div>
        <label htmlFor="userId" hidden>
          Usuário
        </label>
        <select name="userId" className="w-full" defaultValue={""}>
          <option value="" disabled>
            Selecione um usuário
          </option>
          {user.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return <div>Erro desconhecido</div>;
}

async function RolesList() {
  const roles = await getRoles();

  if (!roles) {
    return <div>Erro ao buscar papéis</div>;
  }

  if (roles.length === 0) {
    return <div>Nenhum papel encontrado</div>;
  }

  if (roles.length > 0) {
    return (
      <div>
        <label htmlFor="roleId" hidden>
          Papel
        </label>
        <select name="roleId" className="w-full" defaultValue={""}>
          <option value="" disabled>
            Selecione um papel
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return <div>Erro desconhecido</div>;
}
