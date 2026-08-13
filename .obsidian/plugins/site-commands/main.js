/*
 * Site Commands — companion plugin for the Shreyashrai theme.
 * Adds editor commands that show up in Obsidian's core "Slash commands" menu:
 *
 *   /figure   → inserts <figure><img …><figcaption></figcaption></figure>
 *   /til      → fills an empty note with the TIL frontmatter template
 *   /blog     → fills an empty note with the Writing (blog) template
 *   /link     → fills an empty note with the Link template
 *   /quote    → fills an empty note with the Quote template
 *   /project  → fills an empty note with the Project template
 *
 * Templates mirror the site's authoring guide exactly, so a note drafted in
 * Obsidian can be dropped straight into src/content/<type>/ and pass
 * `astro build` frontmatter validation.
 */

const { Plugin, Notice } = require('obsidian');

function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/* "size-t-underflow" / "my_note" → "Size t underflow" — a starting point to edit */
function titleFromBasename(basename) {
  const words = basename.replace(/[-_]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : '';
}

const TEMPLATES = {
  til: (title) => `---
title: "${title}"
date: ${today()}
tags: []
---

`,

  blog: (title) => `---
title: "${title}"
date: ${today()}
description: ""
tags: []
---

`,

  link: (title) => `---
title: "${title}"
url: ""
date: ${today()}
tags: []
via: ""            # optional — delete if unused
viaUrl: ""         # optional — delete if unused
---

`,

  quote: () => `---
date: ${today()}
source: ""         # optional — delete if unused
sourceUrl: ""      # optional — delete if unused
tags: []
via: ""            # optional — delete if unused
viaUrl: ""         # optional — delete if unused
---

"`,

  project: (title) => `---
title: "${title}"
blurb: ""
outcome: ""
tech: []
order: 1
cover: /images/${'PLACEHOLDER'}.png       # optional — delete if unused
headerArt: /header/${'PLACEHOLDER'}.png   # optional — delete if unused
live: ""           # optional — delete if unused
source: ""         # optional — delete if unused
---

`,
};

const FIGURE_SNIPPET = `<figure>
  <img src="/images/" alt="" width="" height="">
  <figcaption></figcaption>
</figure>`;

module.exports = class SiteCommandsPlugin extends Plugin {
  onload() {
    /* ------------------------------ /figure ------------------------------ */
    this.addCommand({
      id: 'insert-figure',
      name: 'Figure — insert semantic image block',
      editorCallback: (editor) => {
        const from = editor.getCursor();
        editor.replaceRange(FIGURE_SNIPPET, from);
        // Park the cursor inside src="/images/|"
        editor.setCursor({ line: from.line + 1, ch: 19 });
      },
    });
	
  /* Preview-only remap: /images/… and /header/… → public/… in the vault */
const SITE_PREFIXES = ['/images/', '/header/'];

this.registerMarkdownPostProcessor((el) => {
  el.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || !SITE_PREFIXES.some((p) => src.startsWith(p))) return;

    const vaultPath = 'public' + src;   // /images/img.png → public/images/img.png
    if (this.app.vault.getAbstractFileByPath(vaultPath)) {
      img.src = this.app.vault.adapter.getResourcePath(vaultPath);
    } else {
      img.alt = (img.alt || '') + ' [missing: ' + vaultPath + ']';
    }
  });
});


    /* ----------------------- /til /blog /link etc. ----------------------- */
    const entries = [
      ['til', 'TIL — fill empty note'],
      ['blog', 'Blog — fill empty note'],
      ['link', 'Link — fill empty note'],
      ['quote', 'Quote — fill empty note'],
      ['project', 'Project — fill empty note'],
    ];

    for (const [key, name] of entries) {
      this.addCommand({
        id: `new-${key}`,
        name,
        editorCallback: (editor, ctx) => {
          if (editor.getValue().trim().length > 0) {
            new Notice(
              `This note isn't empty — the ${key} template only fills blank notes.`
            );
            return;
          }
          const file = ctx.file;
          const title = file ? titleFromBasename(file.basename) : '';
          let body = TEMPLATES[key](title);

          if (key === 'project' && file) {
            body = body.replaceAll('PLACEHOLDER', file.basename);
          }

          editor.setValue(body);
          // Cursor at the end, ready to write
          const last = editor.lastLine();
          editor.setCursor({ line: last, ch: editor.getLine(last).length });
        },
      });
    }
  }
};
