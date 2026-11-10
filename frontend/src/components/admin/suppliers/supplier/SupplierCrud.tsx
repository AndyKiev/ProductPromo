import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { fetchSuppliers, type Supplier, type SupplierListParams } from './supplierApi';
import { SUPPLIER_QK, useSupplierMutations } from './useSupplierMutations';
import { useSupplierColumns } from './useSupplierColumns';
import { SupplierForm } from './SupplierForm';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { FilterBar, SearchField, SelectFilter } from '@ui/components/common/filters';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { fetchSupplierStatuses } from '../supplier_statuses/supplierStatusApi';
import { EMPTY } from '@ui/utils/empty';

export function SupplierCrud() {
    const getString = useString({ str: catalogStrings });
    const [form, setForm] = useState<{ key: number; editing: Supplier | null } | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Supplier | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [statusId, setStatusId] = useState(0);

    const { data: statuses = EMPTY } = useQuery({ queryKey: ['supplier_statuses'], queryFn: fetchSupplierStatuses, staleTime: Infinity });

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedQ(q); setPaginationModel((p) => ({ ...p, page: 0 })); }, 400);
        return () => clearTimeout(timer);
    }, [q]);

    const filters: SupplierListParams = {
        q: debouncedQ || undefined,
        status_id: statusId || undefined,
        page: paginationModel.page,
        page_size: paginationModel.pageSize,
        sort: sortModel[0]?.field,
        order: (sortModel[0]?.sort as 'asc' | 'desc' | null) ?? undefined,
    };
    const { data, isFetching, error } = useQuery({
        queryKey: [...SUPPLIER_QK, filters], queryFn: () => fetchSuppliers(filters),
        placeholderData: keepPreviousData, staleTime: 30 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useSupplierMutations({
        onCreateSuccess: () => setForm(null),
        onUpdateSuccess: () => setForm(null),
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useSupplierColumns({
        getString,
        onEdit: (row) => setForm({ key: Date.now(), editing: row }),
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <CrudPage error={error}
            title={`${cfl(getString('suppliers'))}${data ? ` (${data.total.toLocaleString()})` : ''}`}
            onAdd={() => setForm({ key: Date.now(), editing: null })}
            toolbar={
                <FilterBar>
                    <SearchField className="flex-[2]" label={cfl(getString('search'))} value={q} onChange={setQ}
                        placeholder={`${getString('supplierCode')} / ${getString('supplierName')}`} />
                    <SelectFilter className="flex-1" label={cfl(getString('supplierStatus'))} value={statusId}
                        anyLabel={getString('any')} options={statuses.map((s) => ({ id: s.id, label: s.name || s.code }))}
                        onChange={(v) => { setStatusId(v); setPaginationModel((p) => ({ ...p, page: 0 })); }} />
                </FilterBar>
            }
            dialogs={<>
                {form && <SupplierForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
                    createMutation={createMutation} updateMutation={updateMutation} />}
                <ConfirmDeleteDialog open={!!rowToDelete} label={rowToDelete?.code}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                    onCancel={() => setRowToDelete(null)} />
            </>}>
            <DataGrid rows={data?.items ?? EMPTY} columns={columns} rowCount={data?.total ?? 0} loading={isFetching}
                paginationMode="server" sortingMode="server"
                paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                sortModel={sortModel} onSortModelChange={setSortModel} pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick getRowId={(r) => r.id} localeText={localeText} hideFooterSelectedRowCount />
        </CrudPage>
    );
}
