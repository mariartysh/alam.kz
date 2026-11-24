import Link from "next/link";

export function PageTitle({ title, subtitle, back = "/" }: { title: string; subtitle?: string; back?: string }) {
  return (
    <div className="flex items-start gap-2">
      <Link href={back} className="-ml-1 grid size-8 shrink-0 place-items-center rounded-full text-xl text-hint" aria-label="←">‹</Link>
      <div>
        <h1 className="text-xl font-bold leading-8">{title}</h1>
        {subtitle && <p className="text-sm text-hint">{subtitle}</p>}
      </div>
    </div>
  );
}
