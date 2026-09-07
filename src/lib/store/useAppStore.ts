import { create, type StateCreator } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

/**
 * @file useAppStore.ts
 *
 * Global "system" store — sehemu MOJA ya ukweli (single source of truth)
 * kuhusu: kifaa (device), hali ya mtandao (network), afya ya app (focus/
 * visibility/idle), betri, lugha/timezone, na usimamizi wa version/refresh.
 *
 * Store hii YENYEWE haiguswi na `window`/`document`/`navigator` moja kwa
 * moja — ni "dumb state container" tu. Uunganisho wote na browser APIs
 * (event listeners) upo kwenye `useSystemListeners()` (faili tofauti),
 * ili store ibaki rahisi kupima (testable) na SSR-safe.
 *
 * ---
 *
 * ## Matumizi ya haraka
 *
 * ```tsx
 * // 1. Wire listeners MARA MOJA tu, juu kabisa ya app (client component)
 * // app/providers.tsx
 * 'use client';
 * import { useSystemListeners } from '@/store/useSystemListeners';
 *
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   useSystemListeners();
 *   return children;
 * }
 * ```
 *
 * ```tsx
 * // 2. Tumia kwenye component yoyote, popote pale
 * import { useAppStore, useIsMobileView, useIsOnline } from '@/store/useAppStore';
 *
 * function Header() {
 *   const isMobile = useIsMobileView();
 *   const isOnline = useIsOnline();
 *
 *   return (
 *     <header>
 *       {!isOnline && <OfflineBanner />}
 *       {isMobile ? <MobileNav /> : <DesktopNav />}
 *     </header>
 *   );
 * }
 * ```
 */

/* ==================================================================== */
/* Shared types                                                         */
/* ==================================================================== */

export type OS = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other';
export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'other';
export type Orientation = 'portrait' | 'landscape';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown';
export type EffectiveType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
export type RefreshReason =
  | 'version_update'
  | 'stale_session'
  | 'network_recovery'
  | null;

/** Aina ya "action creator" ya kila slice — inashirikiana `AppState` nzima
 * (kwa mfano `setOnlineStatus` inagusa pia `needsRefresh`/`refreshReason`),
 * lakini kila slice inarudisha sehemu yake tu ya state. */
type Slice<T> = StateCreator<AppState, [['zustand/devtools', never]], [], T>;

/* ==================================================================== */
/* 1. Device & Screen slice                                             */
/* ==================================================================== */

/**
 * Taarifa za kifaa/skrini ya mtumiaji: aina ya kifaa, OS, browser,
 * upendeleo wa "reduced motion", mwelekeo wa skrini, na ukubwa wa dirisha.
 *
 * Sehemu hizi zinajazwa MARA MOJA na `useSystemListeners` (isipokuwa
 * `viewport`/`orientation` zinazobadilika wakati wa `resize`).
 *
 * @example Kuonyesha UI tofauti kwa simu vs desktop
 * ```tsx
 * const isMobile = useAppStore((s) => s.isMobileView);
 * return isMobile ? <BottomTabBar /> : <SideBar />;
 * ```
 *
 * @example Kuzima animation kwa watumiaji wenye "reduced motion"
 * ```tsx
 * const reducedMotion = useAppStore((s) => s.reducedMotion);
 * <motion.div transition={{ duration: reducedMotion ? 0 : 0.3 }} />
 * ```
 *
 * @example Kuandika logic maalum kwa iOS (mfano safe-area padding)
 * ```tsx
 * const os = useAppStore((s) => s.os);
 * <div className={os === 'ios' ? 'pb-safe' : ''}>...</div>
 * ```
 */
export interface DeviceSlice {
  /** `true` ikiwa `viewport.width < 768`. */
  isMobileView: boolean;
  /** `true` ikiwa `768 <= viewport.width < 1024`. */
  isTablet: boolean;
  /** `true` ikiwa kifaa kina uwezo wa touch (`navigator.maxTouchPoints > 0`). */
  isTouch: boolean;
  /** Mfumo wa uendeshaji uliogunduliwa kutoka User-Agent. */
  os: OS;
  /** Browser iliyogunduliwa kutoka User-Agent. */
  browser: Browser;
  /** `true` ikiwa mtumiaji amewasha "prefers-reduced-motion" kwenye OS/browser. */
  reducedMotion: boolean;
  /** Mwelekeo wa sasa wa skrini, kokotolewa kutoka `viewport`. */
  orientation: Orientation;
  /** Ukubwa wa dirisha kwa sasa (px). `{0,0}` kabla ya listeners kupakia (SSR). */
  viewport: { width: number; height: number };

