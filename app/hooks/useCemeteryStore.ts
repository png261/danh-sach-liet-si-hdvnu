"use client";

import { create } from "zustand";
import type { Martyr } from "@/app/types/martyr";

interface CemeteryState {
  selectedMartyr: Martyr | null;
  isModalOpen: boolean;
  isBottomCardOpen: boolean;
  setSelectedMartyr: (martyr: Martyr | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsBottomCardOpen: (open: boolean) => void;
  closeAll: () => void;
}

export const useCemeteryStore = create<CemeteryState>((set) => ({
  selectedMartyr: null,
  isModalOpen: false,
  isBottomCardOpen: false,
  setSelectedMartyr: (martyr) => set({ selectedMartyr: martyr }),
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  setIsBottomCardOpen: (open) => set({ isBottomCardOpen: open }),
  closeAll: () => set({ selectedMartyr: null, isModalOpen: false, isBottomCardOpen: false }),
}));
