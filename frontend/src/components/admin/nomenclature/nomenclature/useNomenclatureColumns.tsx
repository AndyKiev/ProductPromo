import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { Nomenclature } from './nomenclatureApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import { formatToUkrDate } from '@ui/utils/dateFormatter';
import type { GetStringFn } from '@ui/types/getStringFn';

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
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
