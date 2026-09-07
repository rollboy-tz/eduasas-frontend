import { UAParser, type IResult } from "ua-parser-js";

/**
 * @file ClientDevice.ts
 *
 * Static utility inayokusanya taarifa za kifaa/mtandao/mahali kwa ajili
 * ya "audit headers" zinazotumwa kwenye kila request (mfano Axios
 * interceptor). Matokeo yote yanahifadhiwa (cached) mara ya kwanza
 * yanapohitajika — hayakokotolewi upya kwa kila request.
 *
 * @remarks Kuhusu usahihi wa hardware fingerprint
 * Browsers za kisasa (Chrome "GPU info reduction", Firefox
 * `privacy.resistFingerprinting`) zinazidi kurudisha thamani za GPU
 * zisizo halisi (generic) kwa makusudi ili kuzuia fingerprinting —
 * `X-Client-HW` haitakuwa 100% ya kuaminika kwa watumiaji wote.
 *
 * @remarks Kuhusu faragha (privacy)
 * Hii ni aina ya device fingerprinting. Kama app inatumika Ulaya (EU),
 * fingerprinting isiyo ya lazima kiufundi (si kwa ajili ya usalama wa
 * moja kwa moja) mara nyingi inahitaji kutajwa kwenye privacy policy —
 * angalia sheria husika (GDPR/ePrivacy) kabla ya kuituma kwa watumiaji
 * wote bila taarifa.
 */

/* ==================================================================== */
/* Types                                                                */
/* ==================================================================== */

type NavigatorExtended = Navigator & {
  deviceMemory?: number;
  standalone?: boolean;
};

interface HardwareInfo {
  cores: number | "N/A";
  ramGB: number | "N/A";
  gpu: string;
  /** Muundo wa "CPU:x|RAM:yGB|GPU:z" — chanzo cha `X-Client-HW`/hash. */
  raw: string;
}

interface LocalityInfo {
  timezone: string;
  locale: string;
  combined: string;
}

/* ==================================================================== */
/* Hash helper (sync, si cryptographic — kwa fingerprint tu, si siri)   */
/* ==================================================================== */

/**
 * FNV-1a — hash haraka, sync, isiyoweza kurudishwa nyuma (tofauti na
 * `btoa` ambayo ni reversible tu). Si sawa na SHA-256 kwa usalama, lakini
 * inatosha kwa "fingerprint ID" isiyo ya siri. Ukihitaji usalama zaidi,
 * tumia `ClientDevice.getFingerprintHashAsync()` (SHA-256 kupitia
 * Web Crypto) badala yake — Axios interceptors zinaunga mkono async.
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/* ==================================================================== */
/* ClientDevice                                                         */
/* ==================================================================== */

export class ClientDevice {
  public static readonly APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0-stable";
  public static readonly BRAND_NAME = import.meta.env.VITE_BRAND_NAME || "EduAsas";

  /* --- Caches: kila kimoja kinakokotolewa MARA MOJA tu kwa session --- */
  private static _parser: IResult | null | undefined;
  private static _hardware: HardwareInfo | undefined;
  private static _locality: LocalityInfo | undefined;
  private static _platform: string | undefined;

  private static getParser(): IResult | null {
    if (this._parser !== undefined) return this._parser;
    if (typeof window === "undefined") return (this._parser = null);
    this._parser = new UAParser(window.navigator.userAgent).getResult();
    return this._parser;
  }

  /**
   * Hardware fingerprint: CPU cores, RAM (deviceMemory), GPU renderer.
   * Inaunda WebGL context MARA MOJA tu (ikitunza cache), kisha
   * inaiachilia (`WEBGL_lose_context`) mara moja baada ya kusoma thamani
   * — epuka kuvuja kwa WebGL contexts (browsers zina kikomo cha ~16).
   */
  private static getHardwareInfo(): HardwareInfo {
    if (this._hardware) return this._hardware;

    if (typeof window === "undefined") {
      return (this._hardware = { cores: "N/A", ramGB: "N/A", gpu: "Server", raw: "Server" });
    }

    const nav = navigator as NavigatorExtended;
    const cores = navigator.hardwareConcurrency ?? "N/A";
    const ramGB = nav.deviceMemory ?? "N/A";
    let gpu = "Unknown";
    let canvas: HTMLCanvasElement | undefined;

    try {
      canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        gpu = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : "Blocked";
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    } catch {
      gpu = "Inaccessible";
    } finally {
      canvas?.remove();
    }

    const raw = `CPU:${cores}|RAM:${ramGB}GB|GPU:${gpu}`;
    return (this._hardware = { cores, ramGB, gpu, raw });
  }

