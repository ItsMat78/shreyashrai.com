---
title: How this site works
date: 2026-07-03
description: A static, Markdown-driven site built with Astro, why it exists and how publishing a new post is just adding a file.
tags: ["BLOGGING", "astro"]
---

This site is a running log of things I learn and the projects I build. The most
important property it has is that publishing is frictionless: writing a new post
is exactly as much work as creating a Markdown file and pushing to git. No CMS,
no dashboard, no database.

## The stack

It's built with [Astro](https://astro.build) as a fully static site. Every TIL
and every post is a Markdown file with a little frontmatter block at the top —
a title, a date, some tags. Astro reads those files at build time, validates the
frontmatter against a schema, and turns each one into a page. The output is
plain HTML and CSS with essentially no client-side JavaScript, so pages load
instantly and there's nothing to break.

There are two kinds of writing here:

- **TILs** ("Today I Learned"), short, dated, tagged notes. This is the heart
  of the site and where most of the activity is.
- **Posts**, longer writeups and essays, like this one.

## Why no JavaScript framework

Because the content is the product. A personal site that's mostly text doesn't
need a rendering framework shipped to the browser; it needs good typography, a
readable column width, and fast loads. Keeping the build static means the whole
site is a folder of HTML files that any host can serve, and there's no runtime
to patch or attack.

## Following along

Everything is available as a feed. There's a
[combined feed](/rss.xml) of TILs and posts, and if you only want one or the
other, each has its own. Feeds carry the full text, so you can read without ever
visiting the site that's the point of them.

If you want to see how the sausage is made, the source is on
[GitHub](https://github.com/ItsMat78/shreyashrai.com).
