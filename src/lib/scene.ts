/** Destination photos. Files are made by `npm run photos` from the Images folder. */
export type SceneName = 'philippines' | 'bali' | 'maldives' | 'sri-lanka';

/** `focus` keeps the main subject in view when a photo is cropped wide. */
export const photos: Record<SceneName, { focus: string; alt: string }> = {
  philippines: { focus: '45% 42%', alt: 'Limestone islands and clear turquoise water in the Philippines' },
  bali: { focus: '30% 50%', alt: 'A tiered temple on a calm lake in Bali at sunrise' },
  maldives: { focus: '75% 58%', alt: 'Overwater villas above turquoise water in the Maldives' },
  'sri-lanka': { focus: '55% 34%', alt: 'An elephant grazing below a great rock fortress in Sri Lanka' },
};
