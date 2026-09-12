import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Supplier } from './supplierApi';
import cfl from '../../../../utils/capitalizeFirstLetter';
import type { GetStringFn } from '../../../../types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: Supplier) => void;
    onDelete: (row: Supplier) => void;
    actionsPending: boolean;
}

export function useSupplierColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'code', headerName: cfl(getString('supplierCode')) || 'code', width: 150, minWidth: 120 },
        { field: 'name', headerName: cfl(getString('supplierName')) || 'name', flex: 1, minWidth: 240 },
        { field: 'status_name', headerName: cfl(getString('status')) || 'status', width: 160, sortable: false, valueGetter: (_v, r: Supplier) => r.status_name ?? '' },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Supplier>) => (
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
