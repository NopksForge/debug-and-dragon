export type CharacterStats = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export type CreateCharacterPayload = {
  name: string;
  race: string;
  class: string;
  stats: CharacterStats;
};

const CREATE_CHARACTER_ENDPOINT = "http://localhost:8080/character/create";

function generateReferenceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function createCharacter(
  payload: CreateCharacterPayload
): Promise<void> {
  const res = await fetch(CREATE_CHARACTER_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-reference-id": generateReferenceId(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create character: ${res.statusText}`);
  }
}
