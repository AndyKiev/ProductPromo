---
name: wiki-lint
description: Health-check the ProductPromo Obsidian vault (LLM_OBSIDIAN_VAULT) — dead wikilinks, ambiguous page names, empty stubs, orphan pages — and repair the findings. Use when asked "is the vault healthy", "fix the broken links", after any /wiki-ingest or /wiki-save batch, or when Obsidian shows unresolved links in the graph.
---

# Wiki lint

```bash
python scripts/wiki/wiki.py lint
```

Exit 0 = clean, 1 = findings, 2 = vault not found/`LLM_OBSIDIAN_VAULT` unset.
`--soft` always exits 0 (for hooks).

## The five findings and what each means

| Finding | Meaning | Fix |
|---|---|---|
| **DEAD LINKS** | `[[X]]` with no page `X` | Either write the page (`/wiki-ingest` if derived, `/wiki-save` if primary), or drop the link. A planned-but-unwritten link is fine short-term — it is the vault's own to-do list. |
| **AMBIGUOUS** | Same filename in two folders | Obsidian picks one by basename; the other silently becomes unreachable. **Rename one** — never leave it. |
| **STUBS** | Body under 40 chars | Fill it or delete it. An empty page is worse than a dead link: the link resolves, the reader gets nothing. |
| **ORPHANS** | No inbound link | Link it from [[ProductPromo Home]] or a sibling's `## Related`. Root-level pages (the numbered legacy analysis) and `index.md`/`hot.md` are exempt — so a new root page is never reported; put new pages in folders. |
| **FOLDER REFS** | `[[Folder/]]` placeholders | Not real links. Replace with links to actual pages once the folder has content. |

## Repair order

1. Ambiguous first — it hides pages and distorts every other count.
2. Stubs — fill or delete.
3. Dead links — write the page, or remove the link.
4. Orphans — link them in.
5. Re-run lint, then `python scripts/wiki/wiki.py index`.

## Rules

- Never "fix" a dead link by deleting a wanted page reference just to get a clean
  report. The report is a map of gaps, not a score.
- Deleting any page is the user's call unless it is a provable defect (empty file,
  exact duplicate). Ask. This includes Obsidian's default welcome note
  `Добро пожаловать.md`, whose `[[создайте ссылку]]` is the known dead link.
- Run lint after every ingest/save batch — that is the checkpoint that keeps the
  graph connected.
