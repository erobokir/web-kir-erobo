export type PrestasiTier = "gold" | "silver" | "bronze" | "special";

export interface PrestasiItem {
  id: string;
  title: string;
  event: string;
  year: string;
  tier: PrestasiTier;
  created_at: string;
}

export interface PrestasiData {
  id: string;
  items: PrestasiItem[];
  updated_at: string;
}