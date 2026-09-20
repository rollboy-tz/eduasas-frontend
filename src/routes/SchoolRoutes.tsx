import { useRoutes } from "react-router-dom";

import { SchoolConsumerPage, SchoolNotFound } from "@/pages/school";
import {
  ProtectedRoutesLayout,
  SchoolSubdomainGuard
} from "@/layouts";
import { SchoolContextRoutes } from "./SchoolcontextsRoutes";

export function SchoolRoutes() {
  return useRoutes([
    {
      element: <SchoolSubdomainGuard />,
      children: [
        {
          path: "/school-not-found",
          element: <SchoolNotFound />
        },
        { 
          path: "/consumer",
          element: <SchoolConsumerPage />
        },
        {
          element: <ProtectedRoutesLayout />,
          children: [
            ...SchoolContextRoutes,
          ],
        },
      ],
    },
  ]);
}