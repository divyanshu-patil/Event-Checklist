import Link from 'next/link';

const tabs = [
  ['/', 'Checklist'],
  ['/flow', 'Flow Maker'],
] as const;

export function Tabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm font-medium">
      {tabs.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-md px-3 py-1 ${href === active ? 'bg-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
