"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorPopup } from "../components/ErrorPopup";
import { createCharacter } from "./characterApi";
import { listRaces, type Race, type StatKey } from "./raceAPI";
import { listClasses, type Class } from "./classAPI";

const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Stat = (typeof STATS)[number];

const STAT_KEY_LABEL: Record<StatKey, Stat> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

const STAT_TAG_CLASS: Record<
  StatKey,
  { selected: string; unselected: string }
> = {
  str: {
    unselected: "border-red-500/30 bg-red-500/15 text-red-200",
    selected: "border-red-200 bg-red-100 text-red-800",
  },
  dex: {
    unselected: "border-green-500/30 bg-green-500/15 text-green-200",
    selected: "border-green-200 bg-green-100 text-green-800",
  },
  con: {
    unselected: "border-amber-700/30 bg-amber-700/15 text-amber-200",
    selected: "border-amber-200 bg-amber-100 text-amber-800",
  },
  int: {
    unselected: "border-blue-500/30 bg-blue-500/15 text-blue-200",
    selected: "border-blue-200 bg-blue-100 text-blue-800",
  },
  wis: {
    unselected: "border-purple-500/30 bg-purple-500/15 text-purple-200",
    selected: "border-purple-200 bg-purple-100 text-purple-800",
  },
  cha: {
    unselected: "border-pink-500/30 bg-pink-500/15 text-pink-200",
    selected: "border-pink-200 bg-pink-100 text-pink-800",
  },
};

function getStatTagClass(key: StatKey, isSelected: boolean): string {
  return isSelected ? STAT_TAG_CLASS[key].selected : STAT_TAG_CLASS[key].unselected;
}

const STAT_RECOMMEND_CLASS: Record<StatKey, string> = {
  str: "ring-2 ring-red-400/40 bg-red-500/5 border-red-500/40",
  dex: "ring-2 ring-green-400/40 bg-green-500/5 border-green-500/40",
  con: "ring-2 ring-amber-300/40 bg-amber-500/5 border-amber-500/40",
  int: "ring-2 ring-blue-400/40 bg-blue-500/5 border-blue-500/40",
  wis: "ring-2 ring-purple-400/40 bg-purple-500/5 border-purple-500/40",
  cha: "ring-2 ring-pink-400/40 bg-pink-500/5 border-pink-500/40",
};

function getRecommendedStatBoxClass(key: StatKey): string {
  return STAT_RECOMMEND_CLASS[key];
}

function statKeyFromAbbrev(stat: string): StatKey | null {
  switch (stat) {
    case "STR":
      return "str";
    case "DEX":
      return "dex";
    case "CON":
      return "con";
    case "INT":
      return "int";
    case "WIS":
      return "wis";
    case "CHA":
      return "cha";
    default:
      return null;
  }
}

type RaceBonusView =
  | { kind: "none" }
  | { kind: "all"; value: number }
  | { kind: "parts"; parts: { key: StatKey; value: number }[] };

