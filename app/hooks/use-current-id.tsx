import { createContext, ReactNode, useContext, useState } from "react";

export const CurrentIdContext = createContext<string | null>(null);

const useCurrentId = () => useContext(CurrentIdContext);
export default useCurrentId;
