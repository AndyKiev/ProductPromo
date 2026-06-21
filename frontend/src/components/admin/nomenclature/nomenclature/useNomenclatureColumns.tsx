import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Nomenclature } from './nomenclatureApi';
import cfl from '../../../../utils/capitalizeFirstLetter';
import { formatToUkrDate } from '../../../../utils/dateFormatter';
import type { GetStringFn } from '../../../../types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: Nomenclature) => void;
    onDelete: (row: Nomenclature) => void;
    actionsPending: boolean;
}

export function useNomenclatureColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'market_name', headerName: cfl(getString('market')) || 'market', flex: 1, minWidth: 110 },
        { field: 'segment_name', headerName: cfl(getString('segment')) || 'segment', flex: 1, minWidth: 110 },
        { field: 'category_name', headerName: cfl(getString('category')) || 'category', flex: 1, minWidth: 110 },
        { field: 'family_name', headerName: cfl(getString('family')) || 'family', flex: 1, minWidth: 110 },
        { field: 'created_at', headerName: cfl(getString('createdAt')), width: 160,
          renderCell: (p: GridRenderCellParams<Nomenclature>) => formatToUkrDate(p.row.created_at) },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Nomenclature>) => (
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
