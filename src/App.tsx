/**
 * @file EduAsasApp.tsx
 * @description Main application entry point for EduAsas Multi-Tenant Platform.
 * Resolves request context dynamically using the domain utility and routes requests 
 * to Admin, Tenant Schools, or Public Landing Pages accordingly.
 */

import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { parseDomainAndTenant, RequestContext } from './lib/utils/domains';

import { MainRoutes } from './routes/MainRoutes';
import { AdminRoutes } from './routes/AdminRoutes';
import { SchoolRoutes } from './routes/SchoolRoutes';

export default function EduAsasApp() {
  /**
   * Resolves the current domain, stage, and tenant context safely on mount.
   */
  const context: RequestContext = useMemo(() => {
    try {
      // Tunaiacha utility ijichagulie window.location.href yenyewe kwa usalama zaidi
      return parseDomainAndTenant();
    } catch (error) {
      console.error('Error occurred while extracting the domain and tenant context:', error);
      
      // Fallback salama yenye fields zote zinazotakiwa na RequestContext interface
      const fallbackBase = 'eduasas.co.tz';
      return {
        stage: 'prod',
        tenant: null,
        subdomains: [],
        isRootDomain: true,
        domain: fallbackBase,
        domainWithStage: fallbackBase,
        port: '',
        protocol: 'https:',
        hostWithPort: fallbackBase,
        hostname: fallbackBase,
        origin: `https://${fallbackBase}`,
        rootOrigin: `https://${fallbackBase}`,
      };
    }
  }, []);

  // Log context kwenye mazingira ya development au local ili kurahisisha debugging
  if (context.stage === 'local' || import.meta.env.VITE_APP_STAGE === 'development') {
    console.debug('🌐 EduAsas Request Context:', context);
  }

  return (
    <BrowserRouter>
      {context.tenant === 'admin' ? (
        <AdminRoutes />
      ) : context.tenant ? (
        <SchoolRoutes />
      ) : (
        <MainRoutes />
      )}
    </BrowserRouter>
  );
}