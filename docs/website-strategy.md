# CHS Tours: Website Strategy

## Context

CHS Tours needs a website that turns visitors into qualified travel enquiries. The working folder (`Landing page chs 3`) is empty. Two earlier builds sit beside it in `~/Documents` and were reviewed for reuse.

Decisions confirmed by the owner:

| Decision | Choice |
|---|---|
| Offer | International only: Philippines, Bali, Maldives, Sri Lanka, with flights included and visas handled (confirmed 2026-11-07) |
| Starting point | Fresh build and fresh look; keep the logo and business content |
| Enquiry flow | WhatsApp first, short form as backup; form leads go to email and Google Sheets |
| Confirmed for publishing | Contact details, the four countries, visa handling, included flights |

The brief stopped after section 1, so anything beyond it is not reflected here.

**The main constraint:** the experience claims, ratings, reviews, itineraries, prices and policies from the earlier builds are unconfirmed. None of them go live unless the owner verifies them.


## 1. Business strategy

**Goal:** more qualified enquiries, not more traffic. A qualified enquiry has a destination, a rough month, a group size and a reachable WhatsApp number.

**Positioning (draft, to confirm with the owner):** a Chennai-based international travel planner, where one real person plans your trip abroad with you on WhatsApp, from first message to safe return.
Going abroad is where people most want someone to call: visas, unfamiliar places and larger payments. Personal service from a named local team is something large booking portals can't easily match.

**Likely audiences (assumed, to confirm):**

| Audience | Main worry | What the site must show |
|---|---|---|
| Family planner | Safety, pace, value | Clear inclusions, child and elder-friendly notes |
| Honeymoon couple | "Will it feel special?" | Stays, photos, private transfers |
| Friends or group organiser | Coordinating people and budget | Per-person pricing, group enquiry |
| First-time international traveller (main audience) | Visas, money, getting stuck abroad | Step-by-step help, on-trip contact |

**Core trust problem:** people are paying a large sum in advance to a business they found online. So real people, a real office, a real phone number and clear terms matter more than visual effects.


## 2. Site structure

**At launch**
- Home
- Tours (filter by trip type and duration)
- Tour detail pages
- Destination pages, one per place CHS actually sells
- Trip-type pages: Honeymoon, Family, Group
- Going abroad: visas, passports, money and insurance guidance for first-timers (visa help only if CHS offers it; never promise approval)
- About (real team, real office)
- Contact
- FAQ
- Reviews (photo and video gallery; see section 12)
- Thank-you page (the conversion event fires here)
- Privacy, Terms, Cancellation and Refund

**After launch**
- Travel guides/blog
- Tamil versions of key pages, if the audience justifies it

**Launch catalogue:** 8–10 real packages CHS can deliver, rather than a long list of thin ones. The owner chooses the mix.


## 3. Key page plans

**Homepage order (the current order stays; the owner likes it)**
1. Layered hero in a rounded frame: clear promise and WhatsApp button
2. Destination arches, without the India / International switch
3. Featured packages with "from" prices, in a mixed-size swipe row
4. Trip types
5. Trip Planner (also explains how CHS works)
6. Why CHS: dark panel with real people, office and Planner's Notes
7. Reviews preview, linking to the new Reviews page (real ones only; hidden until they exist)
8. FAQ preview
9. Final call to action
10. Footer with full contact details

**Tour detail page order**
1. Full-frame image, title, duration, "from" price per person
2. Highlights
3. Itinerary stepper with day pills and route strip
4. Inclusions and exclusions
5. Stay type and transport
6. Planner's Notes and best time to go
7. FAQ
8. Related tours

The itinerary must also exist as plain text in the page, so search engines and screen readers can read every day.

On mobile, a sticky bar stays visible with WhatsApp and Call. Any custom request routes to the same enquiry flow.


## 4. Enquiry flow

