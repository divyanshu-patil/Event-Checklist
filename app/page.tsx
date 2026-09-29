'use client';

import { useEffect, useRef, useState } from 'react';
import { overview, phases, type Phase, type Section } from './checklist';
import { Tabs } from './tabs';

type State = { sel: Record<string, true>; name: string; by: string };

const STORAGE_KEY = 'hackathon-checklist';
const initial: State = { sel: {}, name: '24-Hour National Hackathon', by: '' };
const keyOf = (p: Phase, s: Section, item: string) => `${p.id}/${s.title}/${item}`;
const keysOf = (p: Phase, s: Section) => s.items.map((i) => keyOf(p, s, i));

const btn =
  'rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-100';
const box = 'mt-0.5 size-4 shrink-0 cursor-pointer accent-indigo-600';

export default function Page() {
  const [state, setState] = useState(initial);
  const [today, setToday] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Client-only values load after hydration so the prerendered HTML matches.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...initial, ...JSON.parse(saved) });
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function save(next: State) {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function setMany(keys: string[], on: boolean) {
    const sel = { ...state.sel };
    for (const k of keys) {
      if (on) sel[k] = true;
      else delete sel[k];
    }
    save({ ...state, sel });
  }

  function saveBackup() {
    const a = document.createElement('a');
    a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(state, null, 2));
    a.download = `hackathon-checklist-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  async function loadBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data.sel !== 'object' || Array.isArray(data.sel)) throw new Error();
      const sel: State['sel'] = {};
      for (const [k, v] of Object.entries(data.sel)) if (v === true) sel[k] = true;
      if (total && !confirm('Replace your current selections with this backup?')) return;
      save({
        sel,
        name: typeof data.name === 'string' ? data.name : initial.name,
        by: typeof data.by === 'string' ? data.by : '',
      });
    } catch {
      alert('That file is not a valid checklist backup.');
    }
  }

  const count = (keys: string[]) => keys.filter((k) => state.sel[k]).length;
  const phaseKeys = (p: Phase) => p.sections.flatMap((s) => keysOf(p, s));
  const allKeys = phases.flatMap(phaseKeys);
  const total = count(allKeys);

  return (
    <>
      <div className="print:hidden">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
            <Tabs active="/" />
            <div className="mr-auto pl-2">
              <h1 className="font-semibold">Hackathon Checklist</h1>
              <p className="text-sm text-zinc-500">
                {total} of {allKeys.length} tasks selected for the report
              </p>
            </div>
            <button className={btn} onClick={() => setMany(allKeys, true)}>
              Select all
            </button>
            <button className={btn} onClick={() => setMany(allKeys, false)}>
              Clear
            </button>
            <button className={btn} onClick={saveBackup}>
              Save backup
            </button>
            <button className={btn} onClick={() => fileRef.current?.click()}>
              Load backup
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={loadBackup} />
            <button
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!total}
              onClick={() => window.print()}
            >
              Export PDF
            </button>
          </div>
          <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
            {phases.map((p) => {
              const keys = phaseKeys(p);
              return (
                <a
                  key={p.id}
                  href={`#${p.id}`}
                  className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm hover:bg-zinc-200"
                >
                  {p.title}{' '}
                  <span className="tabular-nums text-zinc-500">
                    {count(keys)}/{keys.length}
                  </span>
                </a>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-5xl space-y-12 px-4 py-8">
          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Event name
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal"
                  value={state.name}
                  onChange={(e) => save({ ...state, name: e.target.value })}
                />
              </label>
              <label className="text-sm font-medium">
                Prepared by
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal"
                  placeholder="Organising committee"
                  value={state.by}
                  onChange={(e) => save({ ...state, by: e.target.value })}
                />
              </label>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
              {overview.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {phases.map((p) => {
            const pk = phaseKeys(p);
            const all = count(pk) === pk.length;
            return (
              <section key={p.id} id={p.id} className="scroll-mt-32 space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{p.title}</h2>
                    <p className="text-sm text-zinc-500">{p.blurb}</p>
                  </div>
                  <button className={btn} onClick={() => setMany(pk, !all)}>
                    {all ? 'Clear phase' : 'Select phase'}
                  </button>
                </div>
                {p.sections.map((s) => {
                  const keys = keysOf(p, s);
                  const n = count(keys);
                  return (
                    <details key={s.title} open className="group rounded-xl border border-zinc-200 bg-white">
                      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                        <input
                          type="checkbox"
                          aria-label={`Select all in ${s.title}`}
                          className={box}
                          checked={n === keys.length}
                          ref={(el) => {
                            if (el) el.indeterminate = n > 0 && n < keys.length;
                          }}
                          onChange={(e) => setMany(keys, e.target.checked)}
                        />
                        <span className="font-medium">{s.title}</span>
                        <span className="ml-auto text-sm tabular-nums text-zinc-500">
                          {n}/{keys.length}
                        </span>
                        <span className="text-zinc-400 transition-transform group-open:rotate-180">▾</span>
                      </summary>
                      <ul className="grid gap-x-6 border-t border-zinc-100 px-2 py-2 sm:grid-cols-2">
                        {s.items.map((item, i) => (
                          <li key={item}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50">
                              <input
                                type="checkbox"
                                className={box}
                                checked={!!state.sel[keys[i]]}
                                onChange={(e) => setMany([keys[i]], e.target.checked)}
                              />
                              {item}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </details>
                  );
                })}
              </section>
            );
          })}
        </main>
      </div>

      <Report state={state} today={today} />
    </>
  );
}

function Report({ state, today }: { state: State; today: string }) {
  const picked = phases
    .map((p) => ({
      ...p,
      sections: p.sections
        .map((s) => ({ ...s, items: s.items.filter((i) => state.sel[keyOf(p, s, i)]) }))
        .filter((s) => s.items.length),
    }))
    .filter((p) => p.sections.length);
  const tasks = (p: (typeof picked)[number]) => p.sections.reduce((n, s) => n + s.items.length, 0);
  const total = picked.reduce((n, p) => n + tasks(p), 0);
  const th = 'border border-zinc-300 bg-zinc-100 px-2 py-1 text-left font-semibold';
  const td = 'border border-zinc-300 px-2 py-1 align-top';

  return (
    <article className="hidden text-[10pt] leading-snug text-black print:block">
      <header className="border-b-2 border-indigo-600 pb-3">
        <p className="text-[8pt] font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Event Operations Checklist
        </p>
        <h1 className="mt-1 text-[20pt] font-bold">{state.name}</h1>
        <p className="text-zinc-600">
          {[state.by && `Prepared by ${state.by}`, today && `Generated ${today}`, `${total} tasks`]
            .filter(Boolean)
            .join('  ·  ')}
        </p>
      </header>

      <h2 className="mt-6 mb-2 text-[12pt] font-bold">Event Overview</h2>
      <table className="w-full border-collapse">
        <tbody>
          {overview.map(([k, v]) => (
            <tr key={k}>
              <th className={`${th} w-1/4`}>{k}</th>
              <td className={td}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-6 mb-2 text-[12pt] font-bold">Summary</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={th}>Phase</th>
            <th className={`${th} w-24 text-right`}>Sections</th>
            <th className={`${th} w-24 text-right`}>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {picked.map((p, pi) => (
            <tr key={p.id}>
              <td className={td}>
                {pi + 1}. {p.title}
              </td>
              <td className={`${td} text-right`}>{p.sections.length}</td>
              <td className={`${td} text-right`}>{tasks(p)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className={td}>Total</td>
            <td className={`${td} text-right`}>{picked.reduce((n, p) => n + p.sections.length, 0)}</td>
            <td className={`${td} text-right`}>{total}</td>
          </tr>
        </tbody>
      </table>

      {picked.map((p, pi) => (
        <section key={p.id} className="break-before-page">
          <h2 className="border-b border-zinc-300 pb-1 text-[14pt] font-bold">
            {pi + 1}. {p.title}
          </h2>
          <p className="mt-1 text-zinc-600">{p.blurb}</p>
          {p.sections.map((s, si) => (
            <div key={s.title} className="mt-4 break-inside-avoid">
              <h3 className="mb-1 text-[11pt] font-semibold text-indigo-700">
                {pi + 1}.{si + 1} {s.title}
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={`${th} w-8`}>#</th>
                    <th className={th}>Task</th>
                    <th className={`${th} w-28`}>Owner</th>
                    <th className={`${th} w-24`}>Deadline</th>
                    <th className={`${th} w-14 text-center`}>Done</th>
                  </tr>
                </thead>
                <tbody>
                  {s.items.map((item, i) => (
                    <tr key={item} className="break-inside-avoid">
                      <td className={`${td} text-zinc-500`}>{i + 1}</td>
                      <td className={td}>{item}</td>
                      <td className={td} />
                      <td className={td} />
                      <td className={`${td} text-center`}>
                        <span className="inline-block size-3 border border-zinc-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
