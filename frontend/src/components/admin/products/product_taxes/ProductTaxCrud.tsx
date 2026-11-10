import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridSortModel } from '@mui/x-data-grid';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { RowActions } from '@ui/components/common/RowActions';
import { FilterBar, SearchField, SelectFilter } from '@ui/components/common/filters';
import { notify, notifyApiError } from '@ui/components/common/notify';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { fetchTaxTypes } from '../tax_types/taxTypeApi';
import { fetchProductTaxes, deleteProductTax, type ProductTax, type ProductTaxListParams } from './productTaxApi';
import { EMPTY } from '@ui/utils/empty';

const PRODUCT_TAX_QK = ['product_taxes'] as const;

export function ProductTaxCrud() {
    const getString = useString({ str: catalogStrings });
    const qc = useQueryClient();
    const [rowToDelete, setRowToDelete] = useState<ProductTax | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [taxTypeId, setTaxTypeId] = useState(0);

    const { data: taxTypes = EMPTY } = useQuery({ queryKey: ['tax_types'], queryFn: fetchTaxTypes, staleTime: Infinity });

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedQ(q); setPaginationModel((p) => ({ ...p, page: 0 })); }, 400);
        return () => clearTimeout(timer);
    }, [q]);

    const filters: ProductTaxListParams = {
        q: debouncedQ || undefined,
        tax_type_id: taxTypeId || undefined,
        page: paginationModel.page,
        page_size: paginationModel.pageSize,
        sort: sortModel[0]?.field,
        order: (sortModel[0]?.sort as 'asc' | 'desc' | null) ?? undefined,
    };
    const { data, isFetching, error } = useQuery({
        queryKey: [...PRODUCT_TAX_QK, filters], queryFn: () => fetchProductTaxes(filters),
        placeholderData: keepPreviousData, staleTime: 30 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProductTax,
        onSuccess: async (res) => {
            await qc.invalidateQueries({ queryKey: PRODUCT_TAX_QK });
            notify(res.detail);
            setRowToDelete(null);
        },
        onError: (err) => notifyApiError(err),
    });

    const localeText = useDataGridLocale();
    const columns: GridColDef<ProductTax>[] = [
        { field: 'product_code', headerName: cfl(getString('productCode')), width: 130, sortable: false, valueGetter: (_v, r) => r.product_code ?? '' },
        { field: 'product_name', headerName: cfl(getString('productName')), flex: 1, minWidth: 220, sortable: false, valueGetter: (_v, r) => r.product_name ?? '' },
        { field: 'tax_type', headerName: cfl(getString('taxType')), width: 160, sortable: false, valueGetter: (_v, r) => r.tax_type_name ?? r.tax_type_code ?? '' },
        { field: 'rate', headerName: cfl(getString('rate')), width: 110, sortable: false, valueGetter: (_v, r) => (r.rate == null ? '' : `${Number(r.rate)}%`) },
        {
            field: '_actions', headerName: '', width: 72, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<ProductTax>) => (
                <RowActions actions={[{ kind: 'delete', onClick: () => setRowToDelete(p.row), disabled: deleteMutation.isPending }]} />
            ),
        },
    ];

    return (
        <CrudPage error={error}
            title={`${cfl(getString('productTaxes'))}${data ? ` (${data.total.toLocaleString()})` : ''}`}
            toolbar={
                <FilterBar>
                    <SearchField className="flex-[2]" label={cfl(getString('search'))} value={q} onChange={setQ}
                        placeholder={`${getString('productCode')} / ${getString('productName')}`} />
                    <SelectFilter className="flex-1" label={cfl(getString('taxType'))} value={taxTypeId}
                        anyLabel={getString('any')} options={taxTypes.map((t) => ({ id: t.id, label: t.name || t.code }))}
                        onChange={(v) => { setTaxTypeId(v); setPaginationModel((p) => ({ ...p, page: 0 })); }} />
                </FilterBar>
            }
            dialogs={
                <ConfirmDeleteDialog open={!!rowToDelete}
                    label={rowToDelete ? `${rowToDelete.product_code ?? ''} / ${rowToDelete.tax_type_code ?? ''}` : undefined}
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
