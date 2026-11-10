import { createFileRoute } from '@tanstack/react-router';
import { ProductSupplierCrud } from '../../../../components/admin/associations/ProductSupplierCrud';

export const Route = createFileRoute('/admin/suppliers/associations/')({
    component: ProductSupplierCrud,
});
