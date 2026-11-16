# Supplied page templates — local implementation

The seven image files supplied from `kl website templates` are the layout and English copy source. `public/images/template-*.jpg` contains direct rectangular photo crops from those references; portraits were not regenerated. The source images are low-resolution flattened mockups, so extracted photographs retain that resolution.

All seven primary pages use `template-pages.jsx`, the same Header and Footer, and the EN/FR/KR language switcher. Existing content archives, filtered searches, video consent, gallery keyboard controls, contact consent and CSRF remain connected. Template excerpts are page sections, not fabricated full articles or video URLs; their links open the relevant archive when there is no published source record. Phone, email, WhatsApp and social links use configured settings.

`database/data/template-pages.json` freezes this update's editable English, French and Kreol copy. The migration records the complete previous and updated pages in revision history. Restoring a revision retains the existing unpublished-draft behavior. `pages.json` supplies the matching defaults for fresh installs. Legal pages are unchanged.

Kreol translations are prepared with `status=review` and `reviewed=false`. They remain hidden from the public page API and excluded from indexing until the existing human-review steps are completed. French and Kreol translations need owner language review; no human approval is implied by this implementation.