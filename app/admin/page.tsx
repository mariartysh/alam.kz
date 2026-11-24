import { requireAdminPage, listAdminQuestions } from "@/lib/admin";
import { AdminList } from "@/components/admin/AdminList";
import { PageTitle } from "@/components/PageTitle";

export const metadata = { title: "alam — админка" };

export default async function AdminPage() {
  await requireAdminPage();
  const qs = await listAdminQuestions();
  return (
    <div className="space-y-4">
      <PageTitle title="Задачи" subtitle={`В базе: ${qs.length}`} />
      <AdminList
        items={qs.map((q) => ({ id: q.id, topic: q.topic, difficulty: q.difficulty, status: q.status, stem: q.ru.stem, kzStem: q.kz.stem }))}
      />
    </div>
  );
}
