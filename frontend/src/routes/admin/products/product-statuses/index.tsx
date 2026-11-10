import { createFileRoute } from '@tanstack/react-router';
import { ProductStatusCrud } from '../../../../components/admin/products/product_statuses/ProductStatusCrud';

export const Route = createFileRoute('/admin/products/product-statuses/')({
    component: ProductStatusCrud,
});
