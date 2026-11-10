import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { fetchProductSuppliers, type ProductSupplier, type ProductSupplierListParams } from './productSupplierApi';
import { PRODUCT_SUPPLIER_QK, useProductSupplierMutations } from './useProductSupplierMutations';
import { useProductSupplierColumns } from './useProductSupplierColumns';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { FilterBar, SearchField, SelectFilter } from '@ui/components/common/filters';
import { AsyncCombobox, type AsyncOption } from '@ui/components/common/AsyncCombobox';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { fetchSupplierProductStatuses } from '../suppliers/supplier_product_statuses/supplierProductStatusApi';
import { fetchSuppliers } from '../suppliers/supplier/supplierApi';
import { EMPTY } from '@ui/utils/empty';

const NONE = 0;

export function ProductSupplierCrud() {
    const getString = useString({ str: catalogStrings });
    const [rowToDelete, setRowToDelete] = useState<ProductSupplier | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [supplierId, setSupplierId] = useState(NONE);
    const [supplierLabel, setSupplierLabel] = useState<string | null>(null);
    const [statusId, setStatusId] = useState(NONE);

    const { data: statuses = EMPTY } = useQuery({ queryKey: ['supplier_product_statuses'], queryFn: fetchSupplierProductStatuses, staleTime: Infinity });

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedQ(q); setPaginationModel((p) => ({ ...p, page: 0 })); }, 400);
        return () => clearTimeout(timer);
    }, [q]);

    const filters: ProductSupplierListParams = {
        q: debouncedQ || undefined,
        supplier_id: supplierId || undefined,
        status_id: statusId || undefined,
        page: paginationModel.page,
        page_size: paginationModel.pageSize,
        sort: sortModel[0]?.field,
        order: (sortModel[0]?.sort as 'asc' | 'desc' | null) ?? undefined,
    };

    const { data, isFetching, error } = useQuery({
        queryKey: [...PRODUCT_SUPPLIER_QK, filters],
        queryFn: () => fetchProductSuppliers(filters),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    const { updateMutation, deleteMutation } = useProductSupplierMutations({
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const searchSuppliers = async (query: string): Promise<AsyncOption[]> => {
        const res = await fetchSuppliers({ q: query, page_size: 20 });
        return res.items.map((s) => ({ id: s.id, label: `${s.code} — ${s.name ?? ''}` }));
    };

    const localeText = useDataGridLocale();
    const columns = useProductSupplierColumns({
        getString,
        statuses,
        onStatusChange: (row, value) => updateMutation.mutate({ id: row.id, data: { status_id: value || null } }),
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <CrudPage error={error}
            title={`${cfl(getString('associations'))}${data ? ` (${data.total.toLocaleString()})` : ''}`}
            toolbar={
                <FilterBar>
                    <SearchField className="flex-[2]" label={cfl(getString('search'))} value={q} onChange={setQ}
                        placeholder={`${getString('productCode')} / ${getString('productName')}`} />
                    <AsyncCombobox className="min-w-[220px] flex-1" label={cfl(getString('supplier'))}
                        valueId={supplierId || null} valueLabel={supplierLabel} search={searchSuppliers}
                        placeholder={getString('search')}
                        onChange={(o) => { setSupplierId(o?.id ?? NONE); setSupplierLabel(o?.label ?? null); setPaginationModel((p) => ({ ...p, page: 0 })); }} />
                    <SelectFilter className="flex-1" label={cfl(getString('supplierProductStatus'))} value={statusId}
                        anyLabel={getString('any')} options={statuses.map((s) => ({ id: s.id, label: s.name || s.code }))}
                        onChange={(v) => { setStatusId(v); setPaginationModel((p) => ({ ...p, page: 0 })); }} />
                </FilterBar>
            }
            dialogs={
                <ConfirmDeleteDialog open={!!rowToDelete}
                    label={rowToDelete ? `${rowToDelete.product_code ?? ''} / ${rowToDelete.supplier_code ?? ''}` : undefined}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                    onCancel={() => setRowToDelete(null)} />
            }>
            <DataGrid rows={data?.items ?? EMPTY} columns={columns} rowCount={data?.total ?? 0} loading={isFetching}
                paginationMode="server" sortingMode="server"
                paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                sortModel={sortModel} onSortModelChange={setSortModel} pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick getRowId={(r) => r.id} localeText={localeText} hideFooterSelectedRowCount />
        </CrudPage>
    );
}
