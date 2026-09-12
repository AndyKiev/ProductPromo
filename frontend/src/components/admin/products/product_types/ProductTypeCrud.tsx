import { LookupCrud, type LookupApi } from '../../lookups/LookupCrud';
import { fetchProductTypes, createProductType, updateProductType, deleteProductType } from './productTypeApi';

const api: LookupApi = {
    fetchAll: fetchProductTypes,
    create: (b) => createProductType({ code: b.code, name: b.name }),
    update: ({ id, data }) => updateProductType({ id, data: { code: data.code, name: data.name } }),
    remove: deleteProductType,
};

export function ProductTypeCrud() {
    return (
        <LookupCrud titleKey="productTypes" entityKey="productType" queryKey={['product_types']}
            api={api} secondField="name" secondLabelKey="name" maxSecondLength={128} codeMaxLength={16} />
    );
}
