# Enquiry setup

The planner's "Send to CHS" button needs this before it can deliver. Until then it shows an error with a WhatsApp fallback, by design.

1. Create a Google Sheet with these columns: Date, Name, WhatsApp, Email, Where, When, Who, Tour, Note, Page, Source, Status, Follow-up.
2. In the Sheet, open Extensions → Apps Script, paste the code below, and set `SECRET` and `NOTIFY` (a business address).
3. Deploy → New deployment → Web app. Run as yourself; access: Anyone. Copy the URL.
4. In Cloudflare Pages, set `LEADS_WEBHOOK_URL`, `LEADS_WEBHOOK_SECRET` and `TURNSTILE_SECRET`, and set `PUBLIC_TURNSTILE_SITE_KEY` at build time.
5. Send a real test enquiry and confirm both the Sheet row and the email arrive.

```js
const SECRET = 'choose-a-long-random-value';
const NOTIFY = 'hello@yourdomain';

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.secret !== SECRET) return respond(false);
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), d.name, "'" + d.whatsapp, d.email, d.where, d.when, d.who, d.tour, d.note, d.page, d.source, 'New', '',
  ]);
  MailApp.sendEmail(NOTIFY, 'New enquiry: ' + d.name + ' - ' + d.where,
    [d.name, d.whatsapp, d.email, d.where, d.when, d.who, d.tour, d.note].filter(String).join('\n'));
  return respond(true);
}

function respond(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok })).setMimeType(ContentService.MimeType.JSON);
}
```
