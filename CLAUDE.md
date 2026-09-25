# CLAUDE.md — smurphs_cooking

Instructions for Claude Code **and** claude.ai/code (cloud) sessions working in this repo.
Both read this file. Edit it in dev-hub (`repos/smurphs_cooking/CLAUDE.md`), not
here: this copy is replaced from the master at the start of each task.

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
- Tags are lowercase (see Learnings).
- New recipes usually come from the **recipe_scraper** package (dev-hub `RCP-`).

## Commands
- No test suite. Verify with `bundle exec jekyll build` (and `serve`) and check that the
  index, tags page, and a recipe page render and scale correctly.

## Learnings

Durable facts from past tasks, promoted from `log/<ID>.md` by `mark-done` (max ~15).

- Local build without a Gemfile (until COOK-3): `gem install --user-install jekyll
  jekyll-feed jekyll-sitemap jekyll-seo-tag`, then `jekyll build`. (COOK-6)
- `tags.html` groups tags case-sensitively but its anchors use `slugify`, so mixed-case
  tags create duplicate groups. Keep tags lowercase. (COOK-6)
- Files the site doesn't need must be listed in `_config.yml` `exclude`, or Jekyll
  publishes them. (COOK-1)

## Task protocol (dev-hub tasks)

Tasks come from **dev-hub** (`kylermurphy/dev-hub`). Its `CLAUDE.md` → **Task protocol** is the
full, authoritative version; this is the summary. Each task is self-contained: start from its
board row alone.

- **Branch** `task/<ID>-<slug>` off the default branch; never commit to `main`.
- **First commit:** sync this file from its dev-hub master
  (`repos/smurphs_cooking/CLAUDE.md`). Edit instructions in the master, never here.
- **Plan** saved to dev-hub `log/<ID>.md` before heavy work (`plan-task <ID>`); a `plan <ID>`
  dry run saves nothing. **Draft PR** following dev-hub's `templates/PULL_REQUEST_TEMPLATE.md`
  (not copied here): ID, what, why, how tested, DoD check.
- **Bookkeeping** (`log/<ID>.md`, `TASK_LOG.md` row, board Status → `WIP`) goes straight to
  dev-hub `main`. In a branch-restricted session it goes to the designated branch with an
  open PR instead (say so in chat; never merge it yourself). Only `mark-done <ID>` sets `Done`.
- **Stop states:** `Blocked` (fill `## Blocked / open questions`) or `Usage-stopped`; keep
  `Next step` current and resume with `pickup-task <ID>`.
- **Batches** (`multi-task`, or `plan-task` with several IDs): one branch
  `task/<ID>+<ID>+…-<slug>` and one PR for up to 5 simple tasks; each keeps its own log, and
  commits are prefixed with their ID. A `Blocked` task is dropped from the batch; the rest
  ship. Rules: dev-hub `CLAUDE.md` → Batches.
- **Learnings:** mark lasting findings as `Learning:` lines in the log; `mark-done` promotes
  them into `## Learnings` above (via the master).
- **Subagents:** delegate only broad/mechanical work to cheaper models, per dev-hub
  `CLAUDE.md` → Subagents; the main session does all commits and pushes.
- Build the site locally and check the index, tags, and a recipe page before the PR.
- Definition of done = the task's row on dev-hub `TASK_BOARD.md`.

## Task board
This repo's backlog IDs use the **`COOK-`** prefix.
