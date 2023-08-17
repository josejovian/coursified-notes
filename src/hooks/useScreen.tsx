import { ScreenContext } from "@/src/contexts";
import { useContext, useMemo } from "react";

export function useScreen() {
  const params = useContext(ScreenContext);
  return useMemo(() => params, [params]);
}
