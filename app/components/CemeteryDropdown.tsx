"use client";

import { ChevronDown } from "lucide-react";

const CEMETERIES = [
  { value: "Nghĩa trang liệt sĩ Tứ Kỳ",    fullLabel: "Nghĩa trang liệt sĩ Tứ Kỳ", shortLabel: "NTLS Tứ Kỳ" },
  { value: "Nghĩa trang liệt sĩ Minh Đức",  fullLabel: "Nghĩa trang liệt sĩ Minh Đức", shortLabel: "NTLS Minh Đức" },
  { value: "Nghĩa trang liệt sĩ Quang Khải",fullLabel: "Nghĩa trang liệt sĩ Quang Khải", shortLabel: "NTLS Q.Khải" },
  { value: "Nghĩa trang liệt sĩ Quang Phục",fullLabel: "Nghĩa trang liệt sĩ Quang Phục", shortLabel: "NTLS Q.Phục" },
];

interface CemeteryDropdownProps {
  value: string;
  onOpenModal: () => void;
}

export default function CemeteryDropdown({ value, onOpenModal }: CemeteryDropdownProps) {
  const selected = CEMETERIES.find((c) => c.value === value) ?? CEMETERIES[0];

  return (
    <div className="cem-dropdown">
      {/* Trigger button */}
      <button
        type="button"
        className="cem-dropdown__trigger"
        onClick={onOpenModal}
        aria-label="Chọn nghĩa trang"
      >
        <span className="cem-dropdown__label cem-dropdown__label--full">{selected.fullLabel}</span>
        <span className="cem-dropdown__label cem-dropdown__label--short">{selected.shortLabel}</span>
        <ChevronDown size={14} className="cem-dropdown__chevron" />
      </button>
    </div>
  );
}
