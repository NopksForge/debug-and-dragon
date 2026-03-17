"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorPopup } from "../components/ErrorPopup";
import { createCharacter } from "./characterApi";

const RACES = ["Human", "Elf", "Dwarf", "Orc"] as const;
const CLASSES = [
  "Fighter",
  "Wizard",
  "Cleric",
  "Rogue",
  "Ranger",
  "Paladin",
  "Barbarian",
] as const;

const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Stat = (typeof STATS)[number];

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

export default function CreationPage() {
  const [race, setRace] = useState<string | null>(null);
  const [characterClass, setCharacterClass] = useState<string | null>(null);
  const [rolledValues, setRolledValues] = useState<number[] | null>(null);
  const [statToIndex, setStatToIndex] = useState<Record<Stat, number | null>>({
    STR: null,
    DEX: null,
    CON: null,
    INT: null,
    WIS: null,
    CHA: null,
  });
  const [name, setName] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const router = useRouter();
  const [draggedStat, setDraggedStat] = useState<Stat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const canShowStats = race !== null && characterClass !== null;
  const unassignedIndices =
    rolledValues == null
      ? []
      : [0, 1, 2, 3, 4, 5].filter(
          (i) => !Object.values(statToIndex).includes(i)
        );
  const allAssigned = unassignedIndices.length === 0 && rolledValues !== null;
  const canContinue =
    canShowStats && allAssigned && name.trim().length > 0;

  const handleRoll = useCallback(() => {
    setRolledValues(rollStats());
    setStatToIndex({
      STR: null,
      DEX: null,
      CON: null,
      INT: null,
      WIS: null,
      CHA: null,
    });
  }, []);

  const handleRandomAssign = useCallback(() => {
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
  }, [rolledValues]);

  const assignIndexToStat = useCallback((index: number, stat: Stat) => {
    setStatToIndex((prev) => {
      const next = { ...prev };
      const existing = Object.entries(prev).find(
        ([_, i]) => i === index
      )?.[0] as Stat | undefined;
      if (existing) next[existing] = null;
      next[stat] = index;
      return next;
    });
  }, []);

  const unassignStat = useCallback((stat: Stat) => {
    setStatToIndex((prev) => ({ ...prev, [stat]: null }));
  }, []);

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

  const handleConfirmCharacter = useCallback(async () => {
    if (!rolledValues || !race || !characterClass || !name.trim()) return;

    const getStatValue = (stat: Stat) => {
      const idx = statToIndex[stat];
      return idx != null ? rolledValues[idx]! : 0;
    };

    const payload = {
      name: name.trim(),
      race: race.toLowerCase(),
      class: characterClass.toLowerCase(),
      stats: {
        str: getStatValue("STR"),
        int: getStatValue("INT"),
        dex: getStatValue("DEX"),
        con: getStatValue("CON"),
        wis: getStatValue("WIS"),
        cha: getStatValue("CHA"),
      },
    };

    try {
      setIsSubmitting(true);
      await createCharacter(payload);
      router.push("/game");
    } catch {
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [rolledValues, race, characterClass, name, statToIndex, router]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          ← Back
        </Link>

        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">
          Create character
        </h1>
        <p className="mb-10 text-sm text-zinc-400">
          Choose your race and class, then roll and assign stats.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Race</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RACES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRace(r)}
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                  race === r
                    ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Class</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CLASSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCharacterClass(c)}
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                  characterClass === c
                    ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {canShowStats && (
          <>
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
                      <p className="mb-2 text-xs text-zinc-500">
                        Drag values to stats
                      </p>
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
                                draggedIndex === i
                                  ? "opacity-50"
                                  : "hover:border-zinc-500"
                              }`}
                            >
                              {rolledValues[i]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-zinc-500">
                        Assign to stats
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {STATS.map((stat) => {
                          const idx = statToIndex[stat];
                          const value = idx != null ? rolledValues[idx] : null;
                          return (
                            <div
                              key={stat}
                              onDragOver={onDragOver}
                              onDrop={(e) => onDropOnStat(e, stat)}
                              className={`rounded-lg border bg-zinc-800/50 p-2 transition ${
                                value != null
                                  ? "border-zinc-600"
                                  : "border-dashed border-zinc-600"
                              } ${draggedStat === stat ? "opacity-50" : ""}`}
                            >
                              <div className="text-xs text-zinc-500">
                                {stat}
                              </div>
                              {value != null ? (
                                <div
                                  draggable
                                  onDragStart={(e) => {
                                    onDragStartStat(stat);
                                    e.dataTransfer.setData(
                                      "index",
                                      String(idx)
                                    );
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragEnd={onDragEnd}
                                  className="cursor-grab text-lg font-semibold text-zinc-100 active:cursor-grabbing"
                                >
                                  {value}
                                </div>
                              ) : (
                                <div className="text-sm text-zinc-600">
                                  —
                                </div>
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

            {allAssigned && (
              <section className="mb-10">
                <h2 className="mb-3 text-sm font-medium text-zinc-300">
                  Name
                </h2>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Character name"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </section>
            )}

            {canContinue && (
              <button
                type="button"
                onClick={() => setShowConfirmPopup(true)}
                className="inline-block rounded-lg bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Continue to game
              </button>
            )}
            {allAssigned && !canContinue && (
              <p className="text-sm text-zinc-500">
                Enter a name to continue.
              </p>
            )}

            {showConfirmPopup && rolledValues && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={() => setShowConfirmPopup(false)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
              >
                <div
                  className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2
                    id="confirm-title"
                    className="mb-4 text-lg font-semibold text-zinc-100"
                  >
                    Confirm character
                  </h2>
                  <dl className="mb-6 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">Name</dt>
                      <dd className="font-medium text-zinc-200">
                        {name.trim()}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">Race</dt>
                      <dd className="font-medium text-zinc-200">{race}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">Class</dt>
                      <dd className="font-medium text-zinc-200">
                        {characterClass}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">Stats</dt>
                      <dd className="font-medium text-zinc-200">
                        {STATS.map(
                          (s) =>
                            `${s} ${statToIndex[s] != null ? rolledValues[statToIndex[s]!] : "—"}`
                        ).join(", ")}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPopup(false)}
                      className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCharacter}
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-white"
                    >
                      {isSubmitting ? "Saving..." : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {showError && (
        <ErrorPopup
          message="Something went wrong, please try again later."
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}
