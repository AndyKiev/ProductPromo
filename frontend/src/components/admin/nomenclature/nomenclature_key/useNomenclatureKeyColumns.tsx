import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { NomenclatureKey } from './nomenclature_keyApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import { formatToUkrDate } from '@ui/utils/dateFormatter';
import type { GetStringFn } from '@ui/types/getStringFn';

interface Params {
    getString: GetStringFn;
    onEdit: (row: NomenclatureKey) => void;
    onDelete: (row: NomenclatureKey) => void;
    actionsPending: boolean;
}

export function useNomenclatureKeyColumns({ getString, onEdit, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'name', headerName: cfl(getString('key_name')) || 'key_name', flex: 1, minWidth: 120 },
        { field: 'created_at', headerName: cfl(getString('createdAt')), width: 160,
          renderCell: (p: GridRenderCellParams<NomenclatureKey>) => formatToUkrDate(p.row.created_at) },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<NomenclatureKey>) => (
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
