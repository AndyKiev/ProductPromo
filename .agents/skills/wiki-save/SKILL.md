---
name: wiki-save
description: File a durable finding from the current session into the ProductPromo Obsidian vault as a primary page — a decision (including a deliberate departure from the legacy VBA behaviour), a bug and its root cause, a business rule, a schema fact. Use when the user says "save this", "remember this in the vault", "file that decision", or when a non-trivial bug is solved, a design choice is settled, or a legacy open question is answered.
---

# Wiki save

Writes **primary** knowledge — the things the repo does *not* record. This is the
half of the loop that actually compounds; derived pages are just a mirror.

## What qualifies

| Save | Don't save |
|---|---|
| A decision **and the rejected alternative** | What the code plainly says |
| A departure from legacy behaviour, and why | A one-line typo fix |
| A bug: symptom → root cause → fix → how to spot it again | Anything already in `AGENTS.md`/`AGENTS.md` — that is `/wiki-ingest` |
| A business rule someone stated (who, when) | Session chatter (`hot.md` holds that) |
| A non-obvious schema/data fact, legacy→new mapping | Speculation |
| A perf finding with the measured numbers | |

If the fact is about *how you should work* rather than about the project, it belongs
in the agent memory directory, not the vault.

## Where it goes

| Kind | Folder |
|---|---|
| Decision / ADR, legacy departure | `Decisions/` |
| Bug + root cause | `Bugs-and-Solutions/` |
| Domain rule | `Business-Rules/` |
| Schema, data shape, legacy→new table mapping, query cost | `Database/` |
| Runbook, ops procedure | `Operations/` |
| Discussion, requirement from a person | `Meeting-Notes/` |

Create the folder if it does not exist yet.

**Answered a legacy open question?** Don't create a new page for it alone — append a
dated resolution under the question in [[07 Open Questions]], and fix the ⚠️ on the
legacy page it points to. Create a `Decisions/` page only if the answer is a choice
the new app makes.

## Template

```markdown
---
derived: false
updated: 2026-09-13
tags: [backend, promo-session]
---

# Session Names Keep Their Case

**Context** — what was happening, when, measured how.

**Finding** — the root cause or the choice, concretely. Numbers, not adjectives.
For a legacy departure: what the old app did (cite the page), what we do instead.

**Resolution** — what was changed, in which files.

**Watch for** — the symptom that means this is back.

## Related
- [[03.01 Promo Session Lifecycle]]
```

Filenames are `Title Case With Spaces.md`. Decisions read best dated:
`2026-09-13 Session Names Keep Their Case.md`.

## After writing

```bash
python scripts/wiki/wiki.py index && python scripts/wiki/wiki.py lint
```

Then link the new page from [[ProductPromo Home]] (or a sibling's `## Related`) so
it is not an orphan — for a legacy departure, also link it from the legacy page it
overrides — and record the session line:

```bash
python scripts/wiki/wiki.py hot --note "saved [[Page Name]] - one-line why"
```

## Rules

- **Never overwrite a primary or legacy-analysis page silently.** It is hand-authored
  knowledge — append a dated section, or ask.
- Write it so it is useful to someone with **no memory of this session**. "Fixed the
  thing we discussed" is worthless in a month.
- One page = one finding. Two unrelated findings = two pages.
