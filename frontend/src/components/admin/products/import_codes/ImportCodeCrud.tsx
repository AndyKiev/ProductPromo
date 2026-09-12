import { LookupCrud, type LookupApi } from '../../lookups/LookupCrud';
import { fetchImportCodes, createImportCode, updateImportCode, deleteImportCode } from './importCodeApi';

const api: LookupApi = {
    fetchAll: fetchImportCodes,
    create: (b) => createImportCode({ code: b.code, description: b.description }),
    update: ({ id, data }) => updateImportCode({ id, data: { code: data.code, description: data.description } }),
    remove: deleteImportCode,
};

export function ImportCodeCrud() {
    return (
        <LookupCrud titleKey="importCodes" entityKey="importCode" queryKey={['import_codes']}
            api={api} secondField="description" secondLabelKey="description" maxSecondLength={255} codeMaxLength={20} />
    );
}
