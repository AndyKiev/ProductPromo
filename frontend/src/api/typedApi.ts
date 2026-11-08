// Type-safe calls over the shared axios instance (auth refresh, X-Lang-Id and
// translated errors stay in axiosInstance). Paths, bodies and responses come
// from `schema.gen.ts`, generated from the backend OpenAPI by `npm run gen:api`.
import { axiosInstance } from './axiosInstance';
import type { components, paths } from './schema.gen';

export type Schemas = components['schemas'];
export type ApiPath = keyof paths;
type Method = 'get' | 'post' | 'patch' | 'delete';

type Op<P extends ApiPath, M extends Method> = NonNullable<paths[P][M]>;
/** Paths that declare the given method. */
export type PathWith<M extends Method> = { [P in ApiPath]: [Op<P, M>] extends [never] ? never : P }[ApiPath];

type Json<C> = C extends { content: { 'application/json': infer T } } ? T : never;
export type ResponseOf<P extends ApiPath, M extends Method> =
    Op<P, M> extends { responses: infer R } ? Json<R[200 & keyof R]> | Json<R[201 & keyof R]> : never;
export type BodyOf<P extends ApiPath, M extends Method> =
    Op<P, M> extends { requestBody?: infer B } ? Json<NonNullable<B>> : never;
type PathParamsOf<P extends ApiPath, M extends Method> =
    Op<P, M> extends { parameters: { path: infer PP } } ? PP : never;

type Args<P extends ApiPath, M extends Method> =
    ([PathParamsOf<P, M>] extends [never] ? { path?: undefined } : { path: PathParamsOf<P, M> })
    & ([BodyOf<P, M>] extends [never] ? { body?: undefined } : { body: BodyOf<P, M> })
    & { query?: Record<string, unknown> };

const API_ROOT = import.meta.env.VITE_BACKEND_API_URL ?? '';

function url(path: string, params?: Record<string, unknown>): string {
    const filled = path.replace(/\{(\w+)\}/g, (_, k: string) => encodeURIComponent(String(params?.[k])));
    return `${API_ROOT}${filled}`;
}

async function call<M extends Method, P extends PathWith<M>>(method: M, path: P, args?: Args<P, M>): Promise<ResponseOf<P, M>> {
    const res = await axiosInstance.request<ResponseOf<P, M>>({
        method, url: url(path, args?.path as Record<string, unknown>), data: args?.body, params: args?.query,
    });
    return res.data;
}

export const api = {
    get: <P extends PathWith<'get'>>(path: P, args?: Args<P, 'get'>) => call('get', path, args),
    post: <P extends PathWith<'post'>>(path: P, args: Args<P, 'post'>) => call('post', path, args),
    patch: <P extends PathWith<'patch'>>(path: P, args: Args<P, 'patch'>) => call('patch', path, args),
    delete: <P extends PathWith<'delete'>>(path: P, args: Args<P, 'delete'>) => call('delete', path, args),
};
