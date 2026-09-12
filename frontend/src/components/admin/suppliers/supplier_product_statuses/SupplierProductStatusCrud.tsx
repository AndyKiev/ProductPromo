import { LookupCrud, type LookupApi } from '../../lookups/LookupCrud';
import {
    fetchSupplierProductStatuses, createSupplierProductStatus, updateSupplierProductStatus, deleteSupplierProductStatus,
} from './supplierProductStatusApi';

const api: LookupApi = {
    fetchAll: fetchSupplierProductStatuses,
    create: (b) => createSupplierProductStatus({ code: b.code, name: b.name }),
    update: ({ id, data }) => updateSupplierProductStatus({ id, data: { code: data.code, name: data.name } }),
    remove: deleteSupplierProductStatus,
};

export function SupplierProductStatusCrud() {
    return (
        <LookupCrud titleKey="supplierProductStatuses" entityKey="supplierProductStatus"
            queryKey={['supplier_product_statuses']} api={api}
            secondField="name" secondLabelKey="name" maxSecondLength={64} />
    );
}
