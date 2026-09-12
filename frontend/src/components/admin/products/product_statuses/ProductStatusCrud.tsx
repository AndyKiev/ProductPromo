import { LookupCrud, type LookupApi } from '../../lookups/LookupCrud';
import { fetchProductStatuses, createProductStatus, updateProductStatus, deleteProductStatus } from './productStatusApi';

const api: LookupApi = {
    fetchAll: fetchProductStatuses,
    create: (b) => createProductStatus({ code: b.code, name: b.name }),
    update: ({ id, data }) => updateProductStatus({ id, data: { code: data.code, name: data.name } }),
    remove: deleteProductStatus,
};

export function ProductStatusCrud() {
    return (
        <LookupCrud titleKey="productStatuses" entityKey="productStatus" queryKey={['product_statuses']}
            api={api} secondField="name" secondLabelKey="name" maxSecondLength={64} />
    );
}
