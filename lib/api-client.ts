export async function post<T>(url: string, data?: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data ?? {}) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