  /**
   * Weka ukubwa mpya wa dirisha; inakokotoa upya `isMobileView`/`isTablet`
   * moja kwa moja. Kawaida inaitwa na `useSystemListeners` kwenye `resize`.
   */
  setViewport: (width: number, height: number) => void;
  /** Weka mwelekeo wa skrini moja kwa moja (bila kupitia `setViewport`). */
  setOrientation: (orientation: Orientation) => void;
  /** Weka upendeleo wa reduced-motion (kutoka `matchMedia` change event). */
  setReducedMotion: (value: boolean) => void;
  /** Weka taarifa za mfumo zisizobadilika mara kwa mara (OS/browser/touch). */
  setSystemInfo: (info: Partial<Pick<DeviceSlice, 'os' | 'browser' | 'isTouch'>>) => void;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

const createDeviceSlice: Slice<DeviceSlice> = (set) => ({
  isMobileView: false,
  isTablet: false,
  isTouch: false,
  os: 'other',
  browser: 'other',
  reducedMotion: false,
  orientation: 'portrait',
  viewport: { width: 0, height: 0 },

  setViewport: (width, height) =>
    set(
      {
        viewport: { width, height },
        isMobileView: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      },
      false,
      'device/setViewport'
    ),

  setOrientation: (orientation) =>
    set({ orientation }, false, 'device/setOrientation'),

  setReducedMotion: (value) =>
    set({ reducedMotion: value }, false, 'device/setReducedMotion'),

  setSystemInfo: (info) => set(info, false, 'device/setSystemInfo'),
});

/* ==================================================================== */
/* 2. Network slice                                                     */
/* ==================================================================== */

/**
 * Hali ya mtandao — si tu online/offline, bali pia UBORA wa connection
 * (kasi, aina, "data saver"), muhimu kwa kuamua mfano: kupakia picha za
 * ubora wa chini kwa watumiaji wenye 2G au `saveData: true`.
 *
 * `connectionType`/`effectiveType`/`downlink`/`saveData` zinategemea
 * Network Information API — HAIPO kwenye Safari/Firefox, hivyo zitabaki
 * `'unknown'`/`null` kwenye browser hizo (fallback salama, si error).
 *
 * @example Banner ya "umepoteza mtandao"
 * ```tsx
 * const isOnline = useIsOnline();
 * const isReconnecting = useAppStore((s) => s.isReconnecting);
 *
 * if (!isOnline) {
 *   return <Banner>{isReconnecting ? 'Inajaribu kuunganisha...' : 'Hakuna mtandao'}</Banner>;
 * }
 * ```
 *
 * @example Kupunguza ubora wa data kwa mtandao wa polepole
 * ```tsx
 * const isSlow = useIsSlowConnection();
 * <Image quality={isSlow ? 40 : 90} src={photo} />
 * ```
 *
 * @example Ku-refresh data baada ya kurudi mtandaoni
 * ```tsx
 * useEffect(() => {
 *   return useAppStore.subscribe(
 *     (s) => s.refreshReason,
 *     (reason) => {
 *       if (reason === 'network_recovery') refetchQueries();
 *     }
 *   );
 * }, []);
 * ```
 */
export interface NetworkSlice {
  /** `true` ikiwa kifaa kina mtandao kwa sasa. */
  isOnline: boolean;
  /** `true` wakati app inajaribu kikamilifu kurudi mtandaoni baada ya offline. */
  isReconnecting: boolean;
  /** Aina ya connection (`wifi`/`cellular`/`ethernet`) — kama browser inaunga mkono. */
  connectionType: ConnectionType;
  /** Kasi "halisi" iliyokadiriwa na browser (`4g`/`3g`/`2g`/`slow-2g`). */
  effectiveType: EffectiveType;
  /** Kadirio la Mbps, au `null` kama haipatikani. */
  downlink: number | null;
  /** `true` ikiwa mtumiaji amewasha "Data Saver" kwenye browser/OS. */
  saveData: boolean;
  /** Kokotoo tayari: `true` ikiwa `effectiveType` ni 2g/slow-2g AU `saveData` ni true. */
  isSlowConnection: boolean;

