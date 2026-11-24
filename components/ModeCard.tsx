import Link from "next/link";

export function ModeCard({
  href, title, desc, icon, badge,
}: { href: string; title: string; desc: string; icon: string; badge?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition active:scale-[0.98]"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-bg-2 text-2xl" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-semibold">
          {title}
          {badge && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-text">{badge}</span>}
        </span>
        <span className="block text-sm text-hint">{desc}</span>
      </span>
      <span className="text-hint" aria-hidden="true">›</span>
    </Link>
  );
}