- **Primary button:** "Plan on WhatsApp". The message is pre-filled with the tour the visitor is viewing.
- **Secondary:** Call, and the Trip Planner, which is the short form split into 4 quick steps.
- **Planner steps:** Where (destination) → When (travel month) → Who (travellers) → Your trip (name, WhatsApp number, optional note, consent checkbox). Email is optional. Selections are tap-based, it stays under a minute, and it can be pre-filled from a tour page.
- **Planner ending:** a trip summary with "Send on WhatsApp" as the main action and "Send to CHS" through the form route. Direct WhatsApp stays available at every step, so the planner is never a barrier.
- **Form delivery:** the site sends each lead to a server function with spam protection. That function emails CHS and adds a row to a Google Sheet.
- **Failure rule:** success shows only after the server confirms delivery. If delivery fails, the visitor sees an error and a WhatsApp button with their details filled in.
- **Lead tracking:** the Sheet records source, page, status and follow-up date, so "qualified" can be measured.


## 6. Technical approach

- **Framework:** Astro with TypeScript, for fast static pages that search engines read easily. Small interactive parts only: filters, Trip Planner, itinerary stepper, Stories viewer.
- **Motion and carousels:** CSS scroll-snap for swiping, Astro's View Transitions for page changes, and a small amount of plain JavaScript. No heavy animation library unless a real need appears.
- **Images:** Astro image optimisation with AVIF/WebP. Hero cut-outs are transparent files preloaded and kept small, as the largest item on the first screen.
- **Content:** tours and destinations in validated content files, so required fields such as price and inclusions can't be left out.
- **Styling:** CSS custom properties for design tokens.
- **Hosting:** Cloudflare Pages, with a Pages Function for the form and Turnstile for spam protection.
- **Domain and email:** a real domain and a business address (e.g. hello@yourdomain) replacing the personal Gmail currently used as the public address. The earlier builds also have that Gmail address in client-side code.

**Build layout (planned):** `src/content/tours/`, `src/content/destinations/`, `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/tokens.css`, `functions/api/enquiry.ts`, `public/brand/`.

### Reuse from earlier builds (`~/Documents/Landing page chs 2`)
| Item | Path | Note |
|---|---|---|
| Logo and favicon | `public/brand/*.svg` | Convert the "TOURS" text to outlines; it currently depends on a font being installed |
| Contact details | `src/data/toursData.js` (`companyDetails`) | Confirmed: phone/WhatsApp and address |
| Tour data shape | `src/data/toursData.js` (`toursData`) | Reuse the structure; the content is unverified |
| Rupee price formatting | `formatPrice` in `toursData.js` | Port as is |
| Pre-filled WhatsApp link | `createWhatsAppLink` in `EnquiryModal.jsx` | Port the pattern |

### Do not carry over
- **Lost-lead bug:** `EnquiryModal.jsx`, `ContactPage.jsx` and `HomePage.jsx` show success even when sending fails, and never check the response status. The visitor thinks they've enquired and CHS never hears about it.
- **Client-side form posting:** FormSubmit with the captcha off and the email address exposed.
- **Unconfirmed claims:** "12+ years", "99% five-star", "verified reviews", ratings, testimonials, named hotels, room upgrades, response-time promises.
- **Placeholder social links** pointing at generic homepages such as facebook.com.
- **Unsplash hotlinks:** replace with licensed, self-hosted, optimised images. The Ooty, Kerala and Goa images don't necessarily show those places.
- **Non-existent claims of service:** e.g. "inner-line permit" handling for the Nilgiris, which needs checking.


## 7. Search and growth

- **Local first:** claim and complete the Google Business Profile, which is also the honest source of real reviews.
- **Target searches:** "[country] tour package from Chennai", "international tour packages from Chennai", "international honeymoon packages from Chennai", "visa-free countries for Indians" style guides (final list checked against keyword data).
- **Structured data:** TravelAgency, TouristTrip, FAQPage. No review or rating markup until the reviews are real.
- **Basics:** unique titles and descriptions, sitemap, Open Graph images, alt text.


