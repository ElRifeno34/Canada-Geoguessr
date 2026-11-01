import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChevronUp, Lightbulb, MapPin } from "lucide-react";
import { CanadaMap } from "@/components/CanadaMap";
import { MapleLeaf } from "@/components/MapleLeaf";
import { CITIES, MAX_LIVES, findCity, type City } from "@/lib/cities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canada GeoGuessr — Name the Canadian Cities" },
      { name: "description", content: "A map quiz: name 18 Canadian cities, discover fun facts, and keep your 5 maple-leaf lives." },
      { property: "og:title", content: "Canada GeoGuessr — Name the Canadian Cities" },
      { property: "og:description", content: "Type city names to pin them on the map of Canada. How many can you find?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

type Phase = "start" | "playing" | "won" | "lost";

function Game() {
  const [phase, setPhase] = useState<Phase>("start");
  const [found, setFound] = useState<City[]>([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [guess, setGuess] = useState("");
  const [shake, setShake] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, found.length, lives]);

  const start = () => {
    setFound([]);
    setLives(MAX_LIVES);
    setGuess("");
    setPhase("playing");
  };

  const loseLife = (msg: string) => {
    setShake((s) => s + 1);
    const left = lives - 1;
    setLives(left);
    toast.error(msg, { description: left > 0 ? `${left} ${left === 1 ? "life" : "lives"} left` : undefined });
    if (left <= 0) setPhase("lost");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    const city = findCity(guess);
    setGuess("");
    if (!city) return loseLife(`"${guess.trim()}" isn't on our list`);
    if (found.some((c) => c.name === city.name)) return loseLife(`You already found ${city.name}`);
    const next = [city, ...found];
    setFound(next);
    toast.success(`${city.name} found!`);
    if (next.length === CITIES.length) setPhase("won");
  };

  const hint = () => {
    const left = CITIES.filter((c) => !found.some((f) => f.name === c.name));
    const c = left[Math.floor(Math.random() * left.length)];
    if (c) toast(c.hint, { icon: <Lightbulb className="h-4 w-4 text-primary" />, duration: 6000 });
    inputRef.current?.focus();
  };

  const missed = phase === "lost" ? CITIES.filter((c) => !found.some((f) => f.name === c.name)) : [];
  const pct = (found.length / CITIES.length) * 100;

  const panel = (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Discovered cities</h2>
        <span className="text-sm text-muted-foreground">{found.length} / {CITIES.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {found.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <MapPin className="mx-auto mb-2 h-5 w-5" />
            Cities you name will appear here with a fun fact.
          </div>
        )}
        {found.map((c) => (
          <article key={c.name} className="animate-in fade-in slide-in-from-top-2 rounded-xl border bg-card p-3 shadow-soft duration-500">
            <div className="flex items-center gap-2">
              <MapleLeaf className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">{c.name}</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.fact}</p>
          </article>
        ))}
      </div>
    </div>
  );

  return (
    <div className="maple-bg flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex flex-wrap items-center gap-3 border-b bg-card/70 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <MapleLeaf className="h-7 w-7 text-primary" />
          <h1 className="font-display text-xl font-bold tracking-tight">Canada <span className="text-primary">GeoGuessr</span></h1>
        </div>
        <form onSubmit={submit} key={shake} className={`order-3 flex w-full gap-2 md:order-none md:ml-6 md:max-w-md md:flex-1 ${shake ? "animate-shake" : ""}`}>
          <input
            ref={inputRef}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={phase !== "playing"}
            placeholder="Type a Canadian city…"
            aria-label="City name"
            className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          <button type="submit" disabled={phase !== "playing"} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-red transition hover:brightness-110 disabled:opacity-50">Guess</button>
          <button type="button" onClick={hint} disabled={phase !== "playing"} className="flex h-10 items-center gap-1 rounded-lg border bg-card px-3 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-50">
            <Lightbulb className="h-4 w-4" /> <span className="hidden sm:inline">Hint</span>
          </button>
        </form>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex gap-0.5" aria-label={`${lives} lives left`}>
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <MapleLeaf key={`${i}-${i < lives}`} className={`h-5 w-5 transition-all duration-300 ${i < lives ? "text-primary" : "animate-leaf-lose text-muted opacity-60"}`} />
            ))}
          </div>
          <div className="hidden w-36 sm:block">
            <div className="mb-1 text-xs font-medium text-muted-foreground">{found.length} / {CITIES.length} cities found</div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 gap-4 p-3 pb-16 md:p-4 md:pb-4">
        <div className="min-w-0 flex-1">
          <CanadaMap found={found} missed={missed} />
        </div>
        <aside className="hidden w-80 shrink-0 rounded-2xl border bg-card/80 p-4 shadow-soft backdrop-blur md:block">{panel}</aside>
      </main>

      {/* Mobile bottom sheet */}
      <div className={`fixed inset-x-0 bottom-0 z-20 rounded-t-2xl border-t bg-card shadow-soft transition-[height] duration-300 md:hidden ${sheetOpen ? "h-[60dvh]" : "h-14"}`}>
        <button type="button" onClick={() => setSheetOpen((o) => !o)} className="flex h-14 w-full items-center justify-between px-4">
          <span className="text-sm font-semibold">{found.length} / {CITIES.length} cities found</span>
          <ChevronUp className={`h-5 w-5 transition ${sheetOpen ? "rotate-180" : ""}`} />
        </button>
        <div className="h-[calc(100%-3.5rem)] px-4 pb-4">{sheetOpen && panel}</div>
      </div>

      {phase !== "playing" && (
        <div className={`fixed inset-0 z-30 grid place-items-center p-4 ${phase === "lost" ? "pointer-events-none items-end md:items-center" : "bg-background/70 backdrop-blur-sm"}`}>
          <div className="pointer-events-auto w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border bg-card p-8 text-center shadow-soft duration-300">
            <MapleLeaf className="animate-float mx-auto h-14 w-14 text-primary" />
            {phase === "start" && (
              <>
                <h2 className="mt-4 font-display text-3xl font-bold">Canada GeoGuessr</h2>
                <p className="mt-2 text-muted-foreground">How well do you know the map of Canada?</p>
                <ul className="mt-5 space-y-1.5 text-left text-sm">
                  <li>🍁 Type a city name and press <kbd className="rounded bg-muted px-1">Enter</kbd>.</li>
                  <li>📍 Correct guesses pin the city and reveal a fun fact.</li>
                  <li>❤️ Wrong or repeated guesses cost one of {MAX_LIVES} lives.</li>
                  <li>💡 Stuck? Ask for a hint. Find all {CITIES.length} to win!</li>
                </ul>
              </>
            )}
            {phase === "won" && (
              <>
                <h2 className="mt-4 font-display text-3xl font-bold">You found them all!</h2>
                <p className="mt-2 text-muted-foreground">All {CITIES.length} cities with {lives} {lives === 1 ? "life" : "lives"} to spare. Bravo!</p>
              </>
            )}
            {phase === "lost" && (
              <>
                <h2 className="mt-4 font-display text-3xl font-bold">Game over</h2>
                <p className="mt-2 text-muted-foreground">You found {found.length} of {CITIES.length}. The {missed.length} missed cities are shown in grey on the map.</p>
              </>
            )}
            <button autoFocus onClick={start} className="mt-6 h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground shadow-red transition hover:brightness-110">
              {phase === "start" ? "Start" : "Play again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
