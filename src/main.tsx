import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import EduAsasApp from './App';
import './index.css';

// Core application providers and components
import { EduToaster } from '@/components/elements';
import { AppFeedbackModal, AppConfirmModal } from '@/components/modals';
import { SystemListener, ThemeProvider } from './shared/providers';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('eduasas-app-contents')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <SystemListener>
          <EduAsasApp />
          
          {/* System modals and toasts */}
          <AppFeedbackModal />
          <AppConfirmModal />
          <EduToaster />

          {/* DevTools enabled only in development */}
          <ReactQueryDevtools initialIsOpen={false} />
        </SystemListener>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);