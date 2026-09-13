---
name: wiki-query
description: Answer a question from the ProductPromo Obsidian vault (LLM_OBSIDIAN_VAULT) with citations — read hot.md, then index.md, then only the pages that matter. Use when the user asks "what do we know about X", "how did the legacy VBA app do X", "check the vault", "did we decide this already", "why is it done this way", or before building a feature the legacy analysis already specifies.
---

# Wiki query

Answer from the vault, cheaply, with citations.

## Retrieval ladder — stop as soon as you can answer

1. **`hot.md`** — the last few sessions. Often already holds the answer. Read it
   explicitly (`python scripts/wiki/wiki.py hot --print`): the SessionStart hook
   that would preload it is not installed yet, so nothing puts it in context for you.
2. **`index.md`** — the catalog. Pick candidate pages by title + one-line summary.
   For legacy-behaviour questions, [[ProductPromo Home]] is the faster map.
3. **The pages themselves** — read fully, then follow their `## Related` / inline
   links one hop if the answer is incomplete. Legacy pages are long (`02 Data Model`
   is ~16 KB) — grep inside them for the table or function name rather than reading
   several whole.
4. **Grep the vault** when the index gives nothing:

```bash
grep -rin "search term" "$LLM_OBSIDIAN_VAULT" --include="*.md"
```

**Scaling rule.** `index.md` grows linearly. Past roughly **150 pages** reading it
whole costs more than the answer is worth — from there, **grep first** and use the
index only to orient.

Do **not** read every page. The ladder exists so a question costs three files, not thirty.

## Answering

- **Cite the page**: "per [[03.03 Upload Validation Rules]]". Legacy pages name the
  VBA function they came from (`aPromoBeryBilshe.bas → fArticleToPromoParametersVerified`)
  — pass that on when precision matters. If the claim came from a derived page, the
  repo file in its `source:` frontmatter is the real authority.
- **Legacy vs new app.** A legacy page says how the *old* system behaved, not how this
  repo must. Check `Decisions/` for a recorded departure before treating it as a
  requirement, and say which one you are describing.
- **⚠️ marks** mean the legacy code was ambiguous — check [[07 Open Questions]] and
  report the uncertainty instead of picking an interpretation silently.
- **Say when the vault is silent.** "Nothing in the vault on this" is a correct and
  useful answer, and it flags a gap. Never fill silence from general knowledge and
  present it as project knowledge.
- **Derived page vs code disagreement**: the code wins. Report the drift and offer
  to re-run `/wiki-ingest` for that page.
- If the question was worth asking and the answer was **not** in the vault, that is
  a signal — offer `/wiki-save` once you have worked it out.
