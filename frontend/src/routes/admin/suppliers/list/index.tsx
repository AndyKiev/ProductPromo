import { createFileRoute } from '@tanstack/react-router';
import { SupplierCrud } from '../../../../components/admin/suppliers/supplier/SupplierCrud';

export const Route = createFileRoute('/admin/suppliers/list/')({
    component: SupplierCrud,
});
