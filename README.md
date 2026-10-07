# The Recipe Vault

A personal recipe site built with Jekyll and hosted on GitHub Pages at
[kylermurphy.github.io/smurphs_cooking](https://kylermurphy.github.io/smurphs_cooking).
Dark editorial theme, full-text search, and tag filtering — no database, no backend.

## Running locally

```bash
git clone https://github.com/kylermurphy/smurphs_cooking.git
cd smurphs_cooking
bundle install
bundle exec jekyll serve
# → http://localhost:4000/smurphs_cooking/  (note the /smurphs_cooking baseurl)
```

GitHub Pages builds and publishes the site automatically from `main`.

---

## Adding a recipe

Create a new file in `_recipes/` using this template:

```markdown
---
title: "Recipe Title"
description: "One sentence describing the dish."
date: 2024-01-15
tags:
  - tag-one
  - tag-two
servings: "4"
prep_time: "15 minutes"
cook_time: "30 minutes"
total_time: "45 minutes"
src_url: "https://www.instagram.com/reel/SHORTCODE/"
base_url: "https://www.instagram.com"
---

## Ingredients

- 200g ingredient one
- 1 tbsp ingredient two
- 3 cloves ingredient three

## Instructions

1. First step goes here in full sentences.
2. Second step, including any important technique notes.
3. Continue until done.

## Notes

> Any tips, variations, storage notes, or substitutions go here as a blockquote.
```

The filename becomes the URL slug: `my-great-pasta.md` → `/recipes/my-great-pasta/`.

---

## Importing recipes

New recipes normally come from
[**recipe_scraper**](https://github.com/kylermurphy/recipe_scraper) (dev-hub `RCP-`), a
separate package that scrapes a recipe from Instagram or a general recipe website into this
same front-matter format, `src_url`/`base_url` included. Run it, then move or paste its
output `.md` file straight into `_recipes/`. See that repo's README for usage.

---

## Markdown reference

| Front matter key | Required | Example                       |
|------------------|----------|--------------------------------|
| `title`          | ✓        | `"Banana Bread"`              |
| `description`    |          | `"Moist and rich…"`           |
| `date`           | ✓        | `2024-01-15`                  |
| `tags`           |          | list of lowercase strings     |
| `servings`       |          | `"8 slices"`                  |
| `prep_time`      |          | `"10 minutes"`                |
| `cook_time`      |          | `"55 minutes"`                |
| `total_time`     |          | `"1 hour 5 minutes"`          |
| `src_url`        |          | original recipe URL (Instagram post, recipe site page) |
| `base_url`       |          | the source site's base URL, e.g. `"https://www.instagram.com"` — matched against `png_list` in `_config.yml` to pick the source icon shown on the recipe page |

## Content conventions

- **Sections:** Use `## Ingredients`, `## Instructions`, `## Notes` — the CSS targets these headings specifically.
- **Ingredients:** Plain unordered list (`- item`), one per line.
- **Instructions:** Ordered list (`1. step`). Each step is a full sentence or paragraph.
- **Notes:** Blockquote (`> tip text`). Renders with a gold left border.
- **Temperatures:** Wrap in backticks (`` `175°C / 350°F` ``) for monospace styling.
- **Tags:** always lowercase — `tags.html` groups them case-sensitively but slugifies their
  anchors, so a mixed-case tag creates a silent duplicate group.
