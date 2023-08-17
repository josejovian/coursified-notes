import { createContext } from "react";
import { StateType } from "../type";

export const SwapPageContext = createContext<StateType<boolean>>([
  false,
  () => {},
]);