  /**
   * Weka hali ya online/offline. Ikirudi `true` kutoka `false`, moja kwa
   * moja inaweka `needsRefresh: true` na `refreshReason: 'network_recovery'`
   * — hakuna haja ya kuita `triggerRefresh` wewe mwenyewe.
   */
  setOnlineStatus: (status: boolean) => void;
  /** Weka `isReconnecting` (kawaida wakati wa ku-"ping" server kuangalia mtandao). */
  setReconnecting: (status: boolean) => void;
  /** Weka taarifa za ubora wa connection kutoka Network Information API. */
  setConnectionQuality: (info: {
    connectionType?: ConnectionType;
    effectiveType?: EffectiveType;
    downlink?: number | null;
    saveData?: boolean;
  }) => void;
}

const createNetworkSlice: Slice<NetworkSlice> = (set) => ({
  isOnline: true,
  isReconnecting: false,
  connectionType: 'unknown',
  effectiveType: 'unknown',
  downlink: null,
  saveData: false,
  isSlowConnection: false,

  setOnlineStatus: (status) =>
    set(
      (state) => ({
        isOnline: status,
        isReconnecting: status ? false : state.isReconnecting,
        refreshReason:
          status && !state.isOnline ? 'network_recovery' : state.refreshReason,
        needsRefresh: status && !state.isOnline ? true : state.needsRefresh,
      }),
      false,
      'network/setOnlineStatus'
    ),

  setReconnecting: (status) =>
    set({ isReconnecting: status }, false, 'network/setReconnecting'),

  setConnectionQuality: (info) =>
    set(
      (state) => {
        const effectiveType = info.effectiveType ?? state.effectiveType;
        const saveData = info.saveData ?? state.saveData;
        return {
          ...info,
          isSlowConnection:
            effectiveType === '2g' || effectiveType === 'slow-2g' || saveData,
        };
      },
      false,
      'network/setConnectionQuality'
    ),
});

/* ==================================================================== */
/* 3. Health / Activity slice                                           */
/* ==================================================================== */

/**
 * "Afya" ya session ya mtumiaji kwa sasa: focus, visibility, na muda wa
 * mwisho kuwa active — muhimu kwa mambo kama: kusimamisha polling wakati
 * tab haionekani, au kuonyesha "away" status.
 *
 * `isFocused` na `isVisible` SI kitu kimoja: tab inaweza kuwa `visible`
 * (mtumiaji anaiona) lakini bila `focus` (mfano ame-click DevTools).
 *
 * @example Simamisha polling wakati tab haionekani (jenga bandwidth)
 * ```tsx
 * const isVisible = useAppStore((s) => s.isVisible);
 * useEffect(() => {
 *   if (!isVisible) return;
 *   const id = setInterval(fetchNotifications, 10_000);
 *   return () => clearInterval(id);
 * }, [isVisible]);
 * ```
 *
 * @example Onyesha "Away" baada ya dakika 5 bila kutenda
 * ```tsx
 * const lastActive = useAppStore((s) => s.lastActive);
 * const isAway = Date.now() - lastActive > 5 * 60_000;
 * ```
 */
export interface HealthSlice {
  /** `true` ikiwa window ina focus kwa sasa. */
  isFocused: boolean;
  /** `true` ikiwa tab inaonekana (`document.visibilityState === 'visible'`). */
  isVisible: boolean;
  /** Timestamp (`Date.now()`) ya mwisho mtumiaji kuguswa na app. `0` kabla ya client-hydrate. */
  lastActive: number;

