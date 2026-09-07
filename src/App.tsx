import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { parseDomainAndTenant, RequestContext } from './lib/utils/subdomains.utils';

import { MainRoutes } from './routes/MainRoutes';
import { AdminRoutes } from './routes/AdminRoutes';
import { SchoolRoutes } from './routes/SchoolRoutes';

export default function EduAsasApp() {
  const context: RequestContext = useMemo(() => {
    try {
      return parseDomainAndTenant(window.location.hostname);
    } catch (error) {
      console.error('Error ocurred while extracting the domain:', error);
      return {
        stage: 'prod',
        tenant: null,
        isRootDomain: true,
        domain: 'eduasas.co.tz',
      };
    }
  }, []);

  return (
    <BrowserRouter>
      {context.tenant === 'admin' ? (
        <AdminRoutes/>
      ) : context.tenant ? (
        <SchoolRoutes/>
      ) : (
        <MainRoutes/>
      )}
    </BrowserRouter>
  );
}