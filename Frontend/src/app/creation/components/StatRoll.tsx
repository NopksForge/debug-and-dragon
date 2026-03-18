"use client";

import type { StatKey } from "../raceAPI";
import { STATS, type Stat, getRecommendedStatBoxClass, getStatTagClass, statKeyFromAbbrev } from "../statStyles";

function roll4d6DropLowest(): number {
  const dice = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  dice.sort((a, b) => a - b);
  return dice[1] + dice[2] + dice[3];
}

function rollStats(): number[] {
  return Array.from({ length: 6 }, () => roll4d6DropLowest());
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function StatRoll(props: {
  canShow: boolean;
  rolledValues: number[] | null;
  setRolledValues: (v: number[] | null) => void;
  statToIndex: Record<Stat, number | null>;
  setStatToIndex: (next: Record<Stat, number | null> | ((prev: Record<Stat, number | null>) => Record<Stat, number | null>)) => void;
  draggedIndex: number | null;
  setDraggedIndex: (v: number | null) => void;
  draggedStat: Stat | null;
  setDraggedStat: (v: Stat | null) => void;
  recommendedStats: Set<Stat>;
}) {
  const {
    canShow,
    rolledValues,
    setRolledValues,
    statToIndex,
    setStatToIndex,
    draggedIndex,
    setDraggedIndex,
    draggedStat,
    setDraggedStat,
    recommendedStats,
  } = props;

  const unassignedIndices =
    rolledValues == null
      ? []
      : [0, 1, 2, 3, 4, 5].filter((i) => !Object.values(statToIndex).includes(i));

  const handleRoll = () => {
    setRolledValues(rollStats());
    setStatToIndex({
      STR: null,
      DEX: null,
      CON: null,
      INT: null,
      WIS: null,
      CHA: null,
    });
  };

  const handleRandomAssign = () => {
    if (rolledValues == null) return;
    const indices = shuffle([0, 1, 2, 3, 4, 5]);
    setStatToIndex({
      STR: indices[0],
      DEX: indices[1],
      CON: indices[2],
      INT: indices[3],
      WIS: indices[4],
      CHA: indices[5],
    });
  };

  const assignIndexToStat = (index: number, stat: Stat) => {
    setStatToIndex((prev) => {
      const next = { ...prev };
      const existing = Object.entries(prev).find(([_, i]) => i === index)?.[0] as
        | Stat
        | undefined;
      if (existing) next[existing] = null;
      next[stat] = index;
      return next;
    });
  };

  const unassignStat = (stat: Stat) => {
    setStatToIndex((prev) => ({ ...prev, [stat]: null }));
  };

  const onDragStartPool = (index: number) => {
    setDraggedIndex(index);
    setDraggedStat(null);
  };
  const onDragStartStat = (stat: Stat) => {
    setDraggedStat(stat);
    setDraggedIndex(null);
  };
  const onDragEnd = () => {
    setDraggedIndex(null);
    setDraggedStat(null);
  };
  const onDropOnStat = (e: React.DragEvent, stat: Stat) => {
    e.preventDefault();
    let index: number | null = draggedIndex;
    if (index == null && draggedStat != null) index = statToIndex[draggedStat];
    if (index == null) {
      const raw = e.dataTransfer.getData("index");
      if (raw !== "") index = Number(raw);
    }
    if (index != null) assignIndexToStat(index, stat);
    onDragEnd();
  };
  const onDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedStat != null) unassignStat(draggedStat);
    onDragEnd();
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  if (!canShow) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">
        Stats (4d6 drop lowest)
      </h2>
      {rolledValues == null ? (
        <button
          type="button"
          onClick={handleRoll}
          className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-700"
        >
          Roll stats
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">
              Rolled: {rolledValues.join(", ")}
            </span>
            <button
              type="button"
              onClick={handleRoll}
              className="text-xs text-zinc-400 underline hover:text-zinc-200"
            >
              Re-roll
            </button>
            {unassignedIndices.length > 0 && (
              <button
                type="button"
                onClick={handleRandomAssign}
                className="rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
              >
                Randomly assign all
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-zinc-500">Drag values to stats</p>
              <div
                onDragOver={onDragOver}
                onDrop={onDropOnPool}
                className="min-h-[72px] rounded-lg border border-dashed border-zinc-600 bg-zinc-900/50 p-2"
              >
                <div className="flex flex-wrap gap-2">
                  {unassignedIndices.map((i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => {
                        onDragStartPool(i);
                        e.dataTransfer.setData("index", String(i));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={onDragEnd}
                      className={`cursor-grab rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 active:cursor-grabbing ${
                        draggedIndex === i ? "opacity-50" : "hover:border-zinc-500"
                      }`}
                    >
                      {rolledValues[i]}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-zinc-500">Assign to stats</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {STATS.map((stat) => {
                  const idx = statToIndex[stat];
                  const value = idx != null ? rolledValues[idx] : null;
                  const isRecommended = rolledValues != null && recommendedStats.has(stat);
                  const recommendedKey = isRecommended ? statKeyFromAbbrev(stat) : null;

                  return (
                    <div
                      key={stat}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDropOnStat(e, stat)}
                      className={`rounded-lg border bg-zinc-800/50 p-2 transition ${
                        value != null ? "border-zinc-600" : "border-dashed border-zinc-600"
                      } ${draggedStat === stat ? "opacity-50" : ""} ${
                        recommendedKey ? getRecommendedStatBoxClass(recommendedKey) : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-zinc-500">{stat}</div>
                        {isRecommended && (
                          <div
                            className={`inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] leading-none font-medium ${
                              recommendedKey
                                ? getStatTagClass(recommendedKey, false)
                                : "border-zinc-600 bg-zinc-900/40 text-zinc-200"
                            }`}
                          >
                            rec
                          </div>
                        )}
                      </div>
                      {value != null ? (
                        <div
                          draggable
                          onDragStart={(e) => {
                            onDragStartStat(stat);
                            e.dataTransfer.setData("index", String(idx));
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={onDragEnd}
                          className="cursor-grab text-lg font-semibold text-zinc-100 active:cursor-grabbing"
                        >
                          {value}
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-600">—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

