import { useSystemListeners } from "@/lib/store";


export function SystemListener({ children }: { children: React.ReactNode }) {
  useSystemListeners();
  return <>{children}</>;
}