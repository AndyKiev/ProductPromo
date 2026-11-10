import { createFileRoute } from '@tanstack/react-router';
import { TaxRateCrud } from '../../../../components/admin/products/tax_rates/TaxRateCrud';

export const Route = createFileRoute('/admin/products/tax-rates/')({
    component: TaxRateCrud,
});
