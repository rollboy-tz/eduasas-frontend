/**
 * @fileoverview Domain and Subdomain Parsing Utility for EduAsas Multi-Tenant Architecture.
 * Handles Local, Beta, and Production environments safely with strict TypeScript typing.
 */

/**
 * Zinazokubalika kama Base Domains za mfumo kwa sasa na hapo mbeleni.
 */
export const SUPPORTED_BASE_DOMAINS = ['eduasas.co.tz', 'eduasas.com'] as const;

/**
 * Aina za Base Domain zinazotumika kwenye mfumo.
 */
export type SupportedBaseDomain = typeof SUPPORTED_BASE_DOMAINS[number];

/**
 * Mazingira ya uendeshaji wa mfumo (Environment Stage).
 */
export type AppStage = 'local' | 'beta' | 'prod';

/**
 * Muundo wa taarifa zinazotolewa baada ya kuchambua Hostname ya ombi (Request Context).
 */
export interface RequestContext {
  /** Mazingira ya sasa ya mfumo */
  readonly stage: AppStage;
  /** Jina la Tenant (Mfano: jina la shule au 'admin'), au null kama ni Landing Page kuu */
  readonly tenant: string | null;
  /** Hali ya kuonyesha kama ombi limetokea kwenye Root Domain (bila subdomain) */
  readonly isRootDomain: boolean;
  /** Domain kuu inayotumika kwa sasa (Mfano: 'eduasas.co.tz' au 'localhost') */
  readonly domain: string;
}

/**
 * Hukagua kama maandishi fulani ni Base Domain inayotambulika na mfumo.
 * Inaweza kutumika pia kwenye fomu za usajili kuhakikisha domain ni sahihi.
 * 
 * @param {string} domain - Domain inayotakiwa kukaguliwa
 * @returns {boolean}
 */
export function isSupportedBaseDomain(domain: string): domain is SupportedBaseDomain {
  return SUPPORTED_BASE_DOMAINS.includes(domain as SupportedBaseDomain);
}

/**
 * Inachambua hostname yoyote inayozalishwa na browser, na kurejesha 
 * taarifa kamili za muktadha (Context) bila kuanguka (fail-safe).
 * 
 * @param {string} [rawHostname] - Hostname kamili (mfano: `mzumbe.eduasas.co.tz` au `localhost:5173`)
 * @returns {RequestContext} Taarifa kamili za stage, tenant, na domain
 */
export function parseDomainAndTenant(rawHostname?: string | null): RequestContext {
  // Kinga ya kwanza (Fail-safe): Kama hostname haipo, rejea default ya prod/root salama
  if (!rawHostname || typeof rawHostname !== 'string') {
    return {
      stage: 'prod',
      tenant: null,
      isRootDomain: true,
      domain: SUPPORTED_BASE_DOMAINS[0],
    };
  }

  // Safisha hostname: Ondoa port (kama 5173 au 3000), fanya iwe ndogo yote (lowercase)
  const host = rawHostname.split(':')[0].trim().toLowerCase();

  if (!host) {
    return {
      stage: 'prod',
      tenant: null,
      isRootDomain: true,
      domain: SUPPORTED_BASE_DOMAINS[0],
    };
  }

  // ==========================================
  // 1. KUSHUGHULIKIA MAZINGIRA YA LOCALHOST AU LOCAL IP
  // ==========================================

  // Angalia kama ni localhost, 127.0.0.1, au IP ya kwenye network ya ndani (IPv4)
  const isLocalIpOrHost =
    host.includes('localhost') ||
    host === '127.0.0.1' ||
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);

  if (isLocalIpOrHost) {
    const parts = host.split('.');

    if (parts.length > 4 && parts[0]) {
      return {
        stage: 'local',
        tenant: parts[0],
        isRootDomain: false,
        domain: parts.slice(1).join('.'),
      };
    }

    return {
      stage: 'local',
      tenant: null,
      isRootDomain: true,
      domain: host,
    };
  }

  // ==========================================
  // 2. KUSHUGHULIKIA BETA NA PRODUCTION
  // ==========================================

  let matchedBaseDomain: SupportedBaseDomain = SUPPORTED_BASE_DOMAINS[0];

  const foundDomain = SUPPORTED_BASE_DOMAINS.find(
    (base) => host === base || host.endsWith(`.${base}`)
  );

  if (foundDomain) {
    matchedBaseDomain = foundDomain;
  } else {
    const segments = host.split('.');
    if (segments.length >= 2) {
      const potentialBase = segments.slice(-2).join('.');
      if (isSupportedBaseDomain(potentialBase)) {
        matchedBaseDomain = potentialBase;
      }
    }
  }

  const isBeta = host.includes(`beta.${matchedBaseDomain}`) || host === `beta.${matchedBaseDomain}`;
  const stage: AppStage = isBeta ? 'beta' : 'prod';

  let subdomainsPart = host.replace(matchedBaseDomain, '').replace(/\.$/, '');

  if (isBeta) {
    subdomainsPart = subdomainsPart.replace(/^beta/, '').replace(/\.$/, '');
  }

  const subdomains = subdomainsPart ? subdomainsPart.split('.').filter(Boolean) : [];

  if (subdomains.length > 0 && subdomains[0]) {
    return {
      stage,
      tenant: subdomains[0],
      isRootDomain: false,
      domain: matchedBaseDomain,
    };
  }

  return {
    stage,
    tenant: null,
    isRootDomain: true,
    domain: matchedBaseDomain,
  };
}