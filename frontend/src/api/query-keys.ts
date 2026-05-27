import type { SfSearchParams } from "./stock-finder/types";

export const QueryKeys = {
  // Todo List.
  todoList: ["/tasks"],
  // Datasets.
  datasets: ["/web-gis/datasets"],
  datasetDownload: (id: string) => [`/web-gis/datasets/${id}/download`],
  datasetTiles: (id: string) => [
    `/web-gis/datasets/${id}/tiles/{z}/{x}/{y}.png`,
  ],
  datasetVectorTiles: (id: string) => [
    `/web-gis/datasets/${id}/vector-tiles/{z}/{x}/{y}.mvt`,
  ],
  // Features.
  features: (datasetId: string) => [`/web-gis/features/?dataset=${datasetId}`],
  // Layers.
  layer: (id: string) => [`/web-gis/layers/${id}`],
  layers: ["/web-gis/layers"],
  // Notifications.
  notification: (id: string) => [`/notifications/${id}`],
  notifications: ["/notifications"],
  notificationsBulk: ["/notifications/bulk"],
  // URL Shortner.
  urls: ["/url-shortner/urls/"],
  // Chat.
  chatSessions: ["/ai/chat-sessions"],
  llms: ["/ai/llms"],
  // Processing jobs.
  processingJobs: ["/web-gis/processing"],
  processingTools: ["/web-gis/processing/tools"],
  // Merged terrain tiles (SRTM baseline + user DEMs composited).
  mergedTerrainTiles: ["/web-gis/terrain/tiles/{z}/{x}/{y}.png"],
  // Level Up characters.
  levelUpCharacters: ["/level-up/characters"],
  // Dead Stock.
  ownerProfile: ["owner-profile"] as const,
  referralCode: ["referral-code"] as const,
  stockFinder: {
    categories: ["stock-finder", "categories"] as const,
    myShop: ["stock-finder", "shops", "me"] as const,
    shop: (id: string) => ["stock-finder", "shops", id] as const,
    nearbyShops: (lat: number, lng: number, r: number) =>
      ["stock-finder", "shops", "nearby", lat, lng, r] as const,
    myItems: ["stock-finder", "items", "mine"] as const,
    item: (id: string) => ["stock-finder", "items", id] as const,
    search: (params: SfSearchParams) =>
      ["stock-finder", "search", params] as const,
    autocomplete: (q: string) => ["stock-finder", "autocomplete", q] as const,
    leadInbox: ["stock-finder", "leads", "inbox"] as const,
    analytics: ["stock-finder", "analytics"] as const,
    shopReviews: (id: string) => ["stock-finder", "shops", id, "reviews"] as const,
  },
};
