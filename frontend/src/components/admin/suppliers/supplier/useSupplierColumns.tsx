import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { RowActions } from '@ui/components/common/RowActions';
import type { Supplier } from './supplierApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import type { GetStringFn } from '@ui/types/getStringFn';

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
        { field: 'status', headerName: cfl(getString('supplierStatus')) || 'status', width: 160, valueGetter: (_v, r: Supplier) => r.status_name ?? '' },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Supplier>) => (
                <RowActions actions={[
                    { kind: 'edit', onClick: () => onEdit(p.row), disabled: actionsPending },
                    { kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending },
                ]} />
            ),
        },
    ];
}