  /** Weka hali ya window focus/blur. */
  setFocusStatus: (status: boolean) => void;
  /** Weka hali ya tab visibility. */
  setVisibility: (visible: boolean) => void;
  /** Weka `lastActive = Date.now()`. Inaitwa kiotomatiki (throttled) na `useSystemListeners`. */
  updateActivity: () => void;
}

const createHealthSlice: Slice<HealthSlice> = (set) => ({
  isFocused: true,
  isVisible: true,
  lastActive: 0,

  setFocusStatus: (status) =>
    set({ isFocused: status }, false, 'health/setFocusStatus'),

  setVisibility: (visible) =>
    set({ isVisible: visible }, false, 'health/setVisibility'),

  updateActivity: () =>
    set({ lastActive: Date.now() }, false, 'health/updateActivity'),
});

/* ==================================================================== */
/* 4. Battery slice                                                     */
/* ==================================================================== */

/**
 * Taarifa za betri, kutoka Battery Status API. API hii imeondolewa kwenye
 * Firefox/Safari kwa sababu za faragha na inapatikana Chrome/Android
 * pekee kwa sasa — thamani zitabaki `null` kwenye browser zisizounga
 * mkono (fallback salama).
 *
 * @example Zima auto-play video/animations betri ikiwa chini
 * ```tsx
 * const isLowBattery = useAppStore((s) => s.isLowBattery);
 * <video autoPlay={!isLowBattery} />
 * ```
 */
export interface BatterySlice {
  /** Asilimia ya betri (0 mpaka 1), au `null` kama haipatikani. */
  batteryLevel: number | null;
  /** `true` ikiwa kifaa kinachaji, `null` kama haijulikani. */
  isCharging: boolean | null;
  /** Kokotoo tayari: `true` ikiwa `batteryLevel < 0.2` na haichaji. */
  isLowBattery: boolean;

  /** Weka taarifa za betri (inaitwa na `useSystemListeners` kwenye `levelchange`/`chargingchange`). */
  setBatteryInfo: (info: { level: number | null; charging: boolean | null }) => void;
}

const createBatterySlice: Slice<BatterySlice> = (set) => ({
  batteryLevel: null,
  isCharging: null,
  isLowBattery: false,

  setBatteryInfo: ({ level, charging }) =>
    set(
      {
        batteryLevel: level,
        isCharging: charging,
        isLowBattery: level !== null && level < 0.2 && charging !== true,
      },
      false,
      'battery/setBatteryInfo'
    ),
});

/* ==================================================================== */
/* 5. Locale slice                                                      */
/* ==================================================================== */

/**
 * Lugha na timezone ya mtumiaji, kutoka `navigator.language` na
 * `Intl.DateTimeFormat().resolvedOptions().timeZone`. Inagunduliwa mara
 * moja tu (kama `os`/`browser`) — badiliko la lugha kwa kawaida linahitaji
 * page reload, si kitu cha ku-"subscribe" kwa real-time.
 *
 * @example Kuonyesha tarehe kwa timezone sahihi ya mtumiaji
 * ```tsx
 * const timezone = useAppStore((s) => s.timezone);
 * new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).format(date);
 * ```
 *
 * @example Kuchagua lugha ya awali ya UI kiotomatiki
 * ```tsx
 * const language = useAppStore((s) => s.language); // mfano "sw-TZ"
 * const locale = language.startsWith('sw') ? 'sw' : 'en';
 * ```
 */
export interface LocaleSlice {
  /** Mfano: `"sw-TZ"`, `"en-US"`. */
  language: string;
  /** Mfano: `"Africa/Dar_es_Salaam"`. */
  timezone: string;

