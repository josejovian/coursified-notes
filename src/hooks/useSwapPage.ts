import { SwapPageContext } from "@/src/contexts";
import { useContext, useMemo } from "react";

export function useSwapPage() {
  const stateSwapPage = useContext(SwapPageContext);
  console.log("Something Changed!");
  console.log(stateSwapPage[0]);
  return useMemo(() => stateSwapPage, [stateSwapPage]);
}
