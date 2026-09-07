/**
 * @fileoverview Public School Profile Context Provider
 * @description 
 * ### ARCHITECTURE OVERVIEW:
 * This provider is strictly decoupled from user sessions, authentication, and RBAC security. 
 * It serves as a lightweight, **public-facing metadata layer** whose primary responsibility is 
 * to inject and distribute foundational school branding and profile information (e.g., school name, logo, 
 * location, and subdomain) across public layouts, headers, and landing views.
 * 
 * It acts as the frontline confirmation that a valid school profile exists for the requested subdomain.
 * 
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0-Public
 */

import React, { createContext, useContext, JSX } from "react";

/**
 * @type SchoolProfile
 * @description Represents the public-facing metadata and branding profile of a school.
 */
export type SchoolProfile = {
  /** Unique universal identifier of the school. */
  schoolId: string;
  /** Official registered name of the school. */
  name: string;
  /** Short or preferred display name for UI rendering. */
  displayName: string;
  /** Category type of the school (e.g., PRIMARY, SECONDARY, HIGH_SCHOOL). */
  schoolType: string;
  /** Geographic breakdown of the school's physical location. */
  location: {
    region: string | null;
    district: string | null;
    ward: string | null;
    address: string | null;
  };
  /** Public contact channels. */
  contacts: {
    email: string | null;
    phone: string | null;
  };
  /** Visual branding assets. */
  branding: {
    /** URL pointing to the school's official logo asset. */
    logoUrl: string | null;
  };
};

/**
 * @interface SchoolProfileProviderType
 * @description Contract defining the Public School Context values exposed to downstream components.
 */
export type SchoolProfileProviderType = {
  /** The public profile data of the active school. */
  school: SchoolProfile;
  /** The subdomain slug associated with this school workspace. */
  subdomain: string;
};

const SchoolProfileProvider = createContext<SchoolProfileProviderType | undefined>(undefined);

/**
 * @function PublicSchoolProvider
 * @description
 * React Context Provider component that wraps public layout trees to make school metadata 
 * and subdomain identifiers universally accessible to child components.
 * 
 * @param {Object} props - Component properties.
 * @param {SchoolProfile} props.school - The resolved school profile object.
 * @param {string} props.subdomain - The active subdomain slug.
 * @param {React.ReactNode} props.children - Child components requiring public school metadata.
 * @returns {JSX.Element} The rendered public context provider wrapper.
 */
export const PublicSchoolProvider: React.FC<{
  school: SchoolProfile;
  subdomain: string;
  children: React.ReactNode;
}> = ({ school, subdomain, children }): JSX.Element => {
  return (
    <SchoolProfileProvider.Provider value={{ school, subdomain }}>
      {children}
    </SchoolProfileProvider.Provider>
  );
};

/**
 * @hook usePublicSchool
 * @description
 * Custom React hook to consume public school profile metadata and subdomain strings.
 * Completely safe for unauthenticated public layouts and landing pages.
 * 
 * @returns {SchoolProfileProviderType} The active public school context values.
 * @throws {Error} Thrown if executed outside of an active `PublicSchoolProvider` boundary.
 * 
 * @example
 * ```tsx
 * const { school, subdomain } = usePublicSchool();
 * 
 * return (
 *   <header>
 *     <img src={school.branding.logoUrl} alt={school.displayName} />
 *     <h1>{school.displayName} ({subdomain})</h1>
 *   </header>
 * );
 * ```
 */
export const useSchoolProfile = (): SchoolProfileProviderType => {
  const context = useContext(SchoolProfileProvider);
  if (!context) {
    throw new Error("Architecture Violation: usePublicSchool() must be executed strictly within a PublicSchoolProvider or SchoolSubdomainLayout scope.");
  }
  return context;
};