import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans">
      <main className="flex flex-col items-center justify-center gap-12 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          Debug & Dragon
        </h1>
        <p className="max-w-sm text-sm text-zinc-400">
          DnD with AI as Dungeon Master
        </p>
        <Link
          href="/creation"
          className="rounded-lg bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Start game
        </Link>
      </main>
    </div>
  );
}
