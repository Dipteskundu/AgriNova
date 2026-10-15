type BrowserPreference<T extends string> = {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
  subscribe: (onChange: () => void) => () => void;
};

export function createBrowserPreference<T extends string>(
  key: string,
  fallback: T,
  isValue: (value: string | null) => value is T,
  getSystemFallback: () => T = () => fallback
): BrowserPreference<T> {
  const eventName = `agrinova:preference:${key}`;
  let memoryValue: T | null = null;

  const getSnapshot = () => {
    if (typeof window === "undefined") return fallback;
    try {
      const stored = localStorage.getItem(key);
      if (isValue(stored)) return stored;
    } catch {
      return memoryValue ?? getSystemFallback();
    }
    return memoryValue ?? getSystemFallback();
  };

  const subscribe = (onChange: () => void) => {
    if (typeof window === "undefined") return () => {};

    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        memoryValue = null;
        onChange();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(eventName, onChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(eventName, onChange);
    };
  };

  const set = (value: T) => {
    memoryValue = value;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Keep the in-memory preference when storage is unavailable.
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(eventName));
    }
  };

  return {
    getSnapshot,
    getServerSnapshot: () => fallback,
    set,
    subscribe,
  };
}
