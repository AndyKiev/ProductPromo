# CLAUDE.md

@AGENTS.md

> **AGENTS.md holds the stack and conventions (shared with OpenCode); this file adds
> what only Claude Code uses; the wiki vault holds the *why* and the legacy spec.**
> A rule moved to the vault stops being applied by default — rules stay in the repo.

## Wiki & knowledge vault
- Vault: `LLM_OBSIDIAN_VAULT` in `.env` -> `C:\Users\andre\Documents\Andrey_Bakulin\LLM\LLM_PRODUCTPROMO`. Never hardcode the path -- read it from `.env`. It lives outside the repo, so it must stay in `.claude/settings.local.json` -> `permissions.additionalDirectories`, or writes silently fail.
- **It is the migration spec.** The numbered root pages (`01 Domain Overview` ... `08 Migration Targets`, map: `ProductPromo Home`) reverse-engineer the legacy Excel/VBA + MySQL `aula` + GICA app this repo replaces. Before building or changing a promo feature, check the matching page (`/wiki-query`) -- and `07 Open Questions` for anything marked ⚠️.
- **Vault first for WHY and legacy behaviour, code first for WHAT.** Never grep the codebase to reconstruct a decision: the code shows what was chosen, never why. For "what does this code do now" the code always wins. Say which one you used.
- **Kinds of page.** Legacy analysis (root, numbered) and primary pages (`Decisions/`, `Bugs-and-Solutions/`, `Business-Rules/`, `Database/`, `Operations/`, `Meeting-Notes/`) are hand-authored -- never overwrite silently. Derived pages (`Architecture/`, `Coding-Standards/`, `API/`, `index.md`, `hot.md`) regenerate from repo sources -- never hand-edit, re-ingest. A deliberate departure from legacy behaviour goes to `Decisions/`, linked from the legacy page -- don't rewrite the legacy page.
- Read before deciding, save after resolving, lint to stay healthy.
- Vault page filenames are prose `Title Case With Spaces.md`.

## Skills (`.claude/skills/`)
- `/wiki` -- the vault and its loop: `/wiki-ingest` (repo -> derived pages) . `/wiki-query` (answer from the vault, cited) . `/wiki-save` (decisions, bug root causes, business rules -> primary pages) . `/wiki-lint`. CLI: `python scripts/wiki/wiki.py lint|index|hot`.
