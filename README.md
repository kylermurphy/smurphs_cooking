# The Recipe Vault

A personal recipe site built with Jekyll and hosted on GitHub Pages.
Dark editorial theme, full-text search, and tag filtering — no database, no backend.

## Quick start

### 1. Fork or clone this repo

```bash
git clone https://github.com/yourusername/recipe-vault.git
cd recipe-vault
```

### 2. Configure `_config.yml`

Open `_config.yml` and update:

```yaml
title: "Your Site Name"
url: "https://yourusername.github.io"
baseurl: ""          # Leave empty if using a custom domain
                     # Set to "/repo-name" for a project page site
```

### 3. Enable GitHub Pages

In your repo → **Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: `main` / `(root)`

GitHub will build and publish your site automatically on every push.
Your site will be live at `https://yourusername.github.io` (or your custom domain).

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

## Importing from Instagram

Use the companion `instagram_recipe.py` module to extract recipes from Instagram
captions and automatically generate markdown files in the correct format:

```python
from instagram_recipe import get_recipe_from_post

recipe = get_recipe_from_post("https://www.instagram.com/p/SHORTCODE/")

# Write to _recipes/
import re, pathlib

slug = re.sub(r"[^a-z0-9]+", "-", recipe.title.lower()).strip("-")
path = pathlib.Path("_recipes") / f"{slug}.md"

tags_yaml = "\n".join(f"  - {t}" for t in (recipe.tags or []))
ingredients = "\n".join(f"- {i}" for i in recipe.ingredients)
instructions = "\n".join(f"{n}. {s}" for n, s in enumerate(recipe.instructions, 1))

path.write_text(f"""---
title: "{recipe.title}"
description: ""
date: {__import__('datetime').date.today()}
tags:
{tags_yaml}
servings: "{recipe.servings or ''}"
prep_time: "{recipe.prep_time or ''}"
cook_time: "{recipe.cook_time or ''}"
total_time: ""
---

## Ingredients

{ingredients}

## Instructions

{instructions}

## Notes

> {recipe.notes or ''}
""")

print(f"Written to {path}")
```

---

## Markdown reference

| Front matter key | Required | Example                       |
|------------------|----------|-------------------------------|
| `title`          | ✓        | `"Banana Bread"`              |
| `description`    |          | `"Moist and rich…"`           |
| `date`           | ✓        | `2024-01-15`                  |
| `tags`           |          | list of lowercase strings     |
| `servings`       |          | `"8 slices"`                  |
| `prep_time`      |          | `"10 minutes"`                |
| `cook_time`      |          | `"55 minutes"`                |
| `total_time`     |          | `"1 hour 5 minutes"`          |

## Content conventions

- **Sections:** Use `## Ingredients`, `## Instructions`, `## Notes` — the CSS targets these headings specifically.
- **Ingredients:** Plain unordered list (`- item`), one per line.
- **Instructions:** Ordered list (`1. step`). Each step is a full sentence or paragraph.
- **Notes:** Blockquote (`> tip text`). Renders with a gold left border.
- **Temperatures:** Wrap in backticks (`` `175°C / 350°F` ``) for monospace styling.

## Running locally

```bash
gem install bundler jekyll
bundle init
bundle add jekyll jekyll-feed jekyll-sitemap jekyll-seo-tag
bundle exec jekyll serve
# → http://localhost:4000
```
