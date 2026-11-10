import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { fetchProducts, type Product, type ProductListParams } from './productApi';
import { PRODUCT_QK, useProductMutations } from './useProductMutations';
import { useProductColumns } from './useProductColumns';
import { ProductForm } from './ProductForm';
import { ProductFilters } from './ProductFilters';
import { ProductCardModal } from './ProductCardModal';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { EMPTY } from '@ui/utils/empty';

export function ProductCrud() {
    const getString = useString({ str: catalogStrings });
    const [form, setForm] = useState<{ key: number; editing: Product | null } | null>(null);
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
        onCreateSuccess: () => setForm(null),
        onUpdateSuccess: () => setForm(null),
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useProductColumns({
        getString,
        onOpenCard: setCardProduct,
        onEdit: (row) => setForm({ key: Date.now(), editing: row }),
        onDelete: setRowToDelete,
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    const onFiltersChange = (next: ProductListParams) => {
        setFilters(next);
        setPaginationModel((p) => ({ ...p, page: 0 }));
    };

    return (
        <CrudPage error={error}
            title={`${cfl(getString('products'))}${data ? ` (${data.total.toLocaleString()})` : ''}`}
            onAdd={() => setForm({ key: Date.now(), editing: null })}
            toolbar={<ProductFilters onChange={onFiltersChange} />}
            dialogs={<>
                {form && <ProductForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
                    createMutation={createMutation} updateMutation={updateMutation} />}
                {cardProduct && <ProductCardModal key={cardProduct.id} product={cardProduct} onClose={() => setCardProduct(null)} />}
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
