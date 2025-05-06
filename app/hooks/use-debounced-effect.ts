import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function useDebouncedEffect(
  func: () => void,
  ms: number,
  deps: any[],
) {
  const debounced = useDebouncedCallback(func, ms);
  useEffect(debounced, [deps]);
}
