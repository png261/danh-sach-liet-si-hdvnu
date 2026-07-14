/**
 * Tính toán thông tin ngày giỗ từ ngày hy sinh Dương lịch (dd/MM/yyyy)
 * Trả về số ngày còn lại đến ngày giỗ hàng năm tiếp theo
 */

interface AnniversaryInfo {
  isToday: boolean;
  daysLeft: number;
  nextAnniversaryYear: number;
}

export function getAnniversaryInfo(deathDateStr: string | undefined | null): AnniversaryInfo | null {
  if (!deathDateStr) return null;

  // Parse dd/MM/yyyy
  const parts = deathDateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  // Require full date (not just year)
  if (!day || !month) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();

  // Anniversary this year
  let anniversary = new Date(currentYear, month - 1, day);
  anniversary.setHours(0, 0, 0, 0);

  // If already passed this year, use next year
  if (anniversary < today) {
    anniversary = new Date(currentYear + 1, month - 1, day);
  }

  const diffMs = anniversary.getTime() - today.getTime();
  const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    isToday: daysLeft === 0,
    daysLeft,
    nextAnniversaryYear: anniversary.getFullYear(),
  };
}
