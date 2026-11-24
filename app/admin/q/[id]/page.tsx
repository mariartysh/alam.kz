import { notFound } from "next/navigation";
import { getAdminQuestion, requireAdminPage, type AdminQuestion } from "@/lib/admin";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import { PageTitle } from "@/components/PageTitle";

const blank = (): AdminQuestion => ({
  id: "", topic: "numeric", difficulty: "A", answer: 0, status: "draft",
  ru: { stem: "", options: ["", "", "", ""], explanation: "" },
  kz: { stem: "", options: ["", "", "", ""], explanation: "" },
});

export default async function EditQuestion({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const q = id === "new" ? blank() : await getAdminQuestion(id);
  if (!q) notFound();
  return (
    <div className="space-y-4">
      <PageTitle title={id === "new" ? "Новая задача" : q.id} back="/admin" />
      <QuestionEditor initial={q} isNew={id === "new"} />
    </div>
  );
}
