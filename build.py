"""
build.py
=========
Static site generator for the recipe website.

Reads Markdown files from _recipes/, renders them through Jinja2 templates,
and writes the finished HTML to site/ — which is what GitHub Pages deploys.

Usage:
    python build.py

To preview locally after building:
    cd site && python -m http.server 8000

Dependencies:
    pip install -r requirements.txt
"""

import json
import re
import shutil
from pathlib import Path
from datetime import date as date_type

import frontmatter
import markdown as md_lib
from jinja2 import Environment, FileSystemLoader, select_autoescape

# ---------------------------------------------------------------------------
# Configuration — edit these to match your site
# ---------------------------------------------------------------------------

SITE_TITLE   = "The Recipe Box"
SITE_DESC    = "A personal collection of tried-and-tested recipes."

# If deploying to a GitHub project page (github.com/user/REPO), set this to
# "/REPO". If deploying to github.com/user/user.github.io, leave it empty.
BASE_URL     = ""

# Source directories (checked into git)
RECIPES_DIR   = Path("_recipes")
TEMPLATES_DIR = Path("templates")
ASSETS_DIR    = Path("assets")

# Output directory (built locally, deployed by CI — add to .gitignore)
OUTPUT_DIR    = Path("site")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """Convert arbitrary text to a lowercase, hyphenated URL slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


def strip_html_tags(html: str) -> str:
    """Remove all HTML tags, returning plain text suitable for search."""
    return re.sub(r"<[^>]+>", " ", html).strip()


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_recipe(filepath: Path) -> dict:
    """
    Load a recipe Markdown file and return a plain dict of all its data.

    The file's stem (filename without .md) becomes the URL slug, so
    'banana-bread.md' will live at /recipes/banana-bread/.

    Expected front matter keys:
        title       (str)       — display name of the recipe
        description (str)       — one-sentence summary, used in cards/SEO
        tags        (list|str)  — category labels, e.g. [baking, breakfast]
        servings    (str)       — e.g. "8 slices"
        prep_time   (str)       — e.g. "10 minutes"
        cook_time   (str)       — e.g. "50 minutes"
        date        (date|str)  — when the recipe was added
    """
    post = frontmatter.load(filepath)
    slug = filepath.stem

    # Convert the Markdown body to HTML.
    # We enable several extensions:
    #   tables     — GitHub-flavoured pipe tables
    #   fenced_code — ```code blocks```
    #   toc        — auto-generates anchor ids on headings (needed for styling)
    #   nl2br      — single newlines become <br> (more forgiving for recipe writers)
    content_html = md_lib.markdown(
        post.content,
        extensions=["tables", "fenced_code", "toc", "nl2br"],
    )

    # Tags can be a YAML list or a comma-separated string — handle both.
    tags = post.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    tags = [str(t).strip().lower() for t in tags]

    # Normalise the date field (PyYAML may parse it as a date object).
    raw_date = post.get("date", "")
    if isinstance(raw_date, date_type):
        date_display = raw_date.strftime("%B %d, %Y")
        date_iso = raw_date.isoformat()
    else:
        date_display = str(raw_date)
        date_iso = str(raw_date)

    url = f"{BASE_URL}/recipes/{slug}/"

    return {
        "title":        post.get("title", slug.replace("-", " ").title()),
        "slug":         slug,
        "description":  post.get("description", ""),
        "tags":         tags,
        "servings":     post.get("servings"),
        "prep_time":    post.get("prep_time"),
        "cook_time":    post.get("cook_time"),
        "date_display": date_display,
        "date_iso":     date_iso,
        "content_html": content_html,
        "url":          url,
        # Plain text version of the body, used to build the Lunr search index.
        "body_text":    strip_html_tags(content_html),
    }


# ---------------------------------------------------------------------------
# Building
# ---------------------------------------------------------------------------

def build_site():
    """
    Main build function.

    Steps:
      1. Wipe and recreate the output directory.
      2. Copy static assets (CSS, JS, images).
      3. Parse all recipe Markdown files.
      4. Render the index page.
      5. Render one page per recipe.
      6. Collect all tags; render one page per tag + a tags index.
      7. Write the JSON search index consumed by Lunr on the client.
    """

    # ------------------------------------------------------------------
    # 1. Reset output directory
    # ------------------------------------------------------------------
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True)

    # ------------------------------------------------------------------
    # 2. Copy static assets
    # ------------------------------------------------------------------
    shutil.copytree(ASSETS_DIR, OUTPUT_DIR / "assets")
    print("Copied assets.")

    # ------------------------------------------------------------------
    # 3. Parse all recipes, sorted newest-first
    # ------------------------------------------------------------------
    recipe_files = sorted(RECIPES_DIR.glob("*.md"), reverse=True)
    if not recipe_files:
        print("Warning: no .md files found in _recipes/")

    recipes = [parse_recipe(f) for f in recipe_files]
    # Sort by date descending; fall back to title for undated recipes.
    recipes.sort(key=lambda r: (r["date_iso"] or "0000"), reverse=True)
    print(f"Parsed {len(recipes)} recipe(s).")

    # ------------------------------------------------------------------
    # 4-7. Render HTML via Jinja2
    # ------------------------------------------------------------------
    env = Environment(
        loader=select_autoescape(
            # Tell Jinja2 to auto-escape HTML in .html templates — prevents
            # XSS if any user-controlled content ever makes it into the templates.
            enabled_extensions=("html",),
            disabled_extensions=("txt",),
        ),
        # Use FileSystemLoader so templates can {% include %} each other.
    )
    # Override with a real FileSystemLoader so we can load files from disk.
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape(["html"]),
    )

    # Shared context available in every template.
    global_ctx = {
        "site_title": SITE_TITLE,
        "site_desc":  SITE_DESC,
        "base_url":   BASE_URL,
        "all_recipes": recipes,
    }

    def render(template_name: str, output_path: Path, **ctx):
        """Render a template and write it to output_path."""
        output_path.parent.mkdir(parents=True, exist_ok=True)
        tmpl = env.get_template(template_name)
        html = tmpl.render(**global_ctx, **ctx)
        output_path.write_text(html, encoding="utf-8")

    # 4. Index page
    render("index.html", OUTPUT_DIR / "index.html", recipes=recipes)
    print("Built index.html")

    # 5. Individual recipe pages
    for recipe in recipes:
        render(
            "recipe.html",
            OUTPUT_DIR / "recipes" / recipe["slug"] / "index.html",
            recipe=recipe,
        )
    print(f"Built {len(recipes)} recipe page(s).")

    # 6. Tag pages
    # Build a map of tag -> [recipes with that tag]
    tags: dict[str, list] = {}
    for recipe in recipes:
        for tag in recipe["tags"]:
            tags.setdefault(tag, []).append(recipe)

    for tag, tagged_recipes in sorted(tags.items()):
        render(
            "tag.html",
            OUTPUT_DIR / "tags" / slugify(tag) / "index.html",
            tag=tag,
            recipes=tagged_recipes,
        )

    render("tags_index.html", OUTPUT_DIR / "tags" / "index.html", tags=tags)
    print(f"Built {len(tags)} tag page(s).")

    # 7. Search index (consumed by Lunr.js in the browser)
    search_index = [
        {
            "id":          r["slug"],
            "title":       r["title"],
            "description": r["description"],
            "tags":        " ".join(r["tags"]),
            "url":         r["url"],
            # Truncate body so the JSON file stays small.
            "body":        r["body_text"][:3000],
        }
        for r in recipes
    ]
    search_path = OUTPUT_DIR / "search.json"
    search_path.write_text(
        json.dumps(search_index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("Built search.json")
    print(f"\nDone! Output is in ./{OUTPUT_DIR}/")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    build_site()
