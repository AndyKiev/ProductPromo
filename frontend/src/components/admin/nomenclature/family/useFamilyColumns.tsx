import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { Family } from './familyApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import type { GetStringFn } from '@ui/types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: Family) => void;
    onDelete: (row: Family) => void;
    actionsPending: boolean;
}

export function useFamilyColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'code', headerName: cfl(getString('code')) || 'code', flex: 1, minWidth: 120 },
        { field: 'name', headerName: cfl(getString('name')) || 'name', flex: 1, minWidth: 120 },
        { field: 'category_name', headerName: cfl(getString('category')) || 'category', flex: 1, minWidth: 120 },
        { field: 'status_name', headerName: cfl(getString('status')) || 'status', flex: 1, minWidth: 120 },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Family>) => (
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
