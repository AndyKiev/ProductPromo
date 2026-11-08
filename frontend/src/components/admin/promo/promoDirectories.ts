// Promo lookups. One line per directory: everything else comes from OpenAPI.
import { directory } from '../directory/directory';

export const promoDirectories = [
    directory('/api/v1/promo-types'),
    directory('/api/v1/promo-subtypes'),
    directory('/api/v1/promo-type-subtypes'),
];
