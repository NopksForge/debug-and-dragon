export type Class = {
  name: string;
  subname: string;
  primary_stat: string[];
};

type ListClassResponse = {
  code: string;
  message: string;
  data?: {
    classes?: Class[];
  };
};

const LIST_CLASS_ENDPOINT = "http://localhost:8080/class/list";
const REFERENCE_ID_STORAGE_KEY = "referenceId";

function getOrCreateReferenceId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(REFERENCE_ID_STORAGE_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(REFERENCE_ID_STORAGE_KEY, generated);
  return generated;
}

export async function listClasses(): Promise<Class[]> {
  const res = await fetch(LIST_CLASS_ENDPOINT, {
    method: "GET",
    headers: {
      "x-reference-id": getOrCreateReferenceId(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to list classes: ${res.statusText}`);
  }

  const body = (await res.json()) as ListClassResponse;
  const classes = body?.data?.classes;
  if (!Array.isArray(classes)) return [];
  return classes;
}
