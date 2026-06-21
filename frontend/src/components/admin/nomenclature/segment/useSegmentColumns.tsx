import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Segment } from './segmentApi';
import cfl from '../../../../utils/capitalizeFirstLetter';
import { formatToUkrDate } from '../../../../utils/dateFormatter';
import type { GetStringFn } from '../../../../types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: Segment) => void;
    onDelete: (row: Segment) => void;
    actionsPending: boolean;
}

export function useSegmentColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'code', headerName: cfl(getString('code')) || 'code', flex: 1, minWidth: 120 },
        { field: 'name', headerName: cfl(getString('name')) || 'name', flex: 1, minWidth: 120 },
        { field: 'market_name', headerName: cfl(getString('market')) || 'market', flex: 1, minWidth: 120 },
        { field: 'status_name', headerName: cfl(getString('status')) || 'status', flex: 1, minWidth: 120 },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Segment>) => (
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
