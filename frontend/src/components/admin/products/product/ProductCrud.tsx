import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Paper, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { fetchProducts, type Product, type ProductListParams } from './productApi';
import { PRODUCT_QK, useProductMutations } from './useProductMutations';
import { useProductColumns } from './useProductColumns';
import { ProductForm } from './ProductForm';
import { ProductFilters } from './ProductFilters';
import { ProductCardModal } from './ProductCardModal';
import { DeleteConfirmDialog } from '../../nomenclature/_shared/DeleteConfirmDialog';
import { useDataGridLocale } from '../../../../hooks/useDataGridLocale';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../catalogStrings';

export function ProductCrud() {
    const getString = useString({ str: catalogStrings });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [cardProduct, setCardProduct] = useState<Product | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Product | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filters, setFilters] = useState<ProductListParams>({});

    const { data, isFetching, error } = useQuery({
        queryKey: [...PRODUCT_QK, paginationModel, sortModel, filters],
        queryFn: () => fetchProducts({
            ...filters,
            page: paginationModel.page,
            page_size: paginationModel.pageSize,
            sort: sortModel[0]?.field,
            order: (sortModel[0]?.sort as 'asc' | 'desc' | null) ?? undefined,
        }),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useProductMutations({
        setSnackbar,
        onCreateSuccess: () => setFormOpen(false),
        onUpdateSuccess: () => { setFormOpen(false); setEditing(null); },
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useProductColumns({
        getString,
        onOpenCard: (row) => setCardProduct(row),
        onEdit: (row) => { setEditing(row); setFormOpen(true); },
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    const onFiltersChange = (next: ProductListParams) => {
        setFilters(next);
        setPaginationModel((p) => ({ ...p, page: 0 }));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {cfl(getString('products'))}
                    {data ? ` (${data.total.toLocaleString()})` : ''}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            <ProductFilters onChange={onFiltersChange} />

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

            <ProductForm open={formOpen} editing={editing}
                onClose={() => { setFormOpen(false); setEditing(null); }}
                createMutation={createMutation} updateMutation={updateMutation} />

            <ProductCardModal open={!!cardProduct} product={cardProduct}
                onClose={() => setCardProduct(null)} />

            <DeleteConfirmDialog open={!!rowToDelete} label={rowToDelete?.code}
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
