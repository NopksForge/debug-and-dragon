export type StatKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type Race = {
  name: string;
  stat_bonuses: Partial<Record<StatKey, number>>;
};

type ListRaceResponse = {
  code: string;
  message: string;
  data?: {
    races?: Race[];
  };
};

const LIST_RACE_ENDPOINT = "http://localhost:8080/race/list";

function generateReferenceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listRaces(): Promise<Race[]> {
  const res = await fetch(LIST_RACE_ENDPOINT, {
    method: "GET",
    headers: {
      "x-reference-id": generateReferenceId(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to list races: ${res.statusText}`);
  }

  const body = (await res.json()) as ListRaceResponse;
  const races = body?.data?.races;
  if (!Array.isArray(races)) return [];
  return races;
}
