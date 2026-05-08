const LEAD_COOLDOWN_MS = 5 * 60 * 1000;
const KEY_PREFIX = "stock-finder:recent-lead:";

export const getRecentLead = (itemId: string) => {
  const timestamp = Number(sessionStorage.getItem(`${KEY_PREFIX}${itemId}`));
  if (!timestamp) {
    return null;
  }

  const ageMs = Date.now() - timestamp;
  if (ageMs > LEAD_COOLDOWN_MS) {
    sessionStorage.removeItem(`${KEY_PREFIX}${itemId}`);
    return null;
  }

  return { timestamp, ageMs };
};

export const markRecentLead = (itemId: string) => {
  sessionStorage.setItem(`${KEY_PREFIX}${itemId}`, String(Date.now()));
};
