/**
 * @file domain.ts
 * @module @eduasas/utils/domain
 * @description Enterprise-grade Multi-Tenant Domain & Subdomain Parsing Utility for EduAsas.
 * 
 * Engineered to run seamlessly across all JavaScript environments:
 * - Node.js Server Environment
 * - Vercel Edge Runtime & Next.js Middleware
 * - Next.js App Router (Server Components & Server Actions)
 * - Browser Client Side (React Components)
 */

/**
 * List of officially supported primary base domains for the EduAsas core platform.
 * Supports multi-part top-level domains (e.g., '.co.tz').
 */
export const SUPPORTED_BASE_DOMAINS = ['eduasas.co.tz', 'eduasas.com'] as const;

/**
 * TypeScript union type of all recognized core base domains.
 */
export type SupportedBaseDomain = (typeof SUPPORTED_BASE_DOMAINS)[number];

/**
 * Platform hosting preview domains treated as infrastructure rather than tenant names.
 */
export const PLATFORM_HOST_DOMAINS = ['vercel.app', 'netlify.app', 'onrender.com'] as const;

/**
 * Non-production environment stage keywords used in subdomains (e.g., `beta.tengelea.eduasas.co.tz`).
 */
export const NON_PROD_STAGES = ['beta', 'preview', 'staging', 'canary', 'test', 'mvp'] as const;

/**
 * TypeScript union type for non-production stage modifiers.
 */
export type CustomStage = (typeof NON_PROD_STAGES)[number];

/**
 * Valid runtime application stages.
 */
export type AppStage = 'local' | CustomStage | 'prod';

/**
 * Complete network, stage, and tenant breakdown context extracted from a request.
 */
export interface RequestContext {
  /**
   * The detected runtime deployment stage.
   * @example 'local' | 'beta' | 'staging' | 'prod'
   */
  readonly stage: AppStage;

  /**
   * Primary extracted tenant identifier (e.g., 'tengelea-sch').
   * Returns `null` if the request is directly targeting the root platform landing page or an IP address.
   * @example 'tengelea-sch' | null
   */
  readonly tenant: string | null;

  /**
   * Array of all raw subdomains extracted prior to the base domain, excluding stage keywords.
   * @example ['tengelea-sch'] or ['school', 'dept']
   */
  readonly subdomains: readonly string[];

  /**
   * Flag indicating whether the current domain is a root domain without any tenant routing.
   * @example true (for eduasas.co.tz) | false (for school.eduasas.co.tz)
   */
  readonly isRootDomain: boolean;

  /**
   * Clean base domain stripped of subdomains and stage prefixes.
   * @example 'eduasas.co.tz' | 'localhost' | '192.168.1.183'
   */
  readonly domain: string;

  /**
   * Base domain combined with the active stage keyword if present.
   * @example 'beta.eduasas.co.tz' | 'localhost'
   */
  readonly domainWithStage: string;

  /**
   * Network port number if present in the host header.
   * Standard ports (80, 443) are normalized to an empty string.
   * @example '3000' | '5173' | ''
   */
  readonly port: string;

  /**
   * Request protocol including trailing colon.
   * @example 'http:' | 'https:'
   */
  readonly protocol: 'http:' | 'https:';

  /**
   * Full host string including network port if non-standard.
   * @example 'tengelea-sch.localhost:3000' | 'beta.eduasas.co.tz'
   */
  readonly hostWithPort: string;

  /**
   * Clean hostname excluding network port and protocol.
   * @example 'tengelea-sch.eduasas.co.tz' | '192.168.1.183'
   */
  readonly hostname: string;

  /**
   * Fully qualified origin URL including protocol, hostname, and port.
   * @example 'http://tengelea-sch.localhost:3000' | 'https://beta.eduasas.co.tz'
   */
  readonly origin: string;

  /**
   * Central platform root origin URL used for central portal redirects or cross-tenant auth bridges.
   * @example 'http://localhost:3000' | 'https://eduasas.co.tz'
   */
  readonly rootOrigin: string;

  /**
   * Flag indicating whether the domain is a custom domain attached to a tenant (e.g. `school.ac.tz`).
   * @example true | false
   */
  readonly isCustomDomain: boolean;