  /** Weka lugha/timezone (inaitwa mara moja na `useSystemListeners`). */
  setLocale: (info: { language: string; timezone: string }) => void;
}

const createLocaleSlice: Slice<LocaleSlice> = (set) => ({
  language: 'en',
  timezone: 'UTC',

  setLocale: (info) => set(info, false, 'locale/setLocale'),
});

/* ==================================================================== */
/* 6. Version / maintenance slice                                       */
/* ==================================================================== */

/**
 * Usimamizi wa toleo la app na "refresh" ya lazima — kwa mfano ku-onyesha
 * modal ya "Kuna toleo jipya, refresh sasa" bila kumlazimisha mtumiaji.
 *
 * @example Modal ya lazima kuonyesha update
 * ```tsx
 * const { needsRefresh, refreshReason } = useNeedsRefresh();
 * const resetRefresh = useAppStore((s) => s.resetRefresh);
 *
 * if (needsRefresh && refreshReason === 'version_update') {
 *   return <UpdateModal onDismiss={resetRefresh} onRefresh={() => location.reload()} />;
 * }
 * ```
 *
 * @example Kuanzisha refresh kutoka polling ya version (mfano kila dakika 5)
 * ```tsx
 * useEffect(() => {
 *   const id = setInterval(async () => {
 *     const { version } = await fetch('/api/version').then((r) => r.json());
 *     if (version !== useAppStore.getState().systemVersion) {
 *       useAppStore.getState().triggerRefresh('version_update');
 *     }
 *   }, 5 * 60_000);
 *   return () => clearInterval(id);
 * }, []);
 * ```
 */
export interface VersionSlice {
  /** Toleo la sasa la kodi, kutoka `VITE_APP_VERSION` env var. */
  systemVersion: string;
  /** `true` ikiwa kuna sababu ya kumhitaji mtumiaji ku-refresh. */
  needsRefresh: boolean;
  /** Sababu ya refresh, kwa ajili ya kuonyesha ujumbe sahihi kwenye UI. */
  refreshReason: RefreshReason;

  /** Weka `needsRefresh: true` na sababu husika. */
  triggerRefresh: (reason: RefreshReason) => void;
  /** Futa hali ya refresh (baada ya mtumiaji kuchukua hatua). */
  resetRefresh: () => void;
}

const createVersionSlice: Slice<VersionSlice> = (set) => ({
  systemVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
  needsRefresh: false,
  refreshReason: null,

  triggerRefresh: (reason) =>
    set({ needsRefresh: true, refreshReason: reason }, false, 'version/triggerRefresh'),

  resetRefresh: () =>
    set({ needsRefresh: false, refreshReason: null }, false, 'version/resetRefresh'),
});

/* ==================================================================== */
/* Combined store                                                       */
/* ==================================================================== */

export type AppState = DeviceSlice &
  NetworkSlice &
  HealthSlice &
  BatterySlice &
  LocaleSlice &
  VersionSlice;

/**
 * Store kuu ya "system state". Tumia moja kwa moja na selector
 * (`useAppStore((s) => s.field)`) — SI `useAppStore()` bila selector,
 * kwani hiyo inasababisha re-render kila field ikibadilika.
 *
 * @example
 * ```tsx
 * // ✅ Nzuri — re-render tu wakati isOnline inabadilika
 * const isOnline = useAppStore((s) => s.isOnline);
 *
 * // ❌ Epuka — re-render kila field YOYOTE ikibadilika
 * const state = useAppStore();
 * ```
 */
export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector((...a) => ({
      ...createDeviceSlice(...a),
      ...createNetworkSlice(...a),
      ...createHealthSlice(...a),
      ...createBatterySlice(...a),
      ...createLocaleSlice(...a),
      ...createVersionSlice(...a),
    })),
    { name: 'AppStore' }
  )
);

/* ==================================================================== */
/* Selector hooks za kawaida                                            */
/* ==================================================================== */

/** Shortcut kwa `s.isMobileView` — epuka re-render zisizo za lazima. */
export const useIsMobileView = () => useAppStore((s) => s.isMobileView);

/** Shortcut kwa `s.isOnline`. */
export const useIsOnline = () => useAppStore((s) => s.isOnline);

/** Shortcut kwa `s.isSlowConnection` — tumia kuamua ubora wa content unaopakia. */
export const useIsSlowConnection = () => useAppStore((s) => s.isSlowConnection);

/** Shortcut kwa `s.isLowBattery`. */
export const useIsLowBattery = () => useAppStore((s) => s.isLowBattery);

/**
 * Inarudisha `{ needsRefresh, refreshReason }` pamoja — muafaka kwa
 * component moja inayoshughulikia modal/banner ya update.
 */
export const useNeedsRefresh = () =>
  useAppStore((s) => ({ needsRefresh: s.needsRefresh, refreshReason: s.refreshReason }));