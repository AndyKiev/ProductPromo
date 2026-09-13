import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Alert, Box, MenuItem, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { fetchProductSuppliers, type ProductSupplier, type ProductSupplierListParams } from './productSupplierApi';
import { PRODUCT_SUPPLIER_QK, useProductSupplierMutations } from './useProductSupplierMutations';
import { useProductSupplierColumns } from './useProductSupplierColumns';
import { DeleteConfirmDialog } from '../nomenclature/_shared/DeleteConfirmDialog';
import { AsyncAutocomplete, type AsyncOption } from '../nomenclature/_shared/AsyncAutocomplete';
import { useDataGridLocale } from '../../../hooks/useDataGridLocale';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import catalogStrings from '../catalogStrings';
import { fetchSupplierProductStatuses } from '../suppliers/supplier_product_statuses/supplierProductStatusApi';
import { fetchSuppliers } from '../suppliers/supplier/supplierApi';

const NONE = 0;

export function ProductSupplierCrud() {
    const getString = useString({ str: catalogStrings });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [rowToDelete, setRowToDelete] = useState<ProductSupplier | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [supplierId, setSupplierId] = useState(NONE);
    const [supplierLabel, setSupplierLabel] = useState<string | null>(null);
    const [statusId, setStatusId] = useState(NONE);

    const { data: statuses = [] } = useQuery({ queryKey: ['supplier_product_statuses'], queryFn: fetchSupplierProductStatuses, staleTime: Infinity });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQ(q), 400);
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
        setSnackbar,
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
        <Box className="admin-crud">
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                {cfl(getString('associations'))}
                {data ? ` (${data.total.toLocaleString()})` : ''}
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField size="small" label={cfl(getString('search')) || 'search'} sx={{ minWidth: 260, flex: 2 }}
                        value={q} onChange={(e) => setQ(e.target.value)}
                        placeholder={`${getString('productCode')} / ${getString('productName')}`} />
                    <AsyncAutocomplete
                        label={cfl(getString('supplier')) || 'supplier'}
                        valueId={supplierId || null}
                        valueLabel={supplierLabel}
                        onChange={(o) => { setSupplierId(o?.id ?? NONE); setSupplierLabel(o?.label ?? null); setPaginationModel((p) => ({ ...p, page: 0 })); }}
                        search={searchSuppliers}
                        placeholder={getString('search')}
                        sx={{ minWidth: 220, flex: 1 }}
                    />
                    <TextField select size="small" label={cfl(getString('supplierProductStatus')) || 'status'} sx={{ minWidth: 200, flex: 1 }}
                        value={statusId} onChange={(e) => { setStatusId(Number(e.target.value)); setPaginationModel((p) => ({ ...p, page: 0 })); }}>
                        <MenuItem value={NONE}>{getString('any')}</MenuItem>
                        {statuses.map((s) => <MenuItem key={s.id} value={s.id}>{s.name || s.code}</MenuItem>)}
                    </TextField>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

            <Paper className="admin-data-grid-paper" elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <DataGrid
                    rows={data?.items ?? []}
                    columns={columns}
                    rowCount={data?.total ?? 0}
                    loading={isFetching}
                    paginationMode="server"
                    sortingMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    getRowId={(r) => r.id}
                    localeText={localeText}
                    hideFooterSelectedRowCount
                    sx={{ minHeight: 0 }}
                />
            </Paper>

            <DeleteConfirmDialog open={!!rowToDelete}
                label={rowToDelete ? `${rowToDelete.product_code ?? ''} / ${rowToDelete.supplier_code ?? ''}` : undefined}
                isPending={deleteMutation.isPending}
                onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                onCancel={() => setRowToDelete(null)} />

            <Snackbar open={snackbar.open} autoHideDuration={6000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