  /**
   * Flag indicating whether the request was made using a raw IPv4 or IPv6 address.
   * @example true | false
   */
  readonly isIpAddress: boolean;
}

/**
 * Union type for flexible request input parameters across Node.js, Web API, Next.js Middleware, and Browser.
 */
export type RequestInputSource =
  | string
  | URL
  | Request
  | { headers: Headers | Record<string, string | string[] | undefined> }
  | null
  | undefined;

/**
 * Regex matching standard IPv4 addresses with optional port.
 */
const IPV4_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d+)?$/;

/**
 * Regex matching standard IPv6 addresses (with or without brackets) with optional port.
 */
const IPV6_REGEX = /^\[?([a-fA-F0-9:]+)\]?(?::\d+)?$/;

/**
 * Type Guard to check if a domain string matches known core base domains.
 * 
 * @param {string} domain - Domain name to test.
 * @returns {boolean} True if the domain is in the supported base domains list.
 */
export function isSupportedBaseDomain(domain: string): domain is SupportedBaseDomain {
  return (SUPPORTED_BASE_DOMAINS as readonly string[]).includes(domain.toLowerCase());
}

/**
 * Utility to test whether a given hostname is a raw IPv4 or IPv6 address.
 * 
 * @param {string} hostname - The hostname to test (without port).
 * @returns {boolean} True if input is an IP address.
 */
export function isIPAddress(hostname: string): boolean {
  const clean = hostname.replace(/^\[\vert{}\]$/g, '').trim();
  return IPV4_REGEX.test(clean) || IPV6_REGEX.test(clean);
}

/**
 * Safely extracts raw hostname and protocol strings from various JavaScript request objects or URLs.
 * Automatically checks proxy headers (`x-forwarded-host`, `x-forwarded-proto`) for server-side accuracy.
 * 
 * @param {RequestInputSource} input - URL string, Web Request, Next.js Headers, or null.
 * @returns {{ rawUrlOrHost: string; protocolHeader: string | null }} Extracted host string and protocol hint.
 */
function extractHostAndProtocol(input: RequestInputSource): { rawUrlOrHost: string; protocolHeader: string | null } {
  if (typeof window !== 'undefined' && !input) {
    return { rawUrlOrHost: window.location.href, protocolHeader: window.location.protocol };
  }

  if (!input) {
    const envRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN || SUPPORTED_BASE_DOMAINS[0];
    return { rawUrlOrHost: envRoot, protocolHeader: null };
  }

  if (typeof input === 'string') {
    return { rawUrlOrHost: input.trim(), protocolHeader: null };
  }

  if (input instanceof URL) {
    return { rawUrlOrHost: input.href, protocolHeader: input.protocol };
  }

  // Handle standard Web Request / NextRequest / Next.js Headers container
  if (typeof input === 'object' && 'headers' in input && input.headers) {
    const headers = input.headers;
    let host: string | null = null;
    let proto: string | null = null;

    if (typeof (headers as Headers).get === 'function') {
      const h = headers as Headers;
      host = h.get('x-forwarded-host') || h.get('host');
      proto = h.get('x-forwarded-proto');
    } else {
      const h = headers as Record<string, string | string[] | undefined>;
      const rawHost = h['x-forwarded-host'] || h['host'];
      const rawProto = h['x-forwarded-proto'];
      host = Array.isArray(rawHost) ? rawHost[0] : rawHost || null;
      proto = Array.isArray(rawProto) ? rawProto[0] : rawProto || null;
    }

    if (host) {
      return { rawUrlOrHost: host, protocolHeader: proto ? `${proto.replace(/:$/, '')}:` : null };
    }
  }

  if (input instanceof Request) {
    return { rawUrlOrHost: input.url, protocolHeader: null };
  }

  return { rawUrlOrHost: SUPPORTED_BASE_DOMAINS[0], protocolHeader: null };
}

