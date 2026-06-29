import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { WRITING_CATEGORIES } from './lib/categories';


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