'use client';

import { useEffect } from 'react';
import { useAppStore, type Browser, type OS } from './useAppStore';

/**
 * @file useSystemListeners.ts
 *
 * "Bridge" pekee kati ya browser APIs (`window`, `document`, `navigator`)
 * na `useAppStore`. Store yenyewe haijui kuhusu `window` — faili hii ndiyo
 * inayosikiliza matukio na kuweka matokeo ndani ya store.
 *
 * Kwa nini ni hook tofauti na siyo ndani ya store moja kwa moja?
 * - Store lazima ibaki salama kutumika SSR (haipaswi kugusa `window` wakati
 *   wa import).
 * - Event listeners zinahitaji React lifecycle (`useEffect` cleanup) ili
 *   zisivuje memory (`removeEventListener`) — hilo si jukumu la store.
 */

/* ==================================================================== */
/* Detection helpers (zinaendeshwa mara moja tu, client-side)            */
/* ==================================================================== */

function detectOS(ua: string): OS {
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac os x/i.test(ua) && navigator.maxTouchPoints <= 1) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return 'other';
}

function detectBrowser(ua: string): Browser {
  if (/edg\//i.test(ua)) return 'edge';
  if (/chrome|crios/i.test(ua)) return 'chrome';
  if (/firefox|fxios/i.test(ua)) return 'firefox';
  if (/safari/i.test(ua)) return 'safari';
  return 'other';
}

/** Network Information API si sehemu rasmi ya `lib.dom.d.ts` bado (2026),
 * hivyo tunaieleza wenyewe hapa. Baadhi ya fields ni vendor-prefixed. */
interface NetworkInformationLike extends EventTarget {
  type?: string;
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  saveData?: boolean;
}

function getConnection(): NetworkInformationLike | undefined {
  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

/** Battery Status API — imeondolewa Firefox/Safari, ipo Chrome/Android. */
interface BatteryManagerLike extends EventTarget {
  level: number; // 0..1
  charging: boolean;
}

function getBattery(): Promise<BatteryManagerLike> | undefined {
  const nav = navigator as Navigator & {
    getBattery?: () => Promise<BatteryManagerLike>;
  };
  return nav.getBattery?.();
}

const RECONNECT_PING_INTERVAL = 5000;
const IDLE_ACTIVITY_THROTTLE = 15000;

/**
 * Huunganisha `window` / `document` / Network Information API / Battery
 * API na `useAppStore`. **Iite MARA MOJA tu**, ndani ya root layout au
 * provider (client component) — si kwenye kila component inayotumia
 * store, la sivyo utaongeza listeners nyingi zinazorudia kazi ile ile.
 *
 * @example Kuiweka kwenye Next.js App Router
 * ```tsx
 * // app/providers.tsx
 * 'use client';
 * import { useSystemListeners } from '@/store/useSystemListeners';
 *
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   useSystemListeners();
 *   return <>{children}</>;
 * }
 * ```
 *
 * ```tsx
 * // app/layout.tsx
 * import { Providers } from './providers';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="sw">
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example Kuiweka kwenye Vite/CRA (bila App Router)
 * ```tsx
 * // App.tsx
 * function App() {
 *   useSystemListeners(); // sawa kabisa, hakuna 'use client' inahitajika
 *   return <RouterProvider router={router} />;
 * }
 * ```
 *
 * @remarks
 * Kazi zote ndani ya hook hii zinajitegemea (independent `useEffect`
 * blocks) — kama browser haiungi mkono API fulani (mfano Battery kwenye
 * Firefox), `useEffect` husika inatoka mapema (`return`) bila kuathiri
 * listeners nyingine.
 */
export function useSystemListeners() {
  const {
    setViewport,
    setOrientation,
    setReducedMotion,
    setSystemInfo,
    setOnlineStatus,
    setReconnecting,
    setConnectionQuality,
    setFocusStatus,
    setVisibility,
    updateActivity,
    setBatteryInfo,
    setLocale,
  } = useAppStore.getState();

  // --- Device info: mara moja tu (haibadiliki wakati wa runtime)
  useEffect(() => {
    const ua = navigator.userAgent;
    setSystemInfo({
      os: detectOS(ua),
      browser: detectBrowser(ua),
      isTouch: navigator.maxTouchPoints > 0,
    });
    updateActivity(); // weka lastActive halisi, epuka thamani ya SSR (0)
  }, [setSystemInfo, updateActivity]);

  // --- Lugha & Timezone: mara moja tu
  useEffect(() => {
    setLocale({
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, [setLocale]);

  // --- Viewport & orientation
  useEffect(() => {
    const updateViewport = () => {
      setViewport(window.innerWidth, window.innerHeight);
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [setViewport, setOrientation]);

  // --- Reduced motion preference
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setReducedMotion]);

  // --- Online / offline + jaribio la kurudi mtandaoni
  useEffect(() => {
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const stopPinging = () => {
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = null;
    };

    const attemptReconnect = async () => {
      setReconnecting(true);
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
        setOnlineStatus(true);
        stopPinging();
      } catch {
        // bado offline, jaribu tena kwenye interval ijayo
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      if (!pingTimer) pingTimer = setInterval(attemptReconnect, RECONNECT_PING_INTERVAL);
    };

    const handleOnline = () => {
      setOnlineStatus(true);
      stopPinging();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      stopPinging();
    };
  }, [setOnlineStatus, setReconnecting]);

  // --- Connection quality (4g/3g/2g, saveData) — si kila browser inaunga mkono
  useEffect(() => {
    const connection = getConnection();
    if (!connection) return;

    const updateQuality = () => {
      setConnectionQuality({
        connectionType: (connection.type as any) ?? 'unknown',
        effectiveType: connection.effectiveType ?? 'unknown',
        downlink: connection.downlink ?? null,
        saveData: connection.saveData ?? false,
      });
    };

    updateQuality();
    connection.addEventListener('change', updateQuality);
    return () => connection.removeEventListener('change', updateQuality);
  }, [setConnectionQuality]);

  // --- Betri — Battery Status API (Chrome/Android; no-op kwenye Firefox/Safari)
  useEffect(() => {
    let battery: BatteryManagerLike | undefined;
    let cancelled = false;

    const updateBattery = () => {
      if (battery) setBatteryInfo({ level: battery.level, charging: battery.charging });
    };

    getBattery()?.then((b) => {
      if (cancelled) return;
      battery = b;
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    });

    return () => {
      cancelled = true;
      battery?.removeEventListener('levelchange', updateBattery);
      battery?.removeEventListener('chargingchange', updateBattery);
    };
  }, [setBatteryInfo]);

  // --- Window focus / blur
  useEffect(() => {
    const handleFocus = () => setFocusStatus(true);
    const handleBlur = () => setFocusStatus(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [setFocusStatus]);

  // --- Tab visibility (tofauti na focus — tab inaweza kuwa visible bila focus)
  useEffect(() => {
    const handleVisibility = () => setVisibility(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [setVisibility]);

  // --- Idle / activity tracking (throttled ili isijae store na updates)
  useEffect(() => {
    let lastCall = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastCall > IDLE_ACTIVITY_THROTTLE) {
        lastCall = now;
        updateActivity();
      }
    };
    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [updateActivity]);
}