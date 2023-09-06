import { SwapPageContext } from "@/src/contexts";
import { useContext, useMemo } from "react";

export function useSwapPage() {
  const stateSwapPage = useContext(SwapPageContext);
  return useMemo(() => stateSwapPage, [stateSwapPage]);
}
