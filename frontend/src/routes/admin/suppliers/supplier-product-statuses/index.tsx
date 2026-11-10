import { createFileRoute } from '@tanstack/react-router';
import { SupplierProductStatusCrud } from '../../../../components/admin/suppliers/supplier_product_statuses/SupplierProductStatusCrud';

export const Route = createFileRoute('/admin/suppliers/supplier-product-statuses/')({
    component: SupplierProductStatusCrud,
});
