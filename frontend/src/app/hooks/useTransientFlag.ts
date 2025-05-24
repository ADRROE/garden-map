import { useEffect, useState } from "react";

export function useTransientFlag<T>(
  triggerValue: T,
  durationMs: number = 2000
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (triggerValue == null) return;

    setIsVisible(true);
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, durationMs);

    return () => clearTimeout(timeout);
  }, [triggerValue]);

  return isVisible;
}