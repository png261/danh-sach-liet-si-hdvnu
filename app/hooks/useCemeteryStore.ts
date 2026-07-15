"use client";

import { create } from "zustand";
import type { Martyr } from "@/app/types/martyr";

interface CemeteryState {
  selectedMartyr: Martyr | null;
  isModalOpen: boolean;
  isBottomCardOpen: boolean;
  isMusicMuted: boolean;
  setSelectedMartyr: (martyr: Martyr | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsBottomCardOpen: (open: boolean) => void;
  setIsMusicMuted: (muted: boolean) => void;
  closeAll: () => void;
}

export const useCemeteryStore = create<CemeteryState>((set) => {
  return {
    selectedMartyr: null,
    isModalOpen: false,
    isBottomCardOpen: false,
    isMusicMuted: false,
    setSelectedMartyr: (martyr) => set({ selectedMartyr: martyr }),
    setIsModalOpen: (open) => set({ isModalOpen: open }),
    setIsBottomCardOpen: (open) => set({ isBottomCardOpen: open }),
    setIsMusicMuted: (muted) => set({ isMusicMuted: muted }),
    closeAll: () => set({ selectedMartyr: null, isModalOpen: false, isBottomCardOpen: false }),
  };
});
