import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The three Writing categories settled in Phase 0. Add to this list later
// if the taxonomy grows; the enum keeps frontmatter honest at build time.
export const WRITING_CATEGORIES = ['Poetry', 'Reviews', 'Star Trek'] as const;

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(WRITING_CATEGORIES),
    draft: z.boolean().default(false),
  }),
});

// Lab stands apart from Writing — generative / interactive work.
// The Mesostic generator is its first entry; the actual island is ported in Phase 3.
const lab = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lab' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing, lab };
