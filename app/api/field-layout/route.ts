import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * The layout mode's save.
 *
 * Writes the arrangement back into the two files that hold it, replacing the
 * numbers in place: `gathered`/`portrait` in projects/projectCoordinates.ts,
 * and the size and turn maps in projects/projectStanding.ts. Every comment,
 * every ordering and every unrelated line is left exactly as it was, because
 * those files are read far more often than they are written.
 *
 * Development only. In a production build the handler refuses before it
 * touches anything, and the mode that calls it is never loaded at all.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Placement {
  x: number;
  z: number;
  scale: number;
  spin: number;
}

const ROOT = process.cwd();
const COORDINATES = path.join(ROOT, "projects", "projectCoordinates.ts");
const STANDING = path.join(ROOT, "projects", "projectStanding.ts");
const ID = /^[a-z][a-z0-9]*$/;

/** Replaces one array inside one entry, leaving the rest of the file alone. */
function replaceVector(
  source: string,
  id: string,
  key: "gathered" | "portrait",
  value: [number, number, number],
): string {
  const entry = new RegExp(
    `(\\b${id}: \\{(?:(?!\\n  \\},)[\\s\\S])*?${key}: \\[)([^\\]]+)(\\])`,
  );
  const match = entry.exec(source);
  if (!match) throw new Error(`no ${key} for "${id}"`);
  const numbers = value.map((n) => String(Math.round(n * 100) / 100)).join(", ");
  return source.slice(0, match.index + match[1].length) + numbers +
    source.slice(match.index + match[1].length + match[2].length);
}

/** Rewrites a `const NAME: Record<string, number> = { … }` map wholesale. */
function replaceMap(
  source: string,
  name: string,
  values: Record<string, number>,
  comment: string,
): string {
  const start = source.indexOf(`const ${name}: Record<string, number> = {`);
  if (start < 0) throw new Error(`no ${name} map`);
  const open = source.indexOf("{", start);
  const close = source.indexOf("\n};", open);
  if (close < 0) throw new Error(`${name} map is not closed as expected`);
  const body = Object.entries(values)
    .map(([id, n], i) => `  ${id}: ${n},`.padEnd(28) + `// ${i + 1}`)
    .join("\n");
  return (
    source.slice(0, open + 1) +
    `\n  // ${comment}\n` +
    body +
    source.slice(close)
  );
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "layout mode is development only" }, { status: 404 });
  }

  let body: { orientation?: string; placements?: Record<string, Placement> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "body is not JSON" }, { status: 400 });
  }

  const { orientation, placements } = body;
  if (orientation !== "landscape" && orientation !== "portrait") {
    return Response.json({ error: "orientation must be landscape or portrait" }, { status: 400 });
  }
  if (!placements || typeof placements !== "object") {
    return Response.json({ error: "no placements" }, { status: 400 });
  }
  for (const [id, p] of Object.entries(placements)) {
    if (!ID.test(id)) {
      return Response.json({ error: `bad id "${id}"` }, { status: 400 });
    }
    for (const key of ["x", "z", "scale", "spin"] as const) {
      if (!Number.isFinite(p[key])) {
        return Response.json({ error: `${id}.${key} is not a number` }, { status: 400 });
      }
    }
    if (p.scale <= 0 || p.scale > 4) {
      return Response.json({ error: `${id}.scale out of range` }, { status: 400 });
    }
  }

  const key = orientation === "portrait" ? "portrait" : "gathered";
  try {
    // Positions keep each stone's own height; the mode never changes it.
    let coordinates = await readFile(COORDINATES, "utf8");
    for (const [id, p] of Object.entries(placements)) {
      const existing = new RegExp(
        `\\b${id}: \\{(?:(?!\\n  \\},)[\\s\\S])*?${key}: \\[([^\\]]+)\\]`,
      ).exec(coordinates);
      if (!existing) throw new Error(`no ${key} for "${id}"`);
      const y = Number(existing[1].split(",")[1]);
      coordinates = replaceVector(coordinates, id, key, [p.x, Number.isFinite(y) ? y : 0, p.z]);
    }

    let standing = await readFile(STANDING, "utf8");
    standing = replaceMap(
      standing,
      "STONE_SCALE",
      Object.fromEntries(Object.entries(placements).map(([id, p]) => [id, p.scale])),
      "Set by hand in the layout mode. Numbered by standing.",
    );
    const spins = Object.entries(placements).filter(([, p]) => Math.abs(p.spin) > 1e-4);
    standing = replaceMap(
      standing,
      "STONE_SPIN",
      Object.fromEntries(spins.map(([id, p]) => [id, p.spin])),
      "Radians, on top of each pebble's own baked settle angle.",
    );

    await writeFile(COORDINATES, coordinates, "utf8");
    await writeFile(STANDING, standing, "utf8");
    return Response.json({
      ok: true,
      files: ["projectCoordinates.ts", "projectStanding.ts"],
      stones: Object.keys(placements).length,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
