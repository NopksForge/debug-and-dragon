"use client";

import type { Class } from "../classAPI";
import { getStatTagClass, statKeyFromAbbrev } from "../statStyles";

export function ClassSelector(props: {
  selectedClass: string | null;
  onSelectClass: (className: string) => void;
  availableClasses: Class[];
  isLoading: boolean;
  loadFailed: boolean;
}) {
  const { selectedClass, onSelectClass, availableClasses, isLoading, loadFailed } = props;

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Class</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {isLoading && (
          <div className="col-span-full text-sm text-zinc-500">Loading classes...</div>
        )}
        {!isLoading && loadFailed && (
          <div className="col-span-full text-sm text-zinc-500">
            Failed to load classes. Please refresh.
          </div>
        )}
        {!isLoading &&
          !loadFailed &&
          availableClasses.map((c) => {
            const isSelected = selectedClass === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelectClass(c.name)}
                className={`relative rounded-lg border px-4 py-3 pb-9 text-left transition focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                  isSelected
                    ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                <div className="text-sm font-medium leading-5">{c.name}</div>
                {c.subname && <div className="mt-1 text-xs text-zinc-500">{c.subname}</div>}
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
  );
}

