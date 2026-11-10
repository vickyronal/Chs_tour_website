import type { SceneName } from '../lib/scene';

export interface Destination {
  slug: string;
  name: string;
  scene: SceneName;
  /** Starting price per person in rupees; null shows "Price on request". */
  fromPrice: number | null;
  intro: string;
  /** True once the owner confirms CHS sells this country. */
  verified: boolean;
}

/** Confirmed by the owner on 2026-11-07. */
export const destinations: Destination[] = [
  { slug: 'philippines', name: 'Philippines', scene: 'philippines', fromPrice: null, intro: 'Limestone lagoons, island boats and warm, clear water.', verified: true },
  { slug: 'bali', name: 'Bali', scene: 'bali', fromPrice: null, intro: 'Rice terraces, sea temples and quiet beach days.', verified: true },
  { slug: 'maldives', name: 'Maldives', scene: 'maldives', fromPrice: null, intro: 'White sand, clear water and slow days on a single island.', verified: true },
  { slug: 'sri-lanka', name: 'Sri Lanka', scene: 'sri-lanka', fromPrice: null, intro: 'Old temples, misty tea hills and easy days by the sea.', verified: true },
];
