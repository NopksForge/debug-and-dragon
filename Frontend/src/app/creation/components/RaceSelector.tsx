"use client";

import type { Race, StatKey } from "../raceAPI";
import { STAT_KEY_LABEL, getStatTagClass } from "../statStyles";

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

export function RaceSelector(props: {
  selectedRace: string | null;
  onSelectRace: (race: string) => void;
  availableRaces: Race[];
  isLoading: boolean;
  loadFailed: boolean;
}) {
  const { selectedRace, onSelectRace, availableRaces, isLoading, loadFailed } = props;

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Race</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {isLoading && (
          <div className="col-span-full text-sm text-zinc-500">Loading races...</div>
        )}
        {!isLoading && loadFailed && (
          <div className="col-span-full text-sm text-zinc-500">
            Failed to load races. Please refresh.
          </div>
        )}
        {!isLoading &&
          !loadFailed &&
          availableRaces.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => onSelectRace(r.name)}
              className={`relative rounded-lg border px-4 py-3 pb-9 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                selectedRace === r.name
                  ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
              }`}
            >
              <div className="text-sm font-medium leading-5">{r.name}</div>
              {(() => {
                const bonus = getRaceBonusView(r.stat_bonuses);
                if (bonus.kind === "none") return null;
                const isSelected = selectedRace === r.name;

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
                        className={`inline-flex items-center rounded-md border px-1 py-0.5 text-[9px] font-medium ${getStatTagClass(
                          p.key,
                          isSelected
                        )}`}
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
  );
}

