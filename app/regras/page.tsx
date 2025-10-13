import { Bg } from "@/components/custom/bg";
import { ButtonClose } from "@/components/custom/button-close";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";

export const metadata = {
  title: "Regras",
  description: "Regras do sistema",
};

export default function Server() {
  return (
    <Bg>
      <Pg className="relative">
        <ButtonClose href="/" />

        <PgHeader>
          <PgTitle>{metadata.title}</PgTitle>
          <PgDescription>{metadata.description}</PgDescription>
        </PgHeader>

        <PgContent className="prose space-y-8">
          <section>
            <h2>Diretor de TI</h2>
            <ul>
              <li>Criar e gerenciar projetos</li>
              <li>Criar e gerenciar equipes</li>
            </ul>
          </section>

          <section>
            <h2>Líder de equipe</h2>
            <ul>
              <li>Criar e gerenciar sprints</li>
              <li>Criar e gerenciar tarefas</li>
              <li>Criar e gerenciar documentos</li>
            </ul>
          </section>

          <section>
            <h2>Membro da equipe</h2>
            <ul>
              <li>Criar e gerenciar tarefas</li>
              <li>Criar e gerenciar documentos</li>
            </ul>
          </section>

          <section>
            <h2>Product owner</h2>
            <ul>
              <li>Acompanhar o progresso do projeto</li>
              <li>Assinar ata de sprint review</li>
            </ul>
          </section>
        </PgContent>
      </Pg>
    </Bg>
  );
}
