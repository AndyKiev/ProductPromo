import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { Category } from './categoryApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import type { GetStringFn } from '@ui/types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: Category) => void;
    onDelete: (row: Category) => void;
    actionsPending: boolean;
}

export function useCategoryColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'code', headerName: cfl(getString('code')) || 'code', flex: 1, minWidth: 120 },
        { field: 'name', headerName: cfl(getString('name')) || 'name', flex: 1, minWidth: 120 },
        { field: 'segment_name', headerName: cfl(getString('segment')) || 'segment', flex: 1, minWidth: 120 },
        { field: 'status_name', headerName: cfl(getString('status')) || 'status', flex: 1, minWidth: 120 },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Category>) => (
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
