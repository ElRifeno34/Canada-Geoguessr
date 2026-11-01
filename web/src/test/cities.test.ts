import { describe, it, expect } from "vitest";
import { CITIES, findCity, normalize } from "@/lib/cities";

describe("city matching", () => {
  it("ignores case, whitespace and accents", () => {
    expect(findCity("  quebec city ")?.name).toBe("Québec City");
    expect(findCity("gaspe")?.name).toBe("Gaspé");
  });
  it("accepts aliases", () => {
    expect(findCity("Quebec")?.name).toBe("Québec City");
    expect(findCity("Montréal")?.name).toBe("Montreal");
  });
  it("rejects unknown cities", () => {
    expect(findCity("Paris")).toBeUndefined();
  });
  it("has 18 cities and hints never contain the name", () => {
    expect(CITIES).toHaveLength(18);
    for (const c of CITIES) expect(normalize(c.hint)).not.toContain(normalize(c.name.replace(" City", "")));
  });
});
