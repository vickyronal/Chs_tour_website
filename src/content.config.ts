import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tours = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tours' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    destination: z.string(),
    types: z.array(z.enum(['honeymoon', 'family', 'group'])).min(1),
    scene: z.enum(['philippines', 'bali', 'maldives', 'sri-lanka']),
    days: z.number().int().positive(),
    nights: z.number().int().nonnegative(),
    fromPrice: z.number().positive().nullable(),
    bestTime: z.string(),
    stay: z.string(),
    transport: z.string(),
    visa: z.string(),
    flights: z.string(),
    money: z.string(),
    route: z.array(z.string()).min(2),
    highlights: z.array(z.string()).min(3),
    itinerary: z.array(z.object({ day: z.number(), title: z.string(), description: z.string(), meals: z.string().optional() })).min(1),
    included: z.array(z.string()).min(1),
    excluded: z.array(z.string()).min(1),
    notes: z.array(z.string()).default([]), // Planner's Notes: real tips only
    featured: z.boolean().default(false),
    verified: z.boolean(), // false = PLACEHOLDER until the owner confirms it
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/reviews' }),
  schema: z.object({
    type: z.enum(['photo', 'video']),
    src: z.string().nullable(), // file in public/reviews/; null only for samples
    poster: z.string().nullable(),
    scene: z.enum(['philippines', 'bali', 'maldives', 'sri-lanka']).optional(), // sample artwork
    name: z.string(),
    trip: z.string(),
    quote: z.string(),
    permission: z.string(), // who agreed to publishing, how and when
    verified: z.boolean(), // false = PLACEHOLDER; real reviews only go live as true
  }).refine((r) => !r.verified || (r.src && (r.type === 'photo' || r.poster)), {
    message: 'A verified review needs its file, and a video needs a poster image',
  }),
});

export const collections = { tours, reviews };
