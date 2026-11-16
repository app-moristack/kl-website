# Administration review — 16 November 2026

Reviewed the administration UI in a separate local application using disposable SQLite data and temporary administrator/editor accounts. The regular local app uses MySQL; its data and existing administrator credentials were not used or changed by the walkthrough. No external email was sent.

## Browser workflows checked

- Administrator and editor first-sign-in authenticator enrolment, login, logout, and unauthenticated private-route rejection.
- Overview, Publications, Pages & sections, Media library, Staff & permissions, Enquiries, and Site settings at desktop and 390px phone widths. No JavaScript errors or document-level horizontal overflow.
- Photo upload and WebP conversion; PDF upload, staff download, and rejection of public access before attachment/publication.
- English-only parliamentary publication, missing-French exclusion, attached PDF, localized gallery caption/alt text, and future publication scheduling. Scheduled records and their PDFs remain unavailable publicly.
- Page editing, automatic draft status, stale-version rejection, rejection of unreviewed Kreol publication, and restoring earlier page copy as an unpublished draft.
- Publication archival and restoration as a draft with no publication date.
- Enquiry status updates, persisted contact settings, and rejection of insecure WhatsApp URLs.
- Staff invitation queuing, prevention of disabling the signed-in administrator, editor UI/API restrictions, and revocation of an active editor session after suspension.

## Issues fixed

- Translation approval invalidation relied on the browser. The server now resets review flags when translation copy or localized gallery captions change. Previously published translations return to draft; legal changes clear owner approval. Unchanged copy can be explicitly approved on a later save. No existing review approvals were set automatically.
- The page builder offered an unused homepage-design switch and hid images/links on template update cards. Removed the switch, exposed relevant fields, and aligned list labels with their actual page sections.
- The homepage introduction ignored its configured portrait. It now uses the image selected in the page builder. Milestone icons also use their configured values.
- A non-date update-card label could crash the public page. Such labels now render safely as text.
- Editors were offered restore buttons and legal-page editing actions that the server would reject. Those unavailable actions are no longer offered.
- Footer social URLs lacked administration settings. Added optional HTTPS settings for Facebook, Instagram, YouTube, and LinkedIn.
- The publication action now says Archive, matching its recoverable behavior.

## Verification

- 39 backend tests passed, with 194 assertions.
- 11 UI tests passed.
- Production frontend build passed.
- Composer audit and production npm audit reported no advisories.
- Local Docker rebuild and app health verified after the fixes.

Backend regression tests and the browser walkthrough used SQLite. The existing MySQL-backed local stack was rebuilt and health-checked; the walkthrough did not mutate its live editorial data. Staff activation/reset, replay protection, upload rejection, and legal/Kreol gates also have automated regression coverage.

## Remaining launch work

Real outgoing email delivery still needs a configured provider and a delivery test. Kreol and legal publication still require the existing human/owner review. Production domain, TLS, deployment, backup and restore verification remain outside this local review.