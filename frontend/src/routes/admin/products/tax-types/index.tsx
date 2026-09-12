import { createFileRoute } from '@tanstack/react-router';
import { TaxTypeCrud } from '../../../../components/admin/products/tax_types/TaxTypeCrud';

export const Route = createFileRoute('/admin/products/tax-types/')({
    component: TaxTypeCrud,
});
