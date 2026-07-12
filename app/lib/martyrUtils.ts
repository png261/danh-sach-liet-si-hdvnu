import type { Martyr } from "@/app/types/martyr";

const TU_KY_CEMETERY = "Nghĩa trang liệt sĩ Tứ Kỳ";

/** Normalize a Vietnamese string for accent-insensitive search */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

/**
 * Map each martyr to their physical zone on the cemetery map.
 * All cemeteries (including Tứ Kỳ) now correspond strictly to Zones A and B.
 */
export function getPhysicalZone(martyr: Martyr): string {
  return martyr.zone || "A";
}

/** Return the available zones for a given cemetery name */
export function getAvailableZones(cemetery: string): string[] {
  return ["A", "B"];
}

export type GraveRow = { rowName: string; martyrs: Martyr[] };

/** Group and sort martyrs in a zone into rows, sorted by row number then grave number */
export function groupMartyrsByRow(
  allMartyrs: Martyr[],
  cemetery: string,
  zone: string
): GraveRow[] {
  const zoneMartyrs = allMartyrs.filter(
    (m) => m.cemetery === cemetery && getPhysicalZone(m) === zone
  );

  const rows: Record<string, Martyr[]> = {};
  for (const m of zoneMartyrs) {
    const key = m.row_no || "Khác";
    if (!rows[key]) rows[key] = [];
    rows[key].push(m);
  }

  const sortedKeys = Object.keys(rows).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (isNaN(numA)) return 1;
    if (isNaN(numB)) return -1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => ({
    rowName: key === "Khác" ? "Chưa phân hàng" : `Hàng ${key}`,
    martyrs: rows[key].sort((a, b) => {
      const numA = parseInt(a.grave_no);
      const numB = parseInt(b.grave_no);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.grave_no.localeCompare(b.grave_no);
    }),
  }));
}

/** Count martyrs per physical zone, grouped by cemetery */
export function computeZoneCounts(
  allMartyrs: Martyr[]
): Record<string, Record<string, number>> {
  const counts: Record<string, Record<string, number>> = {};
  for (const m of allMartyrs) {
    const cem = m.cemetery;
    if (!counts[cem]) counts[cem] = {};
    const zone = getPhysicalZone(m);
    counts[cem][zone] = (counts[cem][zone] || 0) + 1;
  }
  return counts;
}
