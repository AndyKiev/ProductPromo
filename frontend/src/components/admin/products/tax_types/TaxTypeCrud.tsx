import { LookupCrud, type LookupApi } from '../../lookups/LookupCrud';
import { fetchTaxTypes, createTaxType, updateTaxType, deleteTaxType } from './taxTypeApi';

const api: LookupApi = {
    fetchAll: fetchTaxTypes,
    create: (b) => createTaxType({ code: b.code, name: b.name }),
    update: ({ id, data }) => updateTaxType({ id, data: { code: data.code, name: data.name } }),
    remove: deleteTaxType,
};

export function TaxTypeCrud() {
    return (
        <LookupCrud titleKey="taxTypes" entityKey="taxType" queryKey={['tax_types']}
            api={api} secondField="name" secondLabelKey="name" maxSecondLength={64} />
    );
}
