import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { Product } from './productApi';
import cfl from '../../../../utils/capitalizeFirstLetter';
import type { GetStringFn } from '../../../../types/getStringFn';

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
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('productCard') || 'Card'}>
                        <span><IconButton size="small" color="primary" onClick={() => onOpenCard(p.row)}>
                            <VisibilityOutlinedIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('edit') || 'Edit'}>
                        <span><IconButton size="small" onClick={() => onEdit(p.row)} disabled={actionsPending}>
                            <EditIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                    <Tooltip title={getString('delete') || 'Delete'}>
                        <span><IconButton size="small" color="error" onClick={() => onDelete(p.row)} disabled={actionsPending}>
                            <DeleteIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
            ),
        },
    ];
}
