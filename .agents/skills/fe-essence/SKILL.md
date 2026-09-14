---
name: fe-essence
description: Scaffold a full FRONTEND CRUD slice for an essence in ProductPromo — TanStack Query api module, MUI DataGrid list page, react-hook-form + zod form, mutations hook, and optional server-side pagination. Use when adding a new admin/editable entity screen to the React + MUI frontend. Pairs with /be-essence (backend).
---

# Frontend essence scaffold

Mirror the canonical reference: **`frontend/src/components/admin/nomenclature/category/`**
(api, mutations, columns, Crud, Form). Read those files for exact style before generating.
Folder: `frontend/src/components/admin/<area>/<entity>/` (snake_case folder, PascalCase
components).

## Files

| File | Role |
|---|---|
| `<entity>Api.ts` | axios calls + TS interfaces |
| `use<Entity>Mutations.ts` | TanStack create/update/delete mutations + exported `<ENTITY>_QK` |
| `use<Entity>Columns.tsx` | `GridColDef[]` with an actions column |
| `<Entity>Crud.tsx` | `useQuery` + `<DataGrid/>` + snackbar + dialogs |
| `<Entity>Form.tsx` | RHF + zod create/edit dialog |
| `<entity>Strings.ts` | optional feature-static strings (see below) |

## Conventions (must match)

- **Api**: `import { axiosInstance } from '../../../../api/axiosInstance'` and
  `import { BASE_URL } from '../../../../utils/eNums'`; `const BASE = \`${BASE_URL}/<path>\``.
  Export interfaces `<Entity>`, `<Entity>Create`, `<Entity>Update`, and
  `MutationResponse<T> = { detail: string; data: T }` for writes.
  GET list returns a bare `T[]`, a single object, or `Page<T> = { items: T[]; total: number }`.
- **Query keys**: export `<ENTITY>_QK = ['<entities>'] as const` from `use<Entity>Mutations.ts`
  and import it in `Crud`. Include filter params in the key when the query is parameterised
  (e.g. `[..., segmentId]`).
- **Mutations**: every `useMutation` does `qc.invalidateQueries({ queryKey: <ENTITY>_QK })`,
  shows `res.detail` in the snackbar, and calls optional `on*Success` / `onError`.
  Error text comes from `err.message` (the axios interceptor unwraps `{detail}`).
- **Columns**: `GridColDef[]`; header labels via `cfl(getString('key'))`; last column is an
  actions cell with edit/delete `IconButton`s disabled while `actionsPending`.
- **Crud**: `useQuery({ queryKey, queryFn, staleTime: 2 * 60 * 1000 })` → `<DataGrid/>`;
  manages `snackbar`, `formOpen`, `editing`, `rowToDelete`, `paginationModel`; uses
  `useDataGridLocale()` and `getRowId={(r) => r.id}`.
- **Form**: `react-hook-form` + `zodResolver` (`zod/v4`); validation messages are **string
  keys** resolved with `getString(errors.x.message)`; `mode: 'onSubmit'`; `reset()` inside a
  `useEffect` keyed on `[editing, open]`. Every MUI `<Select>` (rendered as `<TextField
  select>`) must pass an explicit `select` prop and `onChange={(e) => field.onChange(Number(e.target.value))}`.
- **Strings**: use `useString()` from `hooks/useString`; wrap titles with `cfl`.
  Add English (`eng`) and Russian (`rus`) texts to `backend/backend/api_v1/msg/ui.json`;
  run `node scripts/sync_i18n.mjs` to refresh the frontend fallback, then `make init-db`.
  Existing feature `*Strings.ts` files re-export the shared fallback. Use `${name}` for
  parameters. DB translations take precedence. Never hardcode visible labels/errors.
- **Language**: the account persists `lang_id`; `LanguageProvider` loads the profile and
  the catalog. `LanguageSelect` uses dynamic IDs from `/langs`, saves the profile before
  switching the UI, and invalidates data queries so localized lookup names update.
  Do not hardcode language IDs or copy translations into a second independent catalog.
- **API messages**: preserve `{ detail, data, message_key, params, lang_id }`.
  `ApiError` retains message metadata. Always use `useDataGridLocale()` for tables.
- **Lookups from other essences**: fetch with `useQuery` and reuse the sibling `*Api.ts`
  call (e.g. `fetchSegments`). For very large lookups use `AsyncAutocomplete`
  (`components/admin/nomenclature/_shared/AsyncAutocomplete.tsx`) with a server-side `search`.
- **No `any`**: never use the TypeScript `any` type. Define an interface/type instead.

## Server-side pagination (large tables)

When the row count is large (tens of thousands+), use MUI server mode:

```tsx
const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
const { data, isFetching } = useQuery({
    queryKey: [...PRODUCT_QK, paginationModel, filters],
    queryFn: () => fetchProducts({ page: paginationModel.page, page_size: paginationModel.pageSize, ...filters }),
    placeholderData: keepPreviousData,
});
<DataGrid
    rows={data?.items ?? []}
    rowCount={data?.total ?? 0}
    loading={isFetching}
    paginationMode="server"
    sortingMode="server"
    paginationModel={paginationModel}
    onPaginationModelChange={setPaginationModel}
    pageSizeOptions={[10, 25, 50, 100]}
/>
```
Keep the API `page` 0-based (MUI's model is 0-based) and send `page_size`. Only mark columns
sortable when the backend supports the field.

## Wiring

1. **Route**: add a TanStack file route under `frontend/src/routes/admin/...` pointing at the
   `Crud`/Page component. `routeTree.gen.ts` regenerates on `npm run dev` / `npm run build`.
2. **Nav**: add a nav button in `components/layout/AppShell.tsx` (or a `Tabs` entry in the
   area's `route.tsx` layout) using `getString`/`cfl`.

## Output to the user

- File tree of the new folder.
- The route path and any `AppShell`/`Tabs` entry added.
- New English/Russian message keys seeded in the DB and synced to the frontend fallback.
