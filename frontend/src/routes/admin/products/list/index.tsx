import { createFileRoute } from '@tanstack/react-router';
import { ProductCrud } from '../../../../components/admin/products/product/ProductCrud';

export const Route = createFileRoute('/admin/products/list/')({
    component: ProductCrud,
});
