export const DASHBOARD_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";
export const SYMPHONY_API_BASE = process.env.NEXT_PUBLIC_SYMPHONY_URL || "http://localhost:5055";

export const getApiUrl = (path: string) => {
  if (path.startsWith("/api/symphony")) {
    return `${SYMPHONY_API_BASE}${path.replace("/api", "")}`;
  }
  if (path.startsWith("/api/omnichat")) {
    // Symphony handles omnichat now or is it separate?
    // Based on the user's setup, it looks like Symphony might be handling it.
    // Let's assume it goes to Symphony for now if it's the new setup.
    return `${SYMPHONY_API_BASE}${path.replace("/api", "")}`;
  }
  return `${DASHBOARD_API_BASE}${path}`;
};
