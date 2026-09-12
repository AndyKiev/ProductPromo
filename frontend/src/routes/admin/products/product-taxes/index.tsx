import { createFileRoute } from '@tanstack/react-router';
import { ProductTaxCrud } from '../../../../components/admin/products/product_taxes/ProductTaxCrud';

export const Route = createFileRoute('/admin/products/product-taxes/')({
    component: ProductTaxCrud,
});
