# CHS Tours: Design Direction


The owner supplied 10 reference designs. They are inspiration only: no layout, wording or asset is copied.

**The taste they share: a travel site that feels like a beautifully made product, with a human scrapbook warmth.**

| What the references share | Seen in | How CHS uses it |
|---|---|---|
| App-like controls: pill tabs, round icon buttons, steppers | Jet configurator, Roavia, AroundMe | Pill navigation, arrow buttons, and a trip planner that feels like a tool, not a form |
| Photography as the whole canvas, inside soft rounded frames | Roavia, AroundMe, split hero, Creaenergy | Full-width destination images in large-radius frames, floating on a muted background |
| Depth: type behind the subject, overlapping layers | Roavia, Creaenergy | Hero headline sits behind a cut-out subject (a traveller, boat or temple) |
| Very large, tight type with one contrasting accent | Roavia, "before takeoff", split hero | Big sans-serif headlines with one italic serif word |
| Muted grounds with a single vivid accent | Jet configurator, split hero, Creaenergy | Stone and fog neutrals; CHS red plays the part lime plays in the references |
| Tactile, centre-focused carousels with mixed card sizes | Oval destinations, stories, Popular row | Destination carousel and tour rows you can swipe |
| Handmade touches: tilted photos, handwriting, arrows | Whistler, Journal | "Planner's notes" scribbled beside photos |
| Rhythm of light and dark sections | Creaenergy, portfolio, menu overlay | Dark panels for "Why CHS" and the full-screen menu |

**Signature ideas for CHS**
1. **Trip Planner** (from the jet configurator): the page's tabs become Where → When → Who → Your trip. It's the same short form, made enjoyable, and ends in a pre-filled WhatsApp message.
2. **Itinerary stepper** (from the "Sections 1 2 3 4" bar and floorplan): day pills on tour pages switch the day, with a simple route strip showing the trip at a glance.
3. **Layered hero** (from Roavia): a headline behind a cut-out subject, in a rounded frame, with one clear action.
4. **Destination arches** (from the oval carousel): a centre-focused row of arch-shaped images. The centre item reveals a "from" price.
5. **Trip Stories** (from Web Stories): tall, tappable cards showing a trip in a few frames. They suit phones and can be shared on WhatsApp and Instagram.
6. **Planner's Notes** (from Whistler and Journal): tilted photos with handwritten tips on tour and About pages, which also shows a real person behind the trip.
7. **Full-screen menu** (from the dark overlay): huge words, destination images on either side.

**Starting design tokens (to refine in phase 2)**
- Grounds: Stone `#ECE8E1`, Fog `#D9DCDA`, Paper `#F7F5F1`
- Dark: Ink `#14171C`, Dusk navy `#2A3450`
- Tint: Sky slate `#93ABC3`
- Accent: CHS red `#EE2124`, the only vivid colour
- Type (self-hosted, free): Instrument Sans for headings and body, Instrument Serif Italic for accent words, Caveat for handwritten notes only
- Shape: 28–40px frame radius, full pills, 48px+ round icon buttons

**Motion:** this replaces the earlier "keep motion minimal" stance, with limits. Swipe carousels, gentle hover lift, shared-element page transitions and light hero parallax are in. Everything respects reduced-motion settings and works without JavaScript where possible.

**Where we deliberately differ from the references**
- **Proof:** no "500K+ customers" style numbers. That slot shows real facts such as the Chennai office and a named planner until verified figures exist.
- **Readability:** many references use pale, tiny text. CHS keeps 4.5:1 contrast and body text of at least 16px, including over photos.
- **Buttons:** white text on CHS red falls short of contrast for small labels, so main buttons are Ink pills with a red round arrow.
- **Performance:** no WebGL, video hero or 3D models. The journal's fanned pages are a later, CSS-only extra at most.
- **Mobile first:** every idea must work on a small phone. The layered hero and arches get simpler phone versions, and the WhatsApp/Call bar always stays visible.
- **Script fonts:** handwriting is decoration only, never needed to understand a price, step or term.

**Tone of voice:** warm, plain and specific, without phrases like "curated journeys" or "master architects".

**Pricing check:** the references lean premium and the earlier sample prices were mid-range. The look must suit real prices, so this gets settled once tours are confirmed.


