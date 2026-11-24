"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api-client";

export function StartExamButton({ label, error }: { label: string; error: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const start = async () => {
    setBusy(true);
    try {
      const r = await post<{ attemptId: string }>("/api/exam/start");
      router.push(`/exam/${r.attemptId}`);
    } catch { setFailed(true); setBusy(false); }
  };
  return (
    <>
      <button onClick={start} disabled={busy} className="w-full rounded-xl bg-btn py-3.5 font-semibold text-btn-text disabled:opacity-60">
        {label}
      </button>
      {failed && <p className="mt-2 text-center text-sm text-bad">{error}</p>}
    </>
  );
}
