import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { geoArea, geoConicConformal, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { City } from "@/lib/cities";

const W = 1000;
const H = 820;

type Feature = { type: "Feature"; geometry: { type: string; coordinates: any }; properties: { name: string } };

function rewind(f: Feature): Feature {
  // d3-geo expects clockwise rings; GeoJSON files are often counter-clockwise.
  if (geoArea(f as unknown as GeoPermissibleObjects) <= 2 * Math.PI) return f;
  const rev = (c: any): any => (typeof c[0][0] === "number" ? [...c].reverse() : c.map(rev));
  return { ...f, geometry: { ...f.geometry, coordinates: rev(f.geometry.coordinates) } };
}

function CityLabel({ city, kind, screenX, screenY }: { city: City; kind: "found" | "missed"; screenX: number; screenY: number }) {
  const ref = useRef<SVGTextElement>(null);
  const [size, setSize] = useState({ width: 0, height: 16 });
  useLayoutEffect(() => {
    const box = ref.current?.getBBox();
    if (box) setSize({ width: box.width, height: box.height });
  }, [city.name]);

  const anchor = city.label?.anchor ?? "top";
  const [dx, dy] = city.label?.offset ?? [0, 0];
  const textAnchor = anchor === "left" ? "end" : anchor === "right" ? "start" : "middle";
  const baseX = (anchor === "left" ? -12 : anchor === "right" ? 12 : 0) + dx;
  const baseY = (anchor === "bottom" ? 12 + size.height / 2 : anchor === "top" ? -12 - size.height / 2 : 0) + dy;
  const left = textAnchor === "end" ? -size.width : textAnchor === "middle" ? -size.width / 2 : 0;
  // Clamp in the visible SVG coordinate system, including the text's outline.
  // Offscreen markers keep their labels offscreen instead of piling up at an edge.
  const visible = screenX >= 0 && screenX <= W && screenY >= 0 && screenY <= H;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const x = visible ? clamp(baseX, 6 - screenX - left, W - 6 - screenX - left - size.width) : baseX;
  const y = visible ? clamp(baseY, 6 - screenY + size.height / 2, H - 6 - screenY - size.height / 2) : baseY;

  return (
    <text ref={ref} x={x} y={y} textAnchor={textAnchor} dominantBaseline="central" className="font-sans" fontSize={14} fontWeight={700}
      fill={kind === "found" ? "var(--foreground)" : "var(--muted-foreground)"} stroke="var(--land)" strokeWidth={4} paintOrder="stroke">
      {city.name}
    </text>
  );
}

export function CanadaMap({ found, missed }: { found: City[]; missed: City[] }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [t, setT] = useState({ x: 0, y: 0, k: 1 });

  useEffect(() => {
    fetch("/data/canada.geojson")
      .then((r) => r.json())
      .then((d) => setFeatures(d.features.map(rewind)));
  }, []);

  const { path, project } = useMemo(() => {
    const proj = geoConicConformal().parallels([49, 77]).rotate([96, 0]);
    if (features.length) proj.fitExtent([[20, 20], [W - 20, H - 20]], { type: "FeatureCollection", features } as any);
    return { path: geoPath(proj), project: (c: City) => proj([c.lng, c.lat]) ?? [0, 0] };
  }, [features]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [W, H]])
      .on("zoom", (e) => setT({ x: e.transform.x, y: e.transform.y, k: e.transform.k }));
    zoomRef.current = z;
    select(svg).call(z);
    return () => void select(svg).on(".zoom", null);
  }, []);

  const zoomBy = (f: number) => svgRef.current && zoomRef.current && select(svgRef.current).call(zoomRef.current.scaleBy, f);
  const reset = () => svgRef.current && zoomRef.current && select(svgRef.current).call(zoomRef.current.transform, zoomIdentity);

  const s = 1 / t.k;
  const Marker = ({ c, kind }: { c: City; kind: "found" | "missed" }) => {
    const [x, y] = project(c);
    const fill = kind === "found" ? "var(--primary)" : "var(--muted-foreground)";
    return (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        {kind === "found" && <circle className="animate-ripple" r={4} fill="none" stroke={fill} strokeWidth={2} />}
        <g className="animate-pop">
          <circle r={6} fill={fill} stroke="var(--card)" strokeWidth={2.5} />
          <CityLabel city={c} kind={kind} screenX={x * t.k + t.x} screenY={y * t.k + t.y} />
        </g>
      </g>
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-water shadow-soft">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of Canada">
        <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
          {features.map((f) => (
            <path key={f.properties.name} d={path(f as any) ?? ""} fill="var(--land)" stroke="var(--land-stroke)" strokeWidth={0.8 * s} strokeLinejoin="round" />
          ))}
          {missed.map((c) => <Marker key={c.name} c={c} kind="missed" />)}
          {found.map((c) => <Marker key={c.name} c={c} kind="found" />)}
        </g>
      </svg>
      <div className="absolute right-3 top-3 flex flex-col gap-1">
        {[{ i: Plus, f: () => zoomBy(1.5), l: "Zoom in" }, { i: Minus, f: () => zoomBy(1 / 1.5), l: "Zoom out" }, { i: RotateCcw, f: reset, l: "Reset view" }].map(({ i: I, f, l }) => (
          <button key={l} type="button" onClick={f} aria-label={l} className="grid h-9 w-9 place-items-center rounded-lg bg-card text-foreground shadow-soft transition hover:text-primary">
            <I className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
