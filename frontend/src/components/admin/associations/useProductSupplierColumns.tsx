import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/components/ui/select';
import { RowActions } from '@ui/components/common/RowActions';
import type { ProductSupplier } from './productSupplierApi';
import type { SupplierProductStatus } from '../suppliers/supplier_product_statuses/supplierProductStatusApi';
import cfl from '@ui/utils/capitalizeFirstLetter';
import type { GetStringFn } from '@ui/types/getStringFn';

interface Params {
    getString: GetStringFn;
    statuses: SupplierProductStatus[];
    onStatusChange: (row: ProductSupplier, statusId: number) => void;
    onDelete: (row: ProductSupplier) => void;
    actionsPending: boolean;
}

/** Radix Select items cannot have an empty value: "no status" is this sentinel. */
const NONE = '__none__';

export function useProductSupplierColumns({ getString, statuses, onStatusChange, onDelete, actionsPending }: Params): GridColDef[] {
    const statusLabel = cfl(getString('supplierProductStatus'));
    return [
        { field: 'product_code', headerName: cfl(getString('productCode')) || 'code', width: 130, valueGetter: (_v, r: ProductSupplier) => r.product_code ?? '' },
        { field: 'product_name', headerName: cfl(getString('productName')) || 'name', flex: 1, minWidth: 220, sortable: false, valueGetter: (_v, r: ProductSupplier) => r.product_name ?? '' },
        { field: 'supplier_code', headerName: cfl(getString('supplierCode')) || 'supplier', width: 140, sortable: false, valueGetter: (_v, r: ProductSupplier) => r.supplier_code ?? '' },
        { field: 'supplier_name', headerName: cfl(getString('supplierName')) || 'supplier name', flex: 1, minWidth: 200, sortable: false, valueGetter: (_v, r: ProductSupplier) => r.supplier_name ?? '' },
        {
            field: 'status_id', headerName: statusLabel, width: 190, sortable: true,
            // Edited in place: the select keeps its keys away from the grid's own cell navigation.
            renderCell: (p: GridRenderCellParams<ProductSupplier>) => (
                <div className="flex h-full items-center" onKeyDown={(e) => e.stopPropagation()}>
                    <Select value={p.row.status_id ? String(p.row.status_id) : NONE} disabled={actionsPending}
                        onValueChange={(v) => onStatusChange(p.row, v === NONE ? 0 : Number(v))}>
                        <SelectTrigger size="sm" className="h-8 w-full bg-input-bg"
                            aria-label={`${statusLabel}: ${p.row.product_code ?? ''} / ${p.row.supplier_code ?? ''}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>{getString('any')}</SelectItem>
                            {statuses.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name || s.code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            ),
        },
        {
            field: '_actions', headerName: '', width: 72, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<ProductSupplier>) => (
                <RowActions actions={[{ kind: 'delete', onClick: () => onDelete(p.row), disabled: actionsPending }]} />
            ),
        },
    ];
}
