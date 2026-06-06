export interface SfCategory {
  id: string;
  slug: string;
  name: string;
  parent: string | null;
  imageUrl: string | null;
}

export interface SfCatalogItem {
  id: string;
  name: string;
  category: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface SfShopImage {
  id: string;
  position: number;
  isPrimary: boolean;
  width: number;
  height: number;
  url: string | null;
  createdAt: string;
}

export interface SfShop {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  isVerified: boolean;
  ratingAvg: string;
  lat: number | null;
  lng: number | null;
  images: SfShopImage[];
  createdAt: string;
  updatedAt: string;
}

export interface SfShopWithDistance extends SfShop {
  distanceM: number | null;
}

export interface SfItemImage {
  id: string;
  position: number;
  isPrimary: boolean;
  variantsReady: boolean;
  width: number;
  height: number;
  url: string | null;
  thumbUrl: string | null;
  cardUrl: string | null;
  createdAt: string;
}

export type SfCondition = "new" | "open_box" | "used";
export type SfItemStatus = "active" | "sold" | "hidden";

export interface SfItem {
  id: string;
  shop: string;
  shopName: string;
  category: string | null;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  price: string | null;
  condition: SfCondition;
  status: SfItemStatus;
  staleAt: string;
  images: SfItemImage[];
  createdAt: string;
  updatedAt: string;
}

export interface SfSearchItem extends SfItem {
  distanceM: number | null;
  shopLat: number | null;
  shopLng: number | null;
  shopPhone: string;
  categorySlug: string | null;
}

export interface SfLead {
  id: string;
  buyer: string;
  buyerName: string;
  buyerPhone: string | null;
  shop: string;
  item: string | null;
  itemName: string | null;
  message: string;
  contactedAt: string | null;
  createdAt: string;
}

export interface SfOtpVerifyResponse {
  token: string;
  expiresAt: string;
  user: { id: number; phone: string };
  hasShop: boolean;
}

export interface SfPresignResponse {
  url: string;
  key: string;
  expiresIn: number;
  headers: Record<string, string>;
  bucket: string;
}

export interface SfAutocompleteSuggestion {
  name: string;
  thumbnail: string | null;
  type: "item" | "category";
}

export type SfSort = "distance" | "recent" | "price";

export interface SfSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SfSort;
}

export interface SfSearchPage {
  items: SfSearchItem[];
  nextCursor: string | null;
}

export interface SfCreateShopPayload {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  city?: string;
  pincode?: string;
  address?: string;
}

export interface SfCreateItemPayload {
  name: string;
  description?: string;
  sku?: string;
  quantity: number;
  price?: string | null;
  condition?: SfCondition;
  category?: string | null;
}

export interface SfBulkUploadRowError {
  row: number;
  errors: Record<string, string[] | string>;
}

export interface SfBulkUploadItemsResponse {
  created: number;
  items: SfItem[];
  errors?: SfBulkUploadRowError[];
}

export interface SfCreateLeadPayload {
  shopId: string;
  itemId?: string | null;
  message: string;
  phone?: string;
  buyerName?: string;
}

export interface SfAnalytics {
  items: {
    active: number;
    sold: number;
    hidden: number;
    total: number;
    staleSoon: number;
  };
  leads: {
    total: number;
    last30Days: number;
    new: number;
  };
  leadsTrend: { date: string; count: number }[];
  topItems: { id: string; name: string; leadCount: number }[];
}

export interface SfShopReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SfShopReviewsResponse {
  reviews: SfShopReview[];
  ratingAvg: number;
  count: number;
}

export interface SfCreateReviewPayload {
  leadId: string;
  rating: number;
  comment?: string;
}

export interface SfCreateReportPayload {
  shopId?: string | null;
  itemId?: string | null;
  reason: string;
}

export interface SfConfirmImagePayload {
  key: string;
  width: number;
  height: number;
  isPrimary?: boolean;
}
