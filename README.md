# ouroboruszak.com

Personal writer's hub. Astro 7 (static), deployed via GitHub → Cloudflare Pages.

Developed with the assistance of Claude Opus 4.8.

## Structure

    src/
      content.config.ts        # Collections: `writing` (Poetry/Reviews/Star Trek) + `lab`
      content/
        writing/*.md           # Writing entries (category set in frontmatter)
        lab/*.md               # Lab entries (Mesostic generator, etc.)
      layouts/
        BaseLayout.astro       # Shared shell, nav, footer.
      pages/
        index.astro            # Home (spine statement + recent writing)
        about.astro
        contact.astro
        privacy.astro
        writing/index.astro    # Writing index, grouped by category
        writing/[...id].astro  # Individual writing entry
        lab/index.astro        # Lab index
        lab/[...id].astro      # Individual lab entry
      styles/
        global.css             # Style sheet

## Local development

    npm install
    npm run dev        # http://localhost:4321
    npm run build      # outputs to dist/
    npm run preview    # serve the production build locally

## Adding a Writing entry

Create `src/content/writing/<slug>.md` with frontmatter:

    ---
    title: "..."
    description: "..."
    pubDate: 2026-06-01
    category: "Poetry"        # or "Reviews" | "Star Trek"
    draft: false              # optional; drafts are hidden in production builds
    ---

The filename becomes the URL slug. Add a new category by editing
`WRITING_CATEGORIES` in `src/content.config.ts`.
