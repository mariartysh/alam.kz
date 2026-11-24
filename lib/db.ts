import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __alamSql?: Sql };

/**
 * Подключение к Postgres (Supabase). На Vercel используйте строку transaction pooler (порт 6543):
 * prepared statements там не поддерживаются, поэтому prepare: false.
 */
export function sql(): Sql {
  if (g.__alamSql) return g.__alamSql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL не задан");
  g.__alamSql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, onnotice: () => {} });
  return g.__alamSql;
}
