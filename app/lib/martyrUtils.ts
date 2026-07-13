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
 * Tính khoảng cách Levenshtein giữa hai chuỗi.
 * Dùng để đo mức độ sai lệch giữa từ khóa người dùng gõ và từ trong tên liệt sĩ.
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Nếu một trong hai chuỗi rỗng thì khoảng cách = độ dài chuỗi còn lại
  if (m === 0) return n;
  if (n === 0) return m;

  // Dùng hai hàng để tiết kiệm bộ nhớ (O(min(m,n)) thay vì O(m*n))
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // xóa ký tự ở a
        curr[j - 1] + 1,  // thêm ký tự vào a
        prev[j - 1] + cost // thay thế ký tự
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Kiểm tra một từ khóa đơn (queryWord) có khớp mờ với từ trong tên liệt sĩ (targetWord) không.
 * Ưu tiên theo thứ tự:
 *   1. targetWord bắt đầu bằng queryWord (khớp tiền tố - hỗ trợ gõ tắt)
 *   2. targetWord chứa queryWord (khớp chuỗi con)
 *   3. Khoảng cách Levenshtein trong ngưỡng cho phép (chịu sai chính tả)
 */
export function isWordFuzzyMatch(queryWord: string, targetWord: string): boolean {
  // Khớp tiền tố: gõ tắt như "nguy" → khớp "nguyen"
  if (targetWord.startsWith(queryWord)) return true;
  // Khớp chuỗi con chính xác
  if (targetWord.includes(queryWord)) return true;

  // Từ khóa quá ngắn (1-2 ký tự) thì không dùng Levenshtein để tránh kết quả nhiễu
  if (queryWord.length <= 2) return false;

  const dist = getLevenshteinDistance(queryWord, targetWord);
  // Ngưỡng sai lệch: từ ngắn (3-4 ký tự) cho phép 1 sai, từ dài cho phép 2 sai
  if (queryWord.length <= 4) return dist <= 1;
  return dist <= 2;
}

/**
 * Kiểm tra tên liệt sĩ (martyrName) có khớp mờ với chuỗi tìm kiếm (query) không.
 * - Chuẩn hóa và tách thành từng từ trước khi so sánh.
 * - Mỗi từ trong query phải khớp mờ với ít nhất một từ trong tên liệt sĩ.
 * - Không phân biệt thứ tự từ (gõ "Hung Nguyen" vẫn tìm ra "Nguyễn Văn Hùng").
 */
export function isFuzzyNameMatch(martyrName: string, query: string): boolean {
  if (!query.trim()) return true;
  const queryWords = normalizeString(query).split(/\s+/).filter(Boolean);
  const nameWords  = normalizeString(martyrName).split(/\s+/).filter(Boolean);

  // Mỗi từ trong query phải có ít nhất một từ trong tên khớp mờ với nó
  return queryWords.every(qWord =>
    nameWords.some(nWord => isWordFuzzyMatch(qWord, nWord))
  );
}

/**
 * Tính điểm độ liên quan của kết quả tìm kiếm để sắp xếp ưu tiên.
 * Điểm cao hơn = liên quan hơn = hiển thị trước.
 *   3 điểm: tên bắt đầu bằng chuỗi tìm kiếm (khớp chính xác tiền tố)
 *   2 điểm: tên chứa chuỗi tìm kiếm (khớp chuỗi con)
 *   1 điểm: khớp mờ theo từng từ
 */
export function getFuzzyScore(martyrName: string, query: string): number {
  const normQuery = normalizeString(query);
  const normName  = normalizeString(martyrName);
  if (normName.startsWith(normQuery)) return 3;
  if (normName.includes(normQuery)) return 2;
  return 1;
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