/**
 * Universal Multi-Tenant Domain & Subdomain Parser for EduAsas.
 * 
 * Robustly resolves tenants, stages, origins, and custom domains across all environments.
 * Guarded against multi-part TLDs (e.g. `.co.tz`), raw IP addresses, local Docker containers, 
 * Vercel/Netlify preview subdomains, and proxy-forwarded headers.
 * 
 * @param {RequestInputSource} [input] - String URL, Request object, Next.js Headers, or undefined.
 * @returns {RequestContext} Fully resolved request context object.
 * 
 * @example
 * // Next.js Middleware
 * export function middleware(req: NextRequest) {
 *   const context = parseDomainAndTenant(req);
 *   console.log(context.tenant); // 'tengelea-sch'
 * }
 * 
 * @example
 * // Browser Component
 * const context = parseDomainAndTenant();
 */
export function parseDomainAndTenant(input?: RequestInputSource): RequestContext {
  const fallbackProtocol: 'http:' | 'https:' =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';

  const defaultBaseDomain = SUPPORTED_BASE_DOMAINS[0];

  const { rawUrlOrHost, protocolHeader } = extractHostAndProtocol(input);

  // 1. Fail-safe sanitize empty/invalid strings
  if (!rawUrlOrHost) {
    return createRootContext(defaultBaseDomain, '', fallbackProtocol);
  }

  // Ensure string has protocol prefix for native URL API parsing
  let urlString = rawUrlOrHost;
  if (!urlString.includes('://')) {
    const proto = protocolHeader || fallbackProtocol;
    urlString = `${proto}//${urlString}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    return createRootContext(defaultBaseDomain, '', fallbackProtocol);
  }

  const detectedProtocol: 'http:' | 'https:' =
    (protocolHeader as 'http:' | 'https:') ||
    (parsedUrl.protocol === 'https:' ? 'https:' : 'http:');

  let hostname = parsedUrl.hostname.toLowerCase();
  
  // Normalize IPv6 formatting
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    hostname = hostname.slice(1, -1);
  }

  // Normalize ports (Ignore standard 80 and 443)
  let port = parsedUrl.port;
  if (port === '80' || port === '443') port = '';

  const hostWithPort = port ? `${hostname}:${port}` : hostname;
  const origin = `${detectedProtocol}//${hostWithPort}`;

  const buildRootOrigin = (baseDomainWithStage: string) => {
    return port ? `${detectedProtocol}//${baseDomainWithStage}:${port}` : `${detectedProtocol}//${baseDomainWithStage}`;
  };

  // =========================================================================
  // GUARD 1: DIRECT IP ADDRESS (IPv4 / IPv6)
  // =========================================================================
  if (isIPAddress(hostname)) {
    return {
      stage: 'local',
      tenant: null,
      subdomains: [],
      isRootDomain: true,
      domain: hostname,
      domainWithStage: hostname,
      port,
      protocol: detectedProtocol,
      hostWithPort,
      hostname,
      origin,
      rootOrigin: origin,
      isCustomDomain: false,
      isIpAddress: true,
    };
  }

  // =========================================================================
  // GUARD 2: LOCALHOST ENVIRONMENT (e.g. `localhost`, `sch.localhost:3000`)
  // =========================================================================
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    const parts = hostname.split('.').filter((p) => p !== 'localhost' && Boolean(p));

    let stage: AppStage = 'local';
    const activeStage = NON_PROD_STAGES.find((s) => parts.includes(s));
    if (activeStage) stage = activeStage;

    const subdomains = parts.filter((p) => !NON_PROD_STAGES.includes(p as CustomStage));
    const tenant = subdomains.length > 0 ? subdomains[0] : null;
    const domainWithStage = activeStage ? `${activeStage}.localhost` : 'localhost';

    return {
      stage,
      tenant,
      subdomains: tenant ? subdomains : [],
      isRootDomain: tenant === null,
      domain: 'localhost',
      domainWithStage,
      port,
      protocol: detectedProtocol,
      hostWithPort,
      hostname,
      origin,
      rootOrigin: buildRootOrigin(domainWithStage),
      isCustomDomain: false,
      isIpAddress: false,
    };
  }

  // =========================================================================
  // GUARD 3: PRODUCTION, PREVIEWS & CUSTOM DOMAIN LOGIC
  // =========================================================================
  let matchedBaseDomain = '';
  let isCustomDomain = false;

  const configuredBaseDomains = [
    ...(process.env.NEXT_PUBLIC_ROOT_DOMAIN ? [process.env.NEXT_PUBLIC_ROOT_DOMAIN.toLowerCase()] : []),
    ...SUPPORTED_BASE_DOMAINS,
  ];

  // Match against core platform base domains first (handles multi-part TLDs like `.co.tz`)
  for (const base of configuredBaseDomains) {
    if (hostname === base || hostname.endsWith(`.${base}`)) {
      matchedBaseDomain = base;
      break;
    }
  }

  // Match against platform cloud preview hosts (Vercel, Netlify, Render)
  if (!matchedBaseDomain) {
    for (const hostDomain of PLATFORM_HOST_DOMAINS) {
      if (hostname === hostDomain || hostname.endsWith(`.${hostDomain}`)) {
        matchedBaseDomain = hostDomain;
        break;
      }
    }
  }

  // Custom Tenant Domain fallback (e.g. `schoolname.edu.tz`)
  if (!matchedBaseDomain) {
    isCustomDomain = true;
    const parts = hostname.split('.');
    // Multi-part TLD check heuristic (e.g. `.co.tz`, `.ac.tz`)
    if (parts.length > 2 && parts[parts.length - 2].length <= 3) {
      matchedBaseDomain = parts.slice(-3).join('.');
    } else {
      matchedBaseDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;
    }
  }

  // Extract raw subdomains preceding matched base domain
  const subdomainsPart = hostname === matchedBaseDomain ? '' : hostname.replace(new RegExp(`\\.${matchedBaseDomain.replace(/\./g, '\\.')}$`), '');
  const rawSubdomains = subdomainsPart ? subdomainsPart.split('.').filter(Boolean) : [];

  // Stage extraction
  let stage: AppStage = 'prod';
  let activeStageKeyword: CustomStage | null = null;

  for (const nonProdStage of NON_PROD_STAGES) {
    if (rawSubdomains.includes(nonProdStage)) {
      stage = nonProdStage;
      activeStageKeyword = nonProdStage;
      break;
    }
  }

  const subdomains = rawSubdomains.filter((sub) => !NON_PROD_STAGES.includes(sub as CustomStage));

  // Handle Root project domains on Cloud Platforms (e.g., `eduasas.vercel.app` -> Root App, NOT tenant "eduasas")
  let tenant: string | null = subdomains.length > 0 ? subdomains[0] : null;

  if (
    tenant &&
    (PLATFORM_HOST_DOMAINS as readonly string[]).includes(matchedBaseDomain) &&
    subdomains.length === 1
  ) {
    tenant = null;
  }

  const domainWithStage = activeStageKeyword
    ? `${activeStageKeyword}.${matchedBaseDomain}`
    : matchedBaseDomain;

  return {
    stage,
    tenant,
    subdomains: tenant ? subdomains : [],
    isRootDomain: tenant === null,
    domain: matchedBaseDomain,
    domainWithStage,
    port,
    protocol: detectedProtocol,
    hostWithPort,
    hostname,
    origin,
    rootOrigin: buildRootOrigin(matchedBaseDomain),
    isCustomDomain,
    isIpAddress: false,
  };
}

/**
 * Internal helper to construct a standardized root RequestContext fallback object.
 * 
 * @param {string} domain - Base domain name.
 * @param {string} port - Network port string.
 * @param {'http:' | 'https:'} protocol - Network protocol.
 * @returns {RequestContext} Default root context.
 */
function createRootContext(domain: string, port: string, protocol: 'http:' | 'https:'): RequestContext {
  const hostWithPort = port ? `${domain}:${port}` : domain;
  const origin = `${protocol}//${hostWithPort}`;

  return {
    stage: 'prod',
    tenant: null,
    subdomains: [],
    isRootDomain: true,
    domain,
    domainWithStage: domain,
    port,
    protocol,
    hostWithPort,
    hostname: domain,
    origin,
    rootOrigin: origin,
    isCustomDomain: false,
    isIpAddress: false,
  };
}