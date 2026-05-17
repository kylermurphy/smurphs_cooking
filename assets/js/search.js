/**
 * search.js
 * Client-side search and mobile nav for The Recipe Vault.
 *
 * Strategy: recipe cards on the homepage already carry data-title,
 * data-tags, and data-description attributes, so we filter them in
 * memory without an extra network request. Fast and offline-capable.
 *
 * Security: we never use innerHTML with user input.
 * All DOM writes use textContent or createElement.
 */

(function () {
  "use strict";

  /* ── Mobile navigation ───────────────────────────────────── */
  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links  = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      links.classList.toggle("is-open", !expanded);
    });

    // Close menu when a nav link is tapped on mobile
    links.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
      });
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ── Homepage search ─────────────────────────────────────── */
  function initSearch() {
    const input     = document.getElementById("recipe-search");
    const countEl   = document.getElementById("search-count");
    const emptyEl   = document.getElementById("recipes-empty");
    const cards     = Array.from(document.querySelectorAll(".recipe-card"));

    if (!input || cards.length === 0) return;

    // Total count displayed before any search
    updateCount(cards.length, cards.length);

    let debounceTimer;

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      // Debounce: wait 120ms after the user stops typing before filtering.
      // This keeps the UI snappy without thrashing on every keystroke.
      debounceTimer = setTimeout(function () {
        filterCards(input.value.trim());
      }, 120);
    });

    function filterCards(query) {
      // Normalise to lowercase so matching is case-insensitive.
      // We never pass the raw query into innerHTML.
      const q = query.toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const title = card.dataset.title       || "";
        const tags  = card.dataset.tags        || "";
        const desc  = card.dataset.description || "";

        const matches = !q
          || title.includes(q)
          || tags.includes(q)
          || desc.includes(q);

        // Use the hidden attribute (semantic + accessible) instead of
        // display:none so screen readers also skip filtered cards.
        card.hidden = !matches;
        if (matches) visible++;
      });

      updateCount(visible, cards.length);

      // Show the empty state if nothing matched
      if (emptyEl) {
        emptyEl.style.display = (visible === 0) ? "block" : "none";
      }
    }

    function updateCount(visible, total) {
      if (!countEl) return;
      if (!input.value.trim()) {
        // Use textContent — never innerHTML — for user-controlled strings
        countEl.textContent = total + " recipe" + (total !== 1 ? "s" : "");
      } else {
        countEl.textContent =
          visible + " of " + total + " recipe" + (total !== 1 ? "s" : "") + " match";
      }
    }
  }

  /* ── Tags page filtering ─────────────────────────────────── */
  function initTagFilter() {
    const tagButtons = Array.from(document.querySelectorAll(".tag-cloud-item"));
    const tagGroups  = Array.from(document.querySelectorAll(".tag-group"));

    if (tagButtons.length === 0 || tagGroups.length === 0) return;

    // Read the selected tag from the URL hash so deep-linking works:
    // /tags#pasta shows only pasta recipes on page load.
    let activeTag = decodeURIComponent(window.location.hash.slice(1)) || null;

    applyFilter(activeTag);

    tagButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const tag = this.dataset.tag;
        if (activeTag === tag) {
          // Clicking the same tag again clears the filter
          activeTag = null;
          history.replaceState(null, "", window.location.pathname);
        } else {
          activeTag = tag;
          // Update the URL hash so the user can share/bookmark a filtered view
          history.replaceState(null, "", "#" + encodeURIComponent(tag));
        }
        applyFilter(activeTag);
      });
    });

    // Handle browser back/forward
    window.addEventListener("hashchange", function () {
      activeTag = decodeURIComponent(window.location.hash.slice(1)) || null;
      applyFilter(activeTag);
    });

    function applyFilter(tag) {
      // Update button states
      tagButtons.forEach(function (btn) {
        const isActive = btn.dataset.tag === tag;
        btn.setAttribute("aria-pressed", String(isActive));
      });

      // Show/hide tag groups
      tagGroups.forEach(function (group) {
        const groupTag = group.dataset.tag;
        group.hidden = !!(tag && groupTag !== tag);
      });
    }
  }

  /* ── Initialise everything on DOM ready ─────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initSearch();
    initTagFilter();
  });

}());
