import { createFileRoute } from '@tanstack/react-router';
import { ProductTypeCrud } from '../../../../components/admin/products/product_types/ProductTypeCrud';

export const Route = createFileRoute('/admin/products/product-types/')({
    component: ProductTypeCrud,
});
