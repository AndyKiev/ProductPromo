---
name: wiki
description: Orchestrator for the ProductPromo Obsidian knowledge vault (LLM_OBSIDIAN_VAULT) — the legacy VBA "Promo Bery Bilshe" analysis plus the self-learning loop of ingest → query → save → lint → hot-cache refresh. Use when the user says "wiki", "vault", "second brain", "what do we know about X", "how did the legacy system do X", "file this in the vault", or asks to check/repair vault health. Routes to /wiki-ingest, /wiki-query, /wiki-save, /wiki-lint.
---

# Wiki — the knowledge loop

A persistent Obsidian vault that compounds project knowledge across sessions.
Plain Markdown, `[[wikilinks]]`, no plugin or API needed — direct filesystem access.

## Vault location

`LLM_OBSIDIAN_VAULT` in the repo-root `.env`
(currently `C:\Users\andre\Documents\Andrey_Bakulin\LLM\LLM_PRODUCTPROMO`).
Never hardcode the path in a skill or script — read it from `.env`.
It is outside the project, so it must stay listed in `.claude/settings.local.json`
→ `permissions.additionalDirectories`, or writes silently fail.

## What is already there

The vault started as a reverse-engineering of the **legacy system** this repo
replaces: the Excel/VBA app over MySQL `aula.*` + GICA AS/400. Those pages sit at the
vault root, numbered for reading order, and the map of content is [[ProductPromo Home]]:

- `01 Domain Overview`, `02 Data Model`, `03.xx` process pages (session lifecycle,
  article lifecycle, upload validation, pricing, monitoring, reports) — except
  `03.07 Uploading Articles to an Existing Session`, which is a requirement for the new app,
  `04 GICA Integration`, `05 Dictionaries and Enums`
- `06 Source Code Map` — maps the **legacy VBA** modules, not this repo
- `07 Open Questions` — ambiguities in the legacy code (marked ⚠️ on the pages)
- `08 Migration Targets` — what the new app must carry over

These are the migration spec. When building a feature here, check them first.

## The three kinds of page — the rule that keeps this from rotting

| Kind | Where | Written by | Hand-edit? |
|---|---|---|---|
| **Legacy analysis** | vault root, `NN` / `NN.NN Title.md` | reverse-engineering the VBA/SQL sources | Yes, carefully — never overwrite silently; append or ask |
| **Derived** | `Architecture/`, `Coding-Standards/`, `API/`, plus `index.md`, `hot.md` | `/wiki-ingest` from repo sources (`AGENTS.md`, `CLAUDE.md`, `.claude/skills/*`, code) | **No** — re-ingest instead; hand edits are lost |
| **Primary** | `Decisions/`, `Bugs-and-Solutions/`, `Business-Rules/`, `Database/`, `Operations/`, `Meeting-Notes/` | `/wiki-save` from real work — things the repo does **not** record | Yes |

Folders are created on first use. Derived pages carry `derived: true` + `source:`
frontmatter. If a derived page disagrees with its source, the **source wins** —
re-ingest, don't patch the page. Primary and legacy-analysis pages are the durable
value: what could not be recovered by reading this repo's code.

When the new app deliberately departs from legacy behaviour, record it in
`Decisions/` and link it from the legacy page it overrides — don't rewrite the
legacy page to describe the new app.

## The cycle

1. **Ingest** — repo source or dropped document → derived pages (`/wiki-ingest`)
2. **Query** — answer from the vault: `hot.md` → `index.md` → specific pages (`/wiki-query`)
3. **Save** — this session's durable finding → a primary page (`/wiki-save`)
4. **Lint** — dead links / stubs / orphans (`/wiki-lint`)
5. **Refresh** — `index.md` regenerated, a line appended to `hot.md`, which the
   next session loads at start. That is the loop closing.

## CLI

```bash
python scripts/wiki/wiki.py lint
```
```bash
python scripts/wiki/wiki.py index
```
```bash
python scripts/wiki/wiki.py hot --note "text"
```

`hot --rotate` starts a new session block and trims to the last 5.

**The SessionStart hook is NOT installed** (the settings edit needs the user's
approval). Until it is, read `hot.md` explicitly at the start of vault work — that
is what closes the loop. The snippet for `.claude/settings.local.json`:

```json
"hooks": {
  "SessionStart": [
    { "hooks": [ { "type": "command", "command": "python scripts/wiki/wiki.py hot --print" } ] }
  ]
}
```

## Page conventions

- Filename = page title, `Title Case With Spaces.md`. Legacy-analysis pages keep
  their numeric prefix; new pages in folders have none. Never use dashes inside a
  page name; folder names with dashes stay as-is.
- Frontmatter on every **new** page: `derived`, `source` (derived only), `updated`,
  `tags`. The legacy-analysis pages predate this and have none — don't bulk-add it.
- Every new page ends with a `## Related` list of `[[links]]` — bidirectionality is
  what makes the graph useful. A page with no inbound link is an orphan; link it
  from [[ProductPromo Home]] or a sibling page.
- Keep derived pages **short and pointing**: the rule plus the repo path that owns
  it. Duplicating a whole file into the vault guarantees drift.
- English only. Legacy terminology (CUG, PCB, UVC, EAN, SiteFormatList) as defined
  in [[01 Domain Overview]].

## Routing

| User says | Skill |
|---|---|
| "read this doc / update the vault from AGENTS.md" | `/wiki-ingest` |
| "what do we know about X", "how did the old app do X", "check the vault first" | `/wiki-query` |
| "save this", "file that decision/bug" | `/wiki-save` |
| "is the vault healthy", dead links, after a big ingest | `/wiki-lint` |
