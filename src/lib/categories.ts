// Single source of truth for the Writing taxonomy.
// Kept OUT of content.config.ts so pages can import this list without
// dragging in the glob loader (and node:fs) along with it.
export const WRITING_CATEGORIES = ['Poetry', 'Reviews', 'Star Trek'] as const;
export type WritingCategory = (typeof WRITING_CATEGORIES)[number];