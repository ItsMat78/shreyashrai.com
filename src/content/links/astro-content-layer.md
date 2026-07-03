---
title: "Astro's Content Layer API"
url: "https://docs.astro.build/en/guides/content-collections/"
date: 2026-06-28
tags: ["astro", "meta"]
---

The `glob()` loader plus Zod schemas are what make every TIL, post, link, and
quote on this site type-checked at build — a malformed frontmatter block fails
`astro build` instead of shipping a broken page. Worth a read if you run any
kind of content site.
