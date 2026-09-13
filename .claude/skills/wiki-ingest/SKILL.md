---
name: wiki-ingest
description: Ingest a source (AGENTS.md, CLAUDE.md, a .claude skill, a code module, a dropped document or legacy VBA/SQL export) into the ProductPromo Obsidian vault as derived, cross-linked wiki pages. Use when asked to "add this to the vault", "ingest", "update the wiki from the repo", or after a convention/architecture change that the vault's derived pages now contradict.
---

# Wiki ingest

Turns a **source** into **derived pages**. Read [[wiki]] first for the vault path and
the legacy / derived / primary rule.

## Procedure

1. **Resolve the vault** — `LLM_OBSIDIAN_VAULT` from the repo-root `.env`.
2. **Read the source fully.** Never ingest from a summary.
3. **Decide the pages.** One page = one concept a person would ask about
   ("Nomenclature Hierarchy", "Auth and JWT"), not one page per source file.
   Check `index.md` first: if the page exists, **update it in place**, don't fork
   a near-duplicate under another name.
4. **Write each page** with this shape:

```markdown
---
derived: true
source: AGENTS.md#conventions, backend/backend/api_v1/product/views.py
updated: 2026-09-13
tags: [backend, api]
---

# API Response Envelope

Two-sentence orientation.

## Rules
- Short, imperative, each carrying the repo path that owns it.

## Related
- [[Layered Backend Architecture]]
- [[02 Data Model]]
```

5. **Cross-link both ways.** After adding a page, add it to the `## Related` of at
   least one existing page and to the right section of [[ProductPromo Home]].
   When a repo page implements something described in a legacy-analysis page
   (`02 Data Model`, `03.xx`), link the legacy page from it. A page reachable only
   from `index.md` is effectively invisible.
6. **Refresh + verify:**

```bash
python scripts/wiki/wiki.py index && python scripts/wiki/wiki.py lint
```

   Dead links you just created must go to zero before you report done.
7. **Note it:**

```bash
python scripts/wiki/wiki.py hot --note "ingested X -> [[Page A]], [[Page B]]"
```

## Rules

- **Point, don't copy.** A derived page states the rule and names the file that
  enforces it. A page that duplicates 200 lines of `AGENTS.md` is drift waiting to happen.
- **Never invent.** Everything on a derived page must be traceable to the source.
  Unknown → leave it out, or add it to [[07 Open Questions]].
- **Don't touch legacy-analysis pages from an ingest of this repo.** They describe
  the old system. New-app behaviour goes on derived pages; deliberate departures
  go to `Decisions/` via `/wiki-save`.
- **Legacy sources** (a VBA module, an `aula` table dump, a GICA spec) extend the
  numbered legacy-analysis pages — update the matching `03.xx` page in place, or add
  the next number in its series and link it from [[ProductPromo Home]].
- **Ambiguous basenames break Obsidian.** Two pages with the same filename in
  different folders make every `[[link]]` to that name ambiguous, and the loser
  becomes an orphan. `wiki.py lint` reports both — fix by renaming, not by ignoring.
- **Dropped documents** (a spec, a meeting export, a client mail) are *sources*, not
  primary knowledge: ingest the content, then keep the original wherever the user
  put it. What you write from it goes to a derived page unless it records a
  decision or a rule someone committed to — that is `/wiki-save` territory.