## 8. Measurement

Track with GA4 (with consent handling as legal advice requires):
- `whatsapp_click`, `call_click`, `form_submit_success`, `form_submit_error`
- Enquiry rate by page and traffic source
- Qualified enquiries and bookings, from the Sheet

Set targets after 30 days of real data rather than borrowed benchmarks. WhatsApp clicks are intent, not confirmed enquiries, so compare them with the Sheet and the team's chat count.


## 10. Delivery phases

1. **Strategy saved:** on approval, write this as `docs/website-strategy.md`, `docs/design-direction.md` and `docs/content-checklist.md` in the project. No code yet.
2. **Foundation:** Astro setup, design tokens, layout, pill navigation, full-screen menu, logo clean-up. Build the homepage hero and destination arches first, and review them with the owner on desktop and phone before going further.
3. **Enquiry system:** WhatsApp links, Trip Planner, server function, Sheet and email, failure handling.
4. **Pages:** Home, Tours, Tour detail with itinerary stepper, Destinations, trip types, About, Contact, FAQ, legal. Add Trip Stories and Planner's Notes once real content exists. Unconfirmed content is marked with a clear `PLACEHOLDER` and a check fails the production build if any remain.
5. **Launch prep:** SEO, analytics, performance and accessibility review, final content.
6. **Launch and learn:** go live, review 30 days of enquiry data, then improve.

Building can start from phase 2 with placeholders. Going live depends on the "Blocks launch" list.


## 11. Verification

- `npm run build` passes, and the placeholder check fails the build when any remain
- Submit the form live: lead reaches both email and Sheet
- Force the server function to fail: visitor sees an error and WhatsApp fallback, never success
- Spam protection blocks an automated submission
- WhatsApp links open with the correct tour pre-filled, on a real phone
- Trip Planner: complete it on a phone in under a minute; pre-fill works from a tour page; back and forward keep answers; it works by keyboard
- Carousels and stepper work by touch and keyboard; with reduced-motion on, animation stops and content stays usable
- Contrast check passes 4.5:1, including text over photos
- Side-by-side review against the references: same feel, no copied layouts or wording
- Lighthouse on mobile: 90+ for Performance, Accessibility, Best Practices, SEO
- Keyboard-only and screen reader pass through the form and navigation
- Test at 360px, tablet and desktop, in Chrome and Safari
- Structured data passes Google's Rich Results Test
- Final search of the built site for any unverified claim from section 6


## 12. Reviews page and homepage tweaks

**Why:** the owner likes the current homepage order and wants small tweaks, not a restructure. The Trip Sentence and other redesign ideas are dropped. They also want a Reviews page where photos and videos can be opened and played.

### Homepage tweaks
- Remove the India / International switch; show one row of country arches
- Add a Reviews preview to the existing reviews slot, with a "See all reviews" link
- Everything else stays in its current order

### Reviews page (`/reviews`)
**Layout:** a mixed-size masonry grid of photo and video tiles in the site's rounded-frame style, with a short heading.
- Video tiles show a poster image and a round play button.
- Each tile shows the traveller's first name, the trip and a short quote.
- Filter pills: All, Photos, Videos. Add country pills once there are enough reviews.
- Tapping a tile opens a full-screen viewer (`<dialog>`, like the menu). Photos show large; videos play with sound and normal controls. Next and previous work by swipe, arrow keys and buttons. Closing stops the video.
- A closing WhatsApp call to action.

**Performance:** videos load only when opened (`preload="none"`), and only one plays at a time. Files are compressed MP4s of about a minute with poster images.

