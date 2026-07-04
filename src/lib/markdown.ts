import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

// Inline markdown for short teasers/descriptions in list views (the stream,
// link notes, blog blurbs). renderInline emits only inline markup — links,
// emphasis, code — with no wrapping <p>, so the result drops straight into an
// existing paragraph. Sanitised, so it's safe to hand to set:html.
const md = new MarkdownIt();

export function inlineMarkdown(text: string): string {
  return sanitizeHtml(md.renderInline(text), {
    allowedTags: ['a', 'em', 'strong', 'b', 'i', 'code', 'del', 's', 'sub', 'sup', 'br'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
