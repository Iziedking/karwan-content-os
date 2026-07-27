---
id: brand-typography
title: Typography
status: live
visibility: public
audience: all
updated: 2026-07-27
capability: false
tags:
  - brand
  - tokens
sources:
  - url: https://karwan.site
    date: 2026-07-27
---

Three faces, each with one job.

**Display.** A neo-grotesque, weight 700, tracking `-0.02em`, line height `0.95`,
uppercase. Used for intent: page titles and section headings.

**Mono.** Uppercase, letterspaced, bracketed. Used for system metadata and
status, never for prose. This is what makes a Karwan surface read as an
instrument rather than a marketing page.

**Serif.** Reserved for the instrument-readout register on deal surfaces.

Numbers are always tabular. Any digit cluster that can change, a balance, an
amount, a countdown, sets `font-variant-numeric: tabular-nums` so it does not
jitter as it updates.

Fonts are self-hosted. Do not add a CDN font link.
