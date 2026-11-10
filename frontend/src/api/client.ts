// Typed client of this app's backend; paths and shapes come from catalog.gen.ts (`npm run gen:api`).
import { createTypedApi } from '@ui/api/typedApi';
import type { paths } from './catalog.gen';

export type { paths };
export const api = createTypedApi<paths>();
