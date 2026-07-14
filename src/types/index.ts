export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface DivisionItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accent: "violet" | "cyan" | "teal";
  logo: string;
}

export interface JourneyStep {
  id: string;
  index: string;
  year: string;
  title: string;
  description: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  event: string;
  year: string;
  tier: "gold" | "silver" | "bronze" | "special";
}

export interface StructureMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
}

export interface StructureTier {
  id: string;
  label: string;
  members: StructureMember[];
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export type MarqueeRow = string[];