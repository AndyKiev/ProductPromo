import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Product } from './productApi';
import cfl from '../../../../utils/capitalizeFirstLetter';
import type { GetStringFn } from '../../../../types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: Product) => void;
    onDelete: (row: Product) => void;
    actionsPending: boolean;
}

export function useProductColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'code', headerName: cfl(getString('productCode')) || 'code', width: 130, minWidth: 110 },
        { field: 'name', headerName: cfl(getString('productName')) || 'name', flex: 1, minWidth: 220 },
        { field: 'market_name', headerName: cfl(getString('market')) || 'market', width: 130, sortable: false, valueGetter: (_v, r: Product) => r.market_name ?? '' },
        { field: 'segment_name', headerName: cfl(getString('segment')) || 'segment', width: 150, sortable: false, valueGetter: (_v, r: Product) => r.segment_name ?? '' },
        { field: 'category_name', headerName: cfl(getString('category')) || 'category', width: 160, sortable: false, valueGetter: (_v, r: Product) => r.category_name ?? '' },
        { field: 'family_name', headerName: cfl(getString('family')) || 'family', width: 150, sortable: false, valueGetter: (_v, r: Product) => r.family_name ?? '' },
        { field: 'status_name', headerName: cfl(getString('status')) || 'status', width: 130, sortable: false, valueGetter: (_v, r: Product) => r.status_name ?? '' },
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
