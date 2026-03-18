"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorPopup } from "../components/ErrorPopup";
import { createCharacter } from "./characterApi";
import { listRaces, type Race } from "./raceAPI";
import { listClasses, type Class } from "./classAPI";
import { STATS, type Stat } from "./statStyles";
import { RaceSelector } from "./components/RaceSelector";
import { ClassSelector } from "./components/ClassSelector";
import { StatRoll } from "./components/StatRoll";

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

        <RaceSelector
          selectedRace={race}
          onSelectRace={setRace}
          availableRaces={availableRaces}
          isLoading={isLoadingRaces}
          loadFailed={raceLoadFailed}
        />

        <ClassSelector
          selectedClass={characterClass}
          onSelectClass={setCharacterClass}
          availableClasses={availableClasses}
          isLoading={isLoadingClasses}
          loadFailed={classLoadFailed}
        />

        <StatRoll
          canShow={canShowStats}
          rolledValues={rolledValues}
          setRolledValues={setRolledValues}
          statToIndex={statToIndex}
          setStatToIndex={setStatToIndex}
          draggedIndex={draggedIndex}
          setDraggedIndex={setDraggedIndex}
          draggedStat={draggedStat}
          setDraggedStat={setDraggedStat}
          recommendedStats={recommendedStats}
        />

        {canShowStats && allAssigned && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </section>
        )}

        {canShowStats && (
          <>
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
              <p className="text-sm text-zinc-500">Enter a name to continue.</p>
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
