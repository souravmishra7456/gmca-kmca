import { SITE_URL } from "@/lib/site";

const API_URL = process.env.API_URL || "http://localhost:5000";

export const revalidate = 3600;

export default async function sitemap() {
  if (!SITE_URL) return [];

  const staticRoutes = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    const response = await fetch(`${API_URL}/api/team-selections/public`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return staticRoutes;

    const { selections = [] } = await response.json();
    const scorecardRoutes = selections
      .filter((selection) => selection.type === "intra" && selection.scorecard)
      .map((selection) => ({
        url: `${SITE_URL}/scoreboard/${encodeURIComponent(selection.id)}`,
        lastModified: selection.scorecard.updatedAt || selection.matchDate,
        changeFrequency: selection.scorecard.status === "live" ? "hourly" : "daily",
        priority: 0.6,
      }));

    return [...staticRoutes, ...scorecardRoutes];
  } catch {
    return staticRoutes;
  }
}
