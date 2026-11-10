/** Trip types, FAQs and reviews. `verified: false` is a PLACEHOLDER for the owner to confirm. */
import type { SceneName } from '../lib/scene';

export const tripTypes: { slug: 'honeymoon' | 'family' | 'group'; label: string; accent: string; intro: string; scene: SceneName; photo: string; focus: string }[] = [
  { slug: 'honeymoon', label: 'Honeymoon', accent: 'just the two of you', intro: 'Quiet stays, private transfers and days planned around you both.', scene: 'maldives', photo: '/trips/honeymoon.webp', focus: '50% 22%' },
  { slug: 'family', label: 'Family', accent: 'an easy pace for all ages', intro: 'Sensible travel times and trips that work for children and grandparents.', scene: 'sri-lanka', photo: '/trips/family.webp', focus: '47% 50%' },
  { slug: 'group', label: 'Group', accent: 'friends, clubs and teams', intro: 'One plan and clear per-person costs, so the organiser isn\'t chasing everyone.', scene: 'philippines', photo: '/trips/group.webp', focus: '48% 50%' },
];

export const faqs = [
  { q: 'How do I start planning a trip?', a: 'Message us on WhatsApp, call us, or use the trip planner. Tell us where you\'d like to go, roughly when, and how many of you are travelling.', verified: true },
  { q: 'Where are you based?', a: 'Our office is at CHS Towers, 4th Floor, Mount Road, Chennai.', verified: true },
  { q: 'Can I change an itinerary?', a: 'Yes. The trips here are starting points, and we can shape the route, pace and length with you.', verified: false },
  { q: 'Do your packages include flights?', a: 'Yes, return flights are included. Each tour page lists exactly what is and isn\'t included.', verified: true },
  { q: 'What do I need before travelling abroad?', a: 'A valid passport first, then any visa your destination asks for. See our going abroad page, and check your passport\'s expiry date early.', verified: false },
  { q: 'Do you handle visas?', a: 'Yes. We handle the visa process and tell you what we need from you. The final decision always rests with the authorities, so no travel company can promise an approval.', verified: true },
  { q: 'Can I pay in Indian rupees?', a: 'Ask us when you plan your trip, and we\'ll explain how payment works and what taxes apply.', verified: false },
  { q: 'What is your cancellation policy?', a: 'See our cancellation and refund page, or ask us before you book.', verified: false },
];

export const legal = {
  privacy: { title: 'Privacy', body: ['When you send an enquiry we collect your name, WhatsApp number, travel details and, if you give it, your email address.', 'We use these details only to reply to you and plan your trip.', 'To ask us to change or delete your details, call or message us using the numbers on this site.'] },
  terms: { title: 'Terms', body: ['Our booking terms are being finalised. Please ask us for the terms that apply before you book.'] },
  cancellation: { title: 'Cancellation and refund', body: ['Our cancellation and refund terms are being finalised. Please ask us for the terms that apply before you pay.'] },
};
