import LoadingPage from "@/components/custom/loading-page";
import { SimpleMarkdownPreview } from "@/components/custom/simple-markdown-preview";
import { Card, CardContent } from "@/components/ui/card";

import { db } from "@/drizzle";
import { Suspense } from "react";

export const metadata = {
  title: "Documento",
  description: "Página de visualização de documento",
};

export default async function Page({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;

  return (
    <Suspense fallback={<LoadingPage />}>
      <Doc docId={docId} />
    </Suspense>
  );
}

async function getDoc(docId: string) {
  "use server";
  return await db.query.docs.findFirst({
    where: (docs, { eq }) => eq(docs.id, docId),
    with: {
      type: true,
    },
  });
}

async function Doc({ docId }: { docId: string }) {
  const doc = await getDoc(docId);

  if (!doc) {
    return <div>Erro ao carregar documento</div>;
  }

  return (
    <Card className="max-w-prose mx-auto mt-8">
      <CardContent>
        <SimpleMarkdownPreview
          content={doc.content}
          typeLabel={doc.type.name || undefined}
          date={doc.date.toLocaleDateString("pt-BR")}
        />
      </CardContent>
    </Card>
  );
}
