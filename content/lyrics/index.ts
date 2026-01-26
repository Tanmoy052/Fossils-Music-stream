export type LyricsRegistry = Record<string, { time: number; text: string }[]>;

const modules = import.meta.glob("./*.ts", { eager: true }) as Record<
  string,
  { default: Record<string, { time: number; text: string }[]> }
>;

const registry: LyricsRegistry = {};
for (const key in modules) {
  const mod = modules[key];
  if (mod && mod.default) {
    Object.assign(registry, mod.default);
  }
}

export const getLyricsById = (id?: string) => {
  if (!id) return [];
  return registry[id] || [];
};
