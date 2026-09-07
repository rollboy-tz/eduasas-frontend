import { useRoutes } from 'react-router-dom';
import { LandingRoutes } from '@/pages/main/landing';
import { AuthRoutes } from "@/pages/main/auth";
import { HomeRoutes } from "@/pages/main/home";



export function MainRoutes() {
  return (
    useRoutes([
      ...LandingRoutes,
      ...AuthRoutes,
      ...HomeRoutes,
    ])
  );
}