function getRaceBonusView(bonuses: Race["stat_bonuses"]): RaceBonusView {
  const normalized = bonuses ?? {};
  const keys: StatKey[] = ["str", "dex", "con", "int", "wis", "cha"];
  const allValues = keys.map((k) => normalized[k]);
  const allPresent = allValues.every((v) => typeof v === "number");
  const first = allValues[0];
  const allSamePositive =
    allPresent &&
    typeof first === "number" &&
    first > 0 &&
    allValues.every((v) => v === first);

  if (allSamePositive) {
    return { kind: "all", value: first as number };
  }

  const parts = keys
    .map((k) => ({ key: k, value: normalized[k] }))
    .filter(
      (p): p is { key: StatKey; value: number } =>
        typeof p.value === "number" && p.value !== 0
    );

  if (parts.length === 0) return { kind: "none" };
  return { kind: "parts", parts };
}

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
  const [availableRaces, setAvailableRaces] = useState<Race[]>([]);
  const [isLoadingRaces, setIsLoadingRaces] = useState(true);
  const [raceLoadFailed, setRaceLoadFailed] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classLoadFailed, setClassLoadFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoadingRaces(true);
        setRaceLoadFailed(false);
        const races = await listRaces();
        if (!isMounted) return;
        setAvailableRaces(races);
      } catch {
        if (!isMounted) return;
        setRaceLoadFailed(true);
      } finally {
        if (!isMounted) return;
        setIsLoadingRaces(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoadingClasses(true);
        setClassLoadFailed(false);
        const classes = await listClasses();
        if (!isMounted) return;
        setAvailableClasses(classes);
      } catch {
        if (!isMounted) return;
        setClassLoadFailed(true);
      } finally {
        if (!isMounted) return;
        setIsLoadingClasses(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const canShowStats = race !== null && characterClass !== null;
  const recommendedStats = (() => {
    if (!characterClass) return new Set<Stat>();
    const picked = availableClasses.find((c) => c.name === characterClass);
    const out = new Set<Stat>();
    for (const s of picked?.primary_stat ?? []) {
      if (
        s === "STR" ||
        s === "DEX" ||
        s === "CON" ||
        s === "INT" ||
        s === "WIS" ||
        s === "CHA"
      ) {
        out.add(s);
      }
    }
    return out;
  })();
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
            {isLoadingRaces && (
              <div className="col-span-full text-sm text-zinc-500">
                Loading races...
              </div>
            )}
            {!isLoadingRaces && raceLoadFailed && (
              <div className="col-span-full text-sm text-zinc-500">
                Failed to load races. Please refresh.
              </div>
            )}
            {!isLoadingRaces &&
              !raceLoadFailed &&
              availableRaces.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setRace(r.name)}
                  className={`relative rounded-lg border px-4 py-3 pb-9 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                    race === r.name
                      ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                  }`}
                >
                  <div className="text-sm font-medium leading-5">{r.name}</div>
                  {(() => {
                    const bonus = getRaceBonusView(r.stat_bonuses);
                    if (bonus.kind === "none") return null;
                    const isSelected = race === r.name;

                    if (bonus.kind === "all") {
                      return (
                        <div
                          className={`absolute bottom-2 left-2 inline-flex items-center  rounded-md border px-1 py-0.5 text-[9px] font-medium ${
                            isSelected
                              ? "border-zinc-300 bg-linear-to-r from-blue-700 via-green-600 to-red-600 text-white"
                              : "border-zinc-700 bg-linear-to-r from-slate-700 to-slate-400"
                          }`}
                        >
                          ALL STAT +{bonus.value}
                        </div>
                      );
                    }

                    return (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {bonus.parts.map((p) => (
                          <span
                            key={p.key}
                            className={`inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] font-medium ${getStatTagClass(p.key, isSelected)}`}
                          >
                            {p.value > 0 ? "+" : ""}
                            {p.value} {STAT_KEY_LABEL[p.key]}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </button>
              ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Class</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {isLoadingClasses && (
              <div className="col-span-full text-sm text-zinc-500">
                Loading classes...
              </div>
            )}
            {!isLoadingClasses && classLoadFailed && (
              <div className="col-span-full text-sm text-zinc-500">
                Failed to load classes. Please refresh.
              </div>
            )}
            {!isLoadingClasses &&
              !classLoadFailed &&
              availableClasses.map((c) => {
                const isSelected = characterClass === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCharacterClass(c.name)}
                    className={`relative rounded-lg border px-4 py-3 pb-9 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                      isSelected
                        ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-sm font-medium leading-5">{c.name}</div>
                    {c.subname && (
                      <div className="mt-1 text-xs text-zinc-500">
                        {c.subname}
                      </div>
                    )}
                    {Array.isArray(c.primary_stat) && c.primary_stat.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1 ml-2">
                        <span
                          className={`inline-flex items-center text-[9px] leading-none font-medium ${
                            isSelected ? "text-zinc-700" : "text-zinc-500"
                          }`}
                        >
                          Main stat:
                        </span>
                        {c.primary_stat.map((s) => {
                          const key = statKeyFromAbbrev(s);
                          if (!key) {
                            return (
                              <span
                                key={s}
                                className={`inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] leading-none font-medium ${
                                  isSelected
                                    ? "border-zinc-300 bg-zinc-200 text-zinc-900"
                                    : "border-zinc-700 bg-zinc-900/40 text-zinc-200"
                                }`}
                              >
                                {s}
                              </span>
                            );
                          }

                          return (
                            <span
                              key={s}
                              className={`inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] leading-none font-medium ${getStatTagClass(
                                key,
                                isSelected
                              )}`}
                            >
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
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
                          const isRecommended =
                            rolledValues != null &&
                            recommendedStats.has(stat);
                          const recommendedKey = isRecommended
                            ? statKeyFromAbbrev(stat)
                            : null;
                          return (
                            <div
                              key={stat}
                              onDragOver={onDragOver}
                              onDrop={(e) => onDropOnStat(e, stat)}
                              className={`rounded-lg border bg-zinc-800/50 p-2 transition ${
                                value != null
                                  ? "border-zinc-600"
                                  : "border-dashed border-zinc-600"
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
