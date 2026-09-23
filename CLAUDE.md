# CLAUDE.md — smurphs_cooking

Instructions for Claude Code **and** cloud (claude.ai) sessions working in this repo.
Both surfaces read this file. Keep it current when the build or layout changes.

## What this is
Kyle Murphy's personal recipe site ("The Recipe Vault"), a Jekyll site on GitHub Pages at
`https://kylermurphy.github.io/smurphs_cooking`. Client-side search, tag filtering, and
serving-size scaling; no backend.

## Environment & build
- **Jekyll** is what deploys: GitHub Pages builds from `main` / root. Config in
  `_config.yml` (`baseurl: "/smurphs_cooking"` — always link via `relative_url`).
- No `Gemfile` yet (task **COOK-3**). Until then, build locally with
  `gem install bundler jekyll`, then `bundle exec jekyll serve` per the README.
- `build.py` + `templates/` are a separate, unused Jinja static generator (needs
  `python-frontmatter`, `markdown`, `jinja2`; no `requirements.txt`). Don't edit them to
  change the live site (task **COOK-2**).

## Layout
- `_recipes/*.md` — one recipe per file; the filename is the URL slug
  (`/recipes/<name>/`). The layout `recipe` is applied automatically.
- `_layouts/`, `_includes/` — page templates; `index.html`, `tags.html` — list pages.
- `assets/js/search.js`, `assets/js/scale.js` — search and serving scaling;
  `assets/css/main.css`; source icons (`instagram`/`blueapron`/`hellofresh`/`web.png`)
  chosen from `png_list` in `_config.yml`.
- `unparsed.md` — raw recipe text waiting to be converted (task **COOK-7**).

## Recipe format
- Front matter: `title`, `date` (required); `description`, `tags`, `servings`,
  `prep_time`, `cook_time`, `total_time`, `src_url` (original post/page), `base_url`
  (source site, picks the icon).
- Sections: `## Ingredients` (bullet list), `## Instructions` (numbered),
  `## Notes` (blockquote). The CSS and scaling JS depend on these headings.
- Tags are lowercase (task **COOK-6**).
- New recipes usually come from the **recipe_scraper** package (dev-hub `RCP-`).

## Commands
- No test suite. Verify with `bundle exec jekyll build` (and `serve`) and check that the
  index, tags page, and a recipe page render and scale correctly.

## Task protocol (dev-hub tasks)

Any task started from **dev-hub** is self-contained and independent of any other chat or
Claude Code session — start it from its board row alone, assuming no prior context.

- **Branch:** create `task/<ID>-<short-slug>` off the default branch; never commit to `main`.
- **Copy `CLAUDE.md` first:** as the first commit, refresh this file from its dev-hub
  master (`repos/<name>/CLAUDE.md`) if missing or out of date; instructions are edited in
  the master, not here.
- **PR:** open a PR for that branch. Its description must state the task **ID**, what
  changed, why, how it was tested, and the definition-of-done check. Handback default: a
  draft PR once GitHub is connected; a patch/diff otherwise.
- **Log:** add `log/<ID>.md` in dev-hub (from `log/TEMPLATE.md`) with the same summary and
  the PR link, add a row to dev-hub `TASK_LOG.md`, and set the task's **Status** on
  `TASK_BOARD.md` (`WIP` on PR open, `Done` on merge).
- **Resume, don't restart:** commit/push to the branch as you go and keep the log's
  `Status`/`Next step` current; on starting, if a `task/<ID>` branch or `log/<ID>.md`
  already exists, continue from `Next step` instead of starting over.
- **Plan first when present:** if asked to "plan <ID>", propose the approach in chat and
  make no commits until told to "go"; unattended, go straight to a draft.
- Build the site locally and check the index, tags, and a recipe page before the PR.
- Definition of done = the task's row on dev-hub `TASK_BOARD.md`.

## Task board
This repo's backlog IDs use the **`COOK-`** prefix.
