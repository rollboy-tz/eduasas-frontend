import { create } from 'zustand';

/**
 * Hali nne kuu za Sidebar:
 * - expanded: Imejipanua kikamilifu (260px) kwa matumizi ya Desktop.
 * - minimal: Imekunjwa, inaonyesha icons pekee (50px) kwa muonekano wa kisasa.
 * - hidden: Haionekani kabisa (Inatumika kama hali ya msingi kwenye Mobile).
 * - mobile: Drawer iliyofunguka (Overlay) kwa ajili ya simu.
 */
export type SidebarStateMode = "expanded" | "minimal" | "hidden" | "mobile";

interface SidebarState {
  /** Hali ya sasa ya muonekano wa sidebar (UI Mode) */
  mode: SidebarStateMode;
  /** Inahifadhi chaguo la mwisho la mtumiaji akiwa kwenye Desktop (Expanded au Minimal) */
  lastDesktopMode: "expanded" | "minimal";
  /** ID ya group la menu lililo wazi kwa sasa (Accordion state) */
  openGroupId: string | null;

  /** Huweka Sidebar katika hali ya Expanded na kuhifadhi kama chaguo kuu la desktop */
  setExpanded: () => void;
  /** Huweka Sidebar katika hali ya Minimal na kuhifadhi kama chaguo kuu la desktop */
  setMinimal: () => void;
  /** Hugeuza muonekano wa Desktop kati ya Expanded na Minimal pekee */
  toggleDesktop: () => void;
  /** Hugeuza muonekano wa Mobile kati ya Mobile (Open) na Hidden (Closed) */
  toggleMobile: () => void;
  /** Inasawazisha hali ya sidebar kulingana na mabadiliko ya kifaa yanayotoka kwenye AppStore */
  syncDeviceMode: (isMobile: boolean) => void;
  /** Huweka ID ya group linalotakiwa kuwa wazi */
  setOpenGroupId: (id: string | null) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  mode: "minimal",
  lastDesktopMode: "minimal",
  openGroupId: null,

  setExpanded: () => set({ mode: "expanded", lastDesktopMode: "expanded" }),
  setMinimal: () => set({ mode: "minimal", lastDesktopMode: "minimal" }),
  setOpenGroupId: (id) => set({ openGroupId: id }),

  toggleDesktop: () => {
    const current = get().mode;
    // Kwenye desktop hatuendi 'hidden', tunabadilishana kati ya hizi mbili tu
    const newMode = current === "expanded" ? "minimal" : "expanded";
    set({ mode: newMode, lastDesktopMode: newMode });
  },

  toggleMobile: () => {
    const current = get().mode;
    set({ mode: current === "mobile" ? "hidden" : "mobile" });
  },

  syncDeviceMode: (isMobile) => {
    const { mode, lastDesktopMode } = get();
    if (isMobile) {
      // Kama kioo kimekuwa kidogo, ifiche sidebar ya desktop
      if (mode !== "mobile") set({ mode: "hidden" });
    } else {
      // Tukirudi kwenye kioo kikubwa, rudi kule alipoishia mtumiaji
      set({ mode: lastDesktopMode });
    }
  },
}));