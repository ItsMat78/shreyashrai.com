import type { APIContext } from 'astro';
import { getAllTags, getTaggedEntries } from '../../../lib/content';
import { buildFeed } from '../../../lib/feed';
import { SITE_TITLE } from '../../../consts';

// A feed per tag, so someone can follow a single topic. One route per tag,
// enumerated from the same tag list the /tags index uses.
export async function getStaticPaths() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({ params: { tag } }));
}

export async function GET(context: APIContext) {
  const tag = context.params.tag!;
  const { tils, posts, links, quotes } = await getTaggedEntries(tag);
  return buildFeed(context, {
    title: `${SITE_TITLE} — #${tag}`,
    description: `Everything tagged “${tag}”.`,
    sources: [
      { entries: tils, prefix: 'til' },
      { entries: posts, prefix: 'blog' },
      { entries: links, prefix: 'links' },
      { entries: quotes, prefix: 'quotes' },
    ],
  });
}
