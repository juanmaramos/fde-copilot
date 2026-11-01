export function getBrowserStorage(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

// Navigation preferences are optional in a sandboxed host. Business records
// use the repository, which reports failed reads and writes.
export function readSessionValue(key: string): string | null {
  try {
    return getBrowserStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeSessionValue(key: string, value: string | null): void {
  try {
    const storage = getBrowserStorage();
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {
    /* Losing a navigation preference must not prevent viewing the engagement. */
  }
}
