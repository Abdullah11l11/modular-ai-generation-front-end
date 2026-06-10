import { useCallback, useSyncExternalStore } from "react";

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => {
    document.documentElement.classList.toggle("dark");
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  return { isDark, toggle, setTheme };
}
