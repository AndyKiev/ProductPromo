import { createFileRoute } from '@tanstack/react-router';
import { ImportCodeCrud } from '../../../../components/admin/products/import_codes/ImportCodeCrud';

export const Route = createFileRoute('/admin/products/import-codes/')({
    component: ImportCodeCrud,
});
