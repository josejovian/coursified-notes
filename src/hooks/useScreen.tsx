import { useContext, useMemo } from "react";
import { ScreenContext } from "@/contexts";

export function useScreen() {
  const params = useContext(ScreenContext);
  return useMemo(() => params, [params]);
}
