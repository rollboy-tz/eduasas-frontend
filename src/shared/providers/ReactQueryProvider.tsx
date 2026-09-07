/**
 * @fileoverview React Query Engine
 * @description Inasimamia Global Cache kwa ajili ya data zote za mbali (Remote Data).
 * Hii ndiyo "Brain" ya data fetching inayohakikisha app inakuwa fasta na haina stale data.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * ### ReactQueryProvider
 * Hii ni wrapper ya juu kabisa kwa ajili ya TanStack Query.
 * * * @features
 * - **StaleTime:** Data inakaa fresh kwa dakika 5 ili kupunguza mizigo ya API.
 * - **GC Time:** Garbage Collection inafuta cache baada ya dakika 10 ya kutotumika.
 * - **Auto-Refetch:** Imezimwa (`refetchOnWindowFocus: false`) ili kuzuia API call kila mtumiaji anapofungua window.
 * * * @example
 * <ReactQueryProvider>
 * <TenantProvider>{children}</TenantProvider>
 * </ReactQueryProvider>
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Tunatengeneza 'client' mpya mara moja tu wakati wa initialization ili kuzuia memory leaks.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10,   // 10 minutes cache lifespan
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} /> 
    </QueryClientProvider>
  );
}