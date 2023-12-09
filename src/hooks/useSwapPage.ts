import { useContext, useMemo } from "react";
import { SwapPageContext } from "@/contexts";

export function useSwapPage() {
  const stateSwapPage = useContext(SwapPageContext);
  return useMemo(() => stateSwapPage, [stateSwapPage]);
}
