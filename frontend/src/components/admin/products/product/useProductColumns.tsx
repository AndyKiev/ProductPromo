import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { Product } from './productApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import type { GetStringFn } from '@ui/types/getStringFn';

interface Params {
    getString: GetStringFn;
    onOpenCard: (row: Product) => void;
    onEdit: (row: Product) => void;
    onDelete: (row: Product) => void;
    actionsPending: boolean;
}

export function useProductColumns({ getString, onOpenCard, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        {
            field: '_card', headerName: '', width: 48, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Product>) => (
                <RowActions actions={[{ kind: 'view', labelKey: 'productCard', onClick: () => onOpenCard(p.row) }]} />
            ),
        },
        { field: 'code', headerName: cfl(getString('productCode')) || 'code', width: 130, minWidth: 110 },
        { field: 'name', headerName: cfl(getString('productName')) || 'name', flex: 1, minWidth: 220 },
        { field: 'status', headerName: cfl(getString('productStatus')) || 'status', width: 140, valueGetter: (_v, r: Product) => r.status_name ?? '' },
        { field: 'product_type_id', headerName: cfl(getString('productType')) || 'product type', width: 200, valueGetter: (_v, r: Product) => r.product_type_name ?? r.product_type_code ?? '' },
        { field: 'market_name', headerName: cfl(getString('market')) || 'market', width: 130, sortable: false, valueGetter: (_v, r: Product) => r.market_name ?? '' },
        { field: 'segment_name', headerName: cfl(getString('segment')) || 'segment', width: 150, sortable: false, valueGetter: (_v, r: Product) => r.segment_name ?? '' },
        { field: 'category_name', headerName: cfl(getString('category')) || 'category', width: 160, sortable: false, valueGetter: (_v, r: Product) => r.category_name ?? '' },
        { field: 'family_name', headerName: cfl(getString('family')) || 'family', width: 150, sortable: false, valueGetter: (_v, r: Product) => r.family_name ?? '' },
        { field: 'import_code', headerName: cfl(getString('importCode')) || 'import code', width: 130, sortable: false, valueGetter: (_v, r: Product) => r.import_code ?? '' },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Product>) => (
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
