import { createFileRoute } from '@tanstack/react-router';
import { SupplierStatusCrud } from '../../../../components/admin/suppliers/supplier_statuses/SupplierStatusCrud';

export const Route = createFileRoute('/admin/suppliers/supplier-statuses/')({
    component: SupplierStatusCrud,
});
