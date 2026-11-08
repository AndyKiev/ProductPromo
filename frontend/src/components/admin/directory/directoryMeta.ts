// Derives a directory's endpoints and field rules from the backend OpenAPI
// document at runtime, so configs carry no field lists, lengths or flags.
// Compile-time safety comes from schema.gen.ts (see directories.ts).
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export type FieldKind = 'text' | 'number' | 'boolean' | 'select';

export interface FieldMeta {
    name: string;
    kind: FieldKind;
    required: boolean;   // listed in the Create schema's `required`
    nullable: boolean;   // `anyOf: [..., {type: null}]`
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    editable: boolean;   // present in the Update schema
    lookup?: string;     // `x-lookup` on the Pydantic Field: collection path of the referenced directory
}

export interface DirectoryMeta {
    itemPath: string;    // e.g. /api/v1/promo-types/{item_id}
    itemParam: string;   // e.g. item_id
    columns: string[];   // Read schema properties except `id`, in schema order
    fields: Record<string, FieldMeta>;   // form fields (Create schema)
}

interface JsonSchema {
    type?: string;
    $ref?: string;
    anyOf?: JsonSchema[];
    items?: JsonSchema;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    'x-lookup'?: string;
}
interface OpenApiDoc {
    paths: Record<string, Record<string, {
        requestBody?: { content: Record<string, { schema: JsonSchema }> };
        responses?: Record<string, { content?: Record<string, { schema: JsonSchema }> }>;
    }>>;
    components: { schemas: Record<string, JsonSchema> };
}

const API_ROOT = import.meta.env.VITE_BACKEND_API_URL ?? '';

export function useOpenApi() {
    return useQuery({
        queryKey: ['openapi'],
        queryFn: async () => (await axios.get<OpenApiDoc>(`${API_ROOT}/openapi.json`)).data,
        staleTime: Infinity,
    });
}

const refName = (s?: JsonSchema) => s?.$ref?.split('/').pop();

function schemaOf(doc: OpenApiDoc, s?: JsonSchema): JsonSchema | undefined {
    const name = refName(s);
    return name ? doc.components.schemas[name] : s;
}

function kindOf(t?: string): FieldKind {
    if (t === 'integer' || t === 'number') return 'number';
    if (t === 'boolean') return 'boolean';
    return 'text';
}

export function buildDirectoryMeta(doc: OpenApiDoc, path: string): DirectoryMeta {
    const coll = doc.paths[path];
    if (!coll?.get || !coll.post) throw new Error(`${path}: no list/create endpoints in OpenAPI`);
    const itemPath = Object.keys(doc.paths).find((p) => new RegExp(`^${path}/\\{\\w+\\}$`).test(p));
    if (!itemPath) throw new Error(`${path}: no item endpoint in OpenAPI`);
    const itemParam = itemPath.slice(path.length + 2, -1);

    const listSchema = coll.get.responses?.['200']?.content?.['application/json']?.schema;
    const read = schemaOf(doc, listSchema?.items);
    const create = schemaOf(doc, coll.post.requestBody?.content['application/json']?.schema);
    const update = schemaOf(doc, doc.paths[itemPath].patch?.requestBody?.content['application/json']?.schema);
    if (!read || !create) throw new Error(`${path}: list/create schemas not found`);

    const required = new Set(create.required ?? []);
    const fields: Record<string, FieldMeta> = {};
    for (const [name, prop] of Object.entries(create.properties ?? {})) {
        const variants = prop.anyOf ?? [prop];
        const value = variants.find((v) => v.type !== 'null') ?? prop;
        const lookup = prop['x-lookup'];
        fields[name] = {
            name,
            kind: lookup ? 'select' : kindOf(value.type),
            lookup,
            required: required.has(name),
            nullable: variants.some((v) => v.type === 'null'),
            maxLength: value.maxLength,
            min: value.minimum,
            max: value.maximum,
            pattern: value.pattern,
            editable: !!update?.properties?.[name],
        };
    }
    const columns = Object.keys(read.properties ?? {}).filter((c) => c !== 'id');
    return { itemPath, itemParam, columns, fields };
}