  /**
   * Timezone na locale kutoka browser — bila GPS, bila ruhusa ya
   * ziada inayohitajika kwa mtumiaji.
   */
  static getDetailedLocality(): LocalityInfo {
    if (this._locality) return this._locality;

    if (typeof window === "undefined") {
      return (this._locality = { timezone: "UTC", locale: "en-US", combined: "Unknown" });
    }

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language || "en-US";
      return (this._locality = { timezone, locale, combined: `${timezone} (${locale})` });
    } catch {
      return (this._locality = { timezone: "UTC", locale: "en-US", combined: "Error-Locality" });
    }
  }

  /**
   * Platform string: `{Browser|PWA}-{deviceType}({BRAND})`.
   * Inachukua `IResult` kama param badala ya kuita `getParser()` yenyewe
   * — inazuia UA kupasuliwa (parse) mara mbili ndani ya `getAuditHeaders`.
   */
  private static computePlatform(result: IResult | null): string {
    if (!result) return `${this.BRAND_NAME}-SSR`;

    const nav = navigator as NavigatorExtended;
    const isPWA = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    const type = result.device.type || "PC";
    const prefix = isPWA ? "PWA" : "Browser";

    return `${prefix}-${type}(${this.BRAND_NAME})`;
  }

  /** Platform string, cached. Tumia hii nje ya `getAuditHeaders` ukihitaji peke yake. */
  static getPlatform(): string {
    if (this._platform) return this._platform;
    return (this._platform = this.computePlatform(this.getParser()));
  }

  /**
   * Fingerprint hash ya sync (FNV-1a) — inatosha kwa `X-Client-HW-Hash`
   * isiyo ya siri. Kwa usalama zaidi (kuzuia urejeshaji/rainbow-table),
   * tumia `getFingerprintHashAsync()`.
   */
  static getFingerprintHash(): string {
    return fnv1aHash(this.getHardwareInfo().raw);
  }

  /** SHA-256 (Web Crypto) — chagua hii kwenye Axios interceptor ya async. */
  static async getFingerprintHashAsync(): Promise<string> {
    const raw = this.getHardwareInfo().raw;
    if (typeof crypto === "undefined" || !crypto.subtle) return fnv1aHash(raw);

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  }

  /**
   * Headers za audit zinazotumwa kwenye kila request. Zimejengwa kutoka
   * kwenye cached values — gharama ya kweli (UA parse, WebGL context)
   * inatokea MARA MOJA tu kwa session, si kwa kila request.
   *
   * @example
   * ```ts
   * axios.interceptors.request.use((config) => {
   *   Object.assign(config.headers, ClientDevice.getAuditHeaders());
   *   return config;
   * });
   * ```
   */
  static getAuditHeaders(): Record<string, string> {
    const result = this.getParser();
    const locality = this.getDetailedLocality();
    const hardware = this.getHardwareInfo();

    return {
      // Brand & Version
      "X-Client-Platform": this.getPlatform(),
      "X-Client-Version": this.APP_VERSION,

      // Device Identity
      "X-Client-Device": result
        ? `${result.device.vendor || ""} ${result.device.model || ""}`.trim() || "PC"
        : "PC",
      "X-Client-OS": result?.os.name ? `${result.os.name} ${result.os.version ?? ""}`.trim() : "Unknown",
      "X-Client-Browser": result?.browser.name
        ? `${result.browser.name} ${result.browser.version ?? ""}`.trim()
        : "Unknown",

      // Hardware fingerprint — hash isiyoweza kurudishwa nyuma, si raw data
      "X-Client-HW": hardware.gpu,
      "X-Client-HW-Hash": this.getFingerprintHash(),
      "X-Client-Res": typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "0x0",

      // Locality
      "X-Client-TZ": locality.timezone,
      "X-Client-Loc": locality.locale,
    };
  }
}