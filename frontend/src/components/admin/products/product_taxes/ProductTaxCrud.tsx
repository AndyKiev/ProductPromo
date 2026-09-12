import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, IconButton, MenuItem, Paper, Snackbar, TextField, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridSortModel } from '@mui/x-data-grid';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import { useDataGridLocale } from '../../../../hooks/useDataGridLocale';
import catalogStrings from '../../catalogStrings';
import { DeleteConfirmDialog } from '../../nomenclature/_shared/DeleteConfirmDialog';
import { fetchTaxTypes } from '../tax_types/taxTypeApi';
import {
    fetchProductTaxes, deleteProductTax, type ProductTax, type ProductTaxListParams,
} from './productTaxApi';

const PRODUCT_TAX_QK = ['product_taxes'] as const;
const NONE = 0;

export function ProductTaxCrud() {
    const getString = useString({ str: catalogStrings });
    const qc = useQueryClient();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [rowToDelete, setRowToDelete] = useState<ProductTax | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [taxTypeId, setTaxTypeId] = useState(NONE);

    const { data: taxTypes = [] } = useQuery({ queryKey: ['tax_types'], queryFn: fetchTaxTypes, staleTime: Infinity });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQ(q), 400);
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
        queryKey: [...PRODUCT_TAX_QK, filters],
        queryFn: () => fetchProductTaxes(filters),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProductTax,
        onSuccess: async (res) => {
            await qc.invalidateQueries({ queryKey: PRODUCT_TAX_QK });
            setSnackbar({ open: true, message: res.detail, severity: 'success' });
            setRowToDelete(null);
        },
        onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
    });

    const localeText = useDataGridLocale();
    const columns: GridColDef[] = [
        { field: 'product_code', headerName: cfl(getString('productCode')) || 'code', width: 130, sortable: false, valueGetter: (_v, r: ProductTax) => r.product_code ?? '' },
        { field: 'product_name', headerName: cfl(getString('productName')) || 'name', flex: 1, minWidth: 220, sortable: false, valueGetter: (_v, r: ProductTax) => r.product_name ?? '' },
        { field: 'tax_type', headerName: cfl(getString('taxType')) || 'tax type', width: 160, sortable: false, valueGetter: (_v, r: ProductTax) => r.tax_type_name ?? r.tax_type_code ?? '' },
        { field: 'rate', headerName: cfl(getString('rate')) || 'rate', width: 110, sortable: false, valueGetter: (_v, r: ProductTax) => (r.rate == null ? '' : `${r.rate}%`) },
        {
            field: '_actions', headerName: '', width: 72, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<ProductTax>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('delete') || 'Delete'}>
                        <span><IconButton size="small" color="error" onClick={() => setRowToDelete(p.row)}
                            disabled={deleteMutation.isPending}><DeleteIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                {cfl(getString('productTaxes'))}
                {data ? ` (${data.total.toLocaleString()})` : ''}
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField size="small" label={cfl(getString('search')) || 'search'} sx={{ minWidth: 260, flex: 2 }}
                        value={q} onChange={(e) => setQ(e.target.value)}
                        placeholder={`${getString('productCode')} / ${getString('productName')}`} />
                    <TextField select size="small" label={cfl(getString('taxType')) || 'tax type'} sx={{ minWidth: 200, flex: 1 }}
                        value={taxTypeId} onChange={(e) => { setTaxTypeId(Number(e.target.value)); setPaginationModel((p) => ({ ...p, page: 0 })); }}>
                        <MenuItem value={NONE}>{getString('any')}</MenuItem>
                        {taxTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name || t.code}</MenuItem>)}
                    </TextField>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
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
                    sx={{ minHeight: 420 }}
                />
            </Paper>

            <DeleteConfirmDialog open={!!rowToDelete}
                label={rowToDelete ? `${rowToDelete.product_code ?? ''} / ${rowToDelete.tax_type_code ?? ''}` : undefined}
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
