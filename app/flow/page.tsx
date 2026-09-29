'use client';

import { useEffect, useRef, useState } from 'react';
import { phases } from '../checklist';
import { Tabs } from '../tabs';
import { defaultFlow, type Flow, type Group, type Item } from './defaults';

const STORAGE_KEY = 'hackathon-flow';
const uid = () => crypto.randomUUID();
const field = 'rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-zinc-300 focus:border-indigo-500 focus:bg-white focus:outline-none';
const btn = 'rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-100';

type Drag = { text: string; time?: string; id?: string } | null;

export default function Page() {
  const [flow, setFlow] = useState(defaultFlow);
  const [today, setToday] = useState('');
  const drag = useRef<Drag>(null);
  const [over, setOver] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFlow({ ...defaultFlow, ...JSON.parse(saved) });
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function save(next: Flow) {
    setFlow(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  const mapGroups = (fn: (g: Group) => Group): Flow => ({
    ...flow,
    secs: flow.secs.map((s) => ({ ...s, groups: s.groups.map(fn) })),
  });
  const edit = (gid: string, fn: (items: Item[]) => Item[]) =>
    save(mapGroups((g) => (g.id === gid ? { ...g, items: fn(g.items) } : g)));

  // Drop a dragged task into group `gid`, before item `before` (or at the end).
  function drop(gid: string, before?: string) {
    const d = drag.current;
    drag.current = null;
    setOver('');
    if (!d || d.id === before) return;
    const item: Item = { id: d.id ?? uid(), text: d.text, time: d.time ?? '' };
    const cleared = d.id ? mapGroups((g) => ({ ...g, items: g.items.filter((i) => i.id !== d.id) })) : flow;
    save({
      ...cleared,
      secs: cleared.secs.map((s) => ({
        ...s,
        groups: s.groups.map((g) => {
          if (g.id !== gid) return g;
          const at = before ? g.items.findIndex((i) => i.id === before) : -1;
          const items = [...g.items];
          items.splice(at < 0 ? items.length : at, 0, item);
          return { ...g, items };
        }),
      })),
    });
  }

  function reset() {
    if (confirm('Reset the flow to the default plan? Your edits will be lost.')) save(defaultFlow);
  }

  const asks = flow.asks.split('\n').filter((l) => l.trim());

  return (
    <>
      <div className="print:hidden">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
            <Tabs active="/flow" />
            <div className="mr-auto pl-2">
              <h1 className="font-semibold">Flow Maker</h1>
              <p className="text-sm text-zinc-500">Drag tasks in, edit text &amp; timeline, export as a proposal letter</p>
            </div>
            <button className={btn} onClick={reset}>
              Reset to default
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              onClick={() => window.print()}
            >
              Export letter PDF
            </button>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[18rem_1fr]">
          <aside className="space-y-2 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <h2 className="text-sm font-semibold">Task bank</h2>
            <p className="text-xs text-zinc-500">Drag any task into the flow. Drop it back here to remove it from the flow.</p>
            <div
              onDragOver={(e) => drag.current?.id && e.preventDefault()}
              onDrop={() => {
                const id = drag.current?.id;
                drag.current = null;
                if (id) save(mapGroups((g) => ({ ...g, items: g.items.filter((i) => i.id !== id) })));
              }}
              className="space-y-2"
            >
              {phases.map((p) => (
                <details key={p.id} className="rounded-lg border border-zinc-200 bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-medium">{p.title}</summary>
                  {p.sections.map((s) => (
                    <details key={s.title} className="border-t border-zinc-100">
                      <summary className="cursor-pointer px-3 py-1.5 text-xs font-medium text-zinc-600">{s.title}</summary>
                      <ul className="space-y-1 px-2 pb-2">
                        {s.items.map((t) => (
                          <li
                            key={t}
                            draggable
                            onDragStart={() => (drag.current = { text: t })}
                            className="cursor-grab rounded-md bg-zinc-50 px-2 py-1 text-xs hover:bg-indigo-50"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </details>
              ))}
            </div>
          </aside>

          <main className="min-w-0 space-y-8">
            <section className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-3">
              {(
                [
                  ['Event name', 'name'],
                  ['Prepared by', 'by'],
                  ['Addressed to', 'to'],
                ] as const
              ).map(([label, k]) => (
                <label key={k} className="text-sm font-medium">
                  {label}
                  <input
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal"
                    value={flow[k]}
                    onChange={(e) => save({ ...flow, [k]: e.target.value })}
                  />
                </label>
              ))}
              <label className="text-sm font-medium sm:col-span-3">
                Letter introduction
                <textarea
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal"
                  value={flow.intro}
                  onChange={(e) => save({ ...flow, intro: e.target.value })}
                />
              </label>
              <label className="text-sm font-medium sm:col-span-3">
                Permissions requested (one per line)
                <textarea
                  rows={7}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal"
                  value={flow.asks}
                  onChange={(e) => save({ ...flow, asks: e.target.value })}
                />
              </label>
            </section>

            {flow.secs.map((s) => (
              <section key={s.id} className="space-y-3">
                <div>
                  <input
                    className={`${field} w-full text-xl font-semibold`}
                    value={s.title}
                    onChange={(e) => save({ ...flow, secs: flow.secs.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)) })}
                  />
                  <input
                    className={`${field} w-full text-sm text-zinc-500`}
                    value={s.blurb}
                    onChange={(e) => save({ ...flow, secs: flow.secs.map((x) => (x.id === s.id ? { ...x, blurb: e.target.value } : x)) })}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {s.groups.map((gr) => (
                    <div
                      key={gr.id}
                      onDragOver={(e) => {
                        if (!drag.current) return;
                        e.preventDefault();
                        setOver(gr.id);
                      }}
                      onDragLeave={() => setOver('')}
                      onDrop={() => drop(gr.id)}
                      className={`flex flex-col rounded-xl border bg-white ${over === gr.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-zinc-200'}`}
                    >
                      <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-2">
                        <input
                          className={`${field} min-w-0 flex-1 text-sm font-semibold`}
                          value={gr.title}
                          onChange={(e) => save(mapGroups((x) => (x.id === gr.id ? { ...x, title: e.target.value } : x)))}
                        />
                        <button
                          title="Remove block"
                          className="px-1 text-zinc-400 hover:text-red-600"
                          onClick={() => save({ ...flow, secs: flow.secs.map((x) => ({ ...x, groups: x.groups.filter((y) => y.id !== gr.id) })) })}
                        >
                          ✕
                        </button>
                      </div>
                      <ul className="flex-1 space-y-1 p-2">
                        {gr.items.map((i) => (
                          <li
                            key={i.id}
                            draggable
                            onDragStart={() => (drag.current = { id: i.id, text: i.text, time: i.time })}
                            onDragOver={(e) => drag.current && e.preventDefault()}
                            onDrop={(e) => {
                              e.stopPropagation();
                              drop(gr.id, i.id);
                            }}
                            className="group flex items-start gap-1 rounded-md bg-zinc-50 p-1"
                          >
                            <span className="cursor-grab select-none px-0.5 text-zinc-400">⠿</span>
                            <div className="min-w-0 flex-1">
                              <input
                                aria-label="Timeline"
                                className={`${field} w-full text-xs font-medium text-indigo-700`}
                                placeholder="Time"
                                value={i.time}
                                onChange={(e) => edit(gr.id, (a) => a.map((x) => (x.id === i.id ? { ...x, time: e.target.value } : x)))}
                              />
                              <textarea
                                aria-label="Task"
                                rows={1}
                                className={`${field} w-full resize-none text-sm [field-sizing:content]`}
                                value={i.text}
                                onChange={(e) => edit(gr.id, (a) => a.map((x) => (x.id === i.id ? { ...x, text: e.target.value } : x)))}
                              />
                            </div>
                            <button
                              title="Remove task"
                              className="px-1 text-zinc-400 hover:text-red-600"
                              onClick={() => edit(gr.id, (a) => a.filter((x) => x.id !== i.id))}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        className="border-t border-zinc-100 px-3 py-1.5 text-left text-xs text-zinc-500 hover:bg-zinc-50"
                        onClick={() => edit(gr.id, (a) => [...a, { id: uid(), text: 'New task', time: '' }])}
                      >
                        + Add task
                      </button>
                    </div>
                  ))}
                  <button
                    className="min-h-24 rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500 hover:bg-white"
                    onClick={() =>
                      save({
                        ...flow,
                        secs: flow.secs.map((x) => (x.id === s.id ? { ...x, groups: [...x.groups, { id: uid(), title: 'New block', items: [] }] } : x)),
                      })
                    }
                  >
                    + Add block
                  </button>
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>

      <Letter flow={flow} today={today} asks={asks} />
    </>
  );
}

function Letter({ flow, today, asks }: { flow: Flow; today: string; asks: string[] }) {
  const th = 'border border-zinc-300 bg-zinc-100 px-2 py-1 text-left font-semibold';
  const td = 'border border-zinc-300 px-2 py-1 align-top';
  return (
    <article className="hidden text-[10.5pt] leading-relaxed text-black print:block">
      <header className="border-b-2 border-indigo-600 pb-2">
        <p className="text-[8pt] font-semibold uppercase tracking-[0.2em] text-indigo-600">Proposal &amp; Request for Permission</p>
        <h1 className="text-[20pt] font-bold">{flow.name}</h1>
      </header>
      <p className="mt-4 text-right">{today}</p>
      <p className="mt-2">
        To,
        <br />
        <strong>{flow.to}</strong>
      </p>
      <p className="mt-3">
        <strong>Subject: Request for permission to organise {flow.name}</strong>
      </p>
      <p className="mt-3">Respected Sir/Madam,</p>
      <p className="mt-2 whitespace-pre-line">{flow.intro}</p>

      {flow.secs.map((s, si) => (
        <section key={s.id} className="break-before-page">
          <h2 className="border-b border-zinc-300 pb-1 text-[14pt] font-bold">
            {si + 1}. {s.title}
          </h2>
          <p className="mt-1 text-zinc-600">{s.blurb}</p>
          {s.groups.map((g) => (
            <div key={g.id} className="mt-3 break-inside-avoid">
              <h3 className="mb-1 text-[11pt] font-semibold text-indigo-700">{g.title}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={`${th} w-32`}>Timeline</th>
                    <th className={th}>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((i) => (
                    <tr key={i.id} className="break-inside-avoid">
                      <td className={td}>{i.time}</td>
                      <td className={td}>{i.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ))}

      <section className="break-before-page">
        <h2 className="border-b border-zinc-300 pb-1 text-[14pt] font-bold">Permissions Requested</h2>
        <p className="mt-2">We kindly request your approval for the following:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          {asks.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ol>
        <p className="mt-4">
          We assure you that the event will be conducted with full discipline, safety and respect for institutional rules. We would be grateful for your
          kind support.
        </p>
        <p className="mt-4">Thanking you,</p>
        <p className="mt-10 font-semibold">{flow.by}</p>
        <div className="mt-10 flex justify-between text-zinc-600">
          <span>Approved by: ____________________</span>
          <span>Date: ______________</span>
        </div>
      </section>
    </article>
  );
}
