import { useCallback, useSyncExternalStore } from 'react';

export const THEME_STORAGE_KEY = 'mgf.theme';

function getSnapshot(): boolean {
  return document.documentElement.classList.contains('dark');
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // localStorage may be unavailable (private mode); theme still works for the session.
  }
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => {
    applyTheme(!document.documentElement.classList.contains('dark'));
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    applyTheme(dark);
  }, []);

  return { isDark, toggle, setTheme };
}
