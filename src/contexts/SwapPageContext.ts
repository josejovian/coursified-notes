import { createContext } from "react";
import { StateType } from "../types";

export const SwapPageContext = createContext<StateType<boolean>>([
  false,
  () => {},
]);
