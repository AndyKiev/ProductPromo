// Directory definitions. Only the collection path is required: endpoints,
// fields, lengths and required flags are derived from OpenAPI (directoryMeta).
// The path and `columns` are checked against schema.gen.ts at compile time.
import type { PathWith, ResponseOf } from '../../../api/typedApi';

type ItemPathOf<P extends string> = Extract<PathWith<'patch'> & PathWith<'delete'>, `${P}/{${string}}`>;

/** Paths with list + create and an item path with update + delete — i.e. a full CRUD resource. */
export type CollectionPath = {
    [P in PathWith<'get'> & PathWith<'post'>]: [ItemPathOf<P>] extends [never] ? never : P
}[PathWith<'get'> & PathWith<'post'>];

export type RowOf<P extends CollectionPath> = ResponseOf<P, 'get'> extends (infer R)[] ? R : never;

export interface DirectoryDef {
    /** URL segment, e.g. `promo-types`. */
    key: string;
    path: CollectionPath;
    /** i18n keys: plural (tab/title) and singular (dialog). */
    titleKey: string;
    entityKey: string;
    columns?: string[];
}

const camel = (s: string) => s.replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase());

/**
 * `directory('/api/v1/promo-types')` → key `promo-types`, i18n `promoTypes` / `promoType`.
 * Override `entityKey` when the singular is not "plural minus s" (e.g. categories).
 */
export function directory<P extends CollectionPath>(
    path: P,
    opts: { columns?: Exclude<keyof RowOf<P> & string, 'id'>[]; entityKey?: string } = {},
): DirectoryDef {
    const key = path.split('/').pop()!;
    const titleKey = camel(key);
    return { key, path, titleKey, entityKey: opts.entityKey ?? titleKey.replace(/s$/, ''), columns: opts.columns };
}

export { camel };
