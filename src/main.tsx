import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import EduAsasApp from './App';
import './index.css';

// Providers na UI Components kutoka kwenye mradi wako
import { EduToaster } from '@/components/elements';
import { AppFeedbackModal, AppConfirmModal } from '@/components/modals';

// Sanidi Query Client ya TanStack
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dakika 5
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('eduasas-app-contents')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <EduAsasApp />
        
        {/* Modals na Toasters za kimfumo */}
        <AppFeedbackModal />
        <AppConfirmModal />
        <EduToaster />

        {/* Devtools itaonekana kwenye development pekee */}
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);