**Real reviews only:**
- Each entry needs `verified: true` and a recorded note that the traveller gave permission.
- Until real reviews exist, the page shows clearly labelled sample tiles with illustrated placeholders, generic text such as "Traveller name" and no invented quotes, ratings or review counts. The launch check fails while any remain.
- If launch goes ahead with none, the page and nav link stay hidden. Reviews are not a launch blocker.

**Content model:** a `reviews` collection in `src/content.config.ts`: `type` (photo or video), `src`, `poster`, `name`, `trip`, `quote`, `permission`, `verified`. Files go in `public/reviews/`.

### Files
- **New:** `src/pages/reviews.astro`, `src/components/ReviewViewer.astro`, `src/content/reviews/`
- **Change:**
  - `src/pages/index.astro`: reviews preview from the collection
  - `src/components/Destinations.astro`: remove the switch
  - `src/components/Header.astro`, `Menu.astro`, `Footer.astro`: add a Reviews link
  - `src/data/content.ts`: remove the empty `reviews` array
  - `docs/content-checklist.md`: add customer photos, videos and written permission
- **Reuse:** `Menu.astro`'s dialog behaviour, `Notice.astro`, `FinalCta.astro`, `PageHero.astro`, and the filter pattern in `src/pages/tours/index.astro`

### Added verification
- A test video plays, pauses and stops on close on desktop and phone-sized screens
- No video data loads until a tile is opened
- Viewer: Esc closes, focus returns, arrow keys and swipe work
- Filter pills show the right tiles
- With no reviews, the homepage preview and nav link are hidden
- Re-run all section 11 checks, plus the launch check


## 13. International-only changes

**Why:** the owner confirmed CHS offers only international trips. Everything domestic on the current site must go, so nothing suggests CHS sells trips within India.

### Remove
- Ooty, Kerala and Goa: `src/content/tours/{ooty,kerala,goa}.json` and their entries in `src/data/destinations.ts`
- The India / International switch in `src/components/Destinations.astro` and the region filter in `src/pages/tours/index.astro`
- The `region` field in `src/content.config.ts`, `src/data/destinations.ts` and the tour files, as it's no longer needed
- The Kerala houseboat and palm scene in `src/components/Hero.astro`, plus the `hills` and `backwater` scenes in `src/lib/scene.ts` wherever they are used (`Menu.astro`, `src/data/content.ts`, `about.astro`)

### Change
- **Hero:** a new original illustrated scene that says "abroad", such as a plane window or a coastline with distant skyline, still layered with the headline. No real landmark is needed.
- **Wording:** "Holidays across India and abroad" becomes international-only in `Hero.astro`, `src/pages/index.astro` and `about.astro`. Destination page titles use "[country] holidays from Chennai".
- **Countries:** Philippines, Bali, Maldives and Sri Lanka are confirmed. Their tours stay marked as samples until CHS provides real itineraries and prices.
- **Tour pages:** add "Visa", "Flights from Chennai" and "Money" lines to the facts block, as new required fields in `src/content.config.ts`, so every trip answers the first-timer's main worries.
- **Going abroad page:** `src/pages/visa.astro` becomes `/going-abroad`, linked from the main navigation once CHS confirms what it offers. Guidance only, and never promise approval.
- **FAQ:** `src/data/content.ts` gains questions on passports, visas, flights and payment in Indian rupees, all unverified until CHS confirms.

### Now more important
- GST and TCS on overseas packages affect every price, so a CA should confirm how they're shown before any price goes live.
- Add to `docs/content-checklist.md`: the real country list, whether CHS handles visas, and whether packages include flights.

### After approval
- Update the saved memory about the offer, and update `docs/website-strategy.md` and `docs/design-direction.md`.

### Added verification
- A search of the built site finds no "India" trips, "domestic", Ooty, Kerala, Goa, Munnar or houseboat references
- Destination links, tour filters and the planner all work without the region field
- New tour fields fail the build if left out
Visual direction is in [design-direction.md](design-direction.md). Inputs needed from CHS are in [content-checklist.md](content-checklist.md).
