import { Bg } from "@/components/custom/bg";
import {
  Pg,
  PgContent,
  PgDescription,
  PgHeader,
  PgTitle,
} from "@/components/ui/pg";
import { Metadata } from "next";
import UploadForm from "./form";

const title = "Uploads";
const description = "Uploads de arquivos";

export const metadata: Metadata = {
  title,
  description,
};

export default function Page() {
  return (
    <Bg>
      <Pg>
        <PgHeader>
          <PgTitle>{title}</PgTitle>
          <PgDescription>{description}</PgDescription>
        </PgHeader>
        <PgContent>
          <UploadForm />
        </PgContent>
      </Pg>
    </Bg>
  );
}
