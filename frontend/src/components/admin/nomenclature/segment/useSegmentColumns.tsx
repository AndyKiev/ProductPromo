import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { Segment } from './segmentApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import type { GetStringFn } from '@ui/types/getStringFn';

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
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
