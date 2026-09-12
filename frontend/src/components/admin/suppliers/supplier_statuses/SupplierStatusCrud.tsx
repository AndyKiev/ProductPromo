import { LookupCrud, type LookupApi } from '../../lookups/LookupCrud';
import { fetchSupplierStatuses, createSupplierStatus, updateSupplierStatus, deleteSupplierStatus } from './supplierStatusApi';

const api: LookupApi = {
    fetchAll: fetchSupplierStatuses,
    create: (b) => createSupplierStatus({ code: b.code, name: b.name }),
    update: ({ id, data }) => updateSupplierStatus({ id, data: { code: data.code, name: data.name } }),
    remove: deleteSupplierStatus,
};

export function SupplierStatusCrud() {
    return (
        <LookupCrud titleKey="supplierStatuses" entityKey="supplierStatus" queryKey={['supplier_statuses']}
            api={api} secondField="name" secondLabelKey="name" maxSecondLength={64} />
    );
}
