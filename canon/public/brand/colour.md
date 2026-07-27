---
id: brand-colour
title: Colour
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

These are the values the product actually ships, read from the live stylesheet.

```
accent          #AFC95B    muted lime
accent hover    #9DB84B
ink / dark      #0E0E0E    primary ink and dark surface
text muted      #9A9A9A
text sub        #6B6B6B
hairline        rgba(0, 0, 0, 0.08)
```

The accent is a muted lime, not an electric one. It was softened deliberately so
green fills stop glaring and dark text stays legible on top of them. An earlier
internal design note still carries the brighter `#D8FF3D`; the shipped value is
`#AFC95B` and that is the one to use. Where a document and the stylesheet
disagree, the stylesheet is what people actually see.

Use the accent for one thing per screen. A page with three lime elements has no
primary action, it has three competing ones.
