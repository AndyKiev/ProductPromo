import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, MenuItem, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ProductSupplier } from './productSupplierApi';
import type { SupplierProductStatus } from '../suppliers/supplier_product_statuses/supplierProductStatusApi';
import cfl from '../../../utils/capitalizeFirstLetter';
import type { GetStringFn } from '../../../types/getStringFn';

interface Params {
    getString: GetStringFn;
    statuses: SupplierProductStatus[];
    onStatusChange: (row: ProductSupplier, statusId: number) => void;
    onDelete: (row: ProductSupplier) => void;
    actionsPending: boolean;
}

export function useProductSupplierColumns({ getString, statuses, onStatusChange, onDelete, actionsPending }: Params): GridColDef[] {
    return [
        { field: 'product_code', headerName: cfl(getString('productCode')) || 'code', width: 130, valueGetter: (_v, r: ProductSupplier) => r.product_code ?? '' },
        { field: 'product_name', headerName: cfl(getString('productName')) || 'name', flex: 1, minWidth: 220, sortable: false, valueGetter: (_v, r: ProductSupplier) => r.product_name ?? '' },
        { field: 'supplier_code', headerName: cfl(getString('supplierCode')) || 'supplier', width: 140, sortable: false, valueGetter: (_v, r: ProductSupplier) => r.supplier_code ?? '' },
        { field: 'supplier_name', headerName: cfl(getString('supplierName')) || 'supplier name', flex: 1, minWidth: 200, sortable: false, valueGetter: (_v, r: ProductSupplier) => r.supplier_name ?? '' },
        {
            field: 'status_id', headerName: cfl(getString('supplierProductStatus')) || 'status', width: 180, sortable: true,
            renderCell: (p: GridRenderCellParams<ProductSupplier>) => (
                <TextField select size="small" variant="standard" value={p.row.status_id ?? 0}
                    disabled={actionsPending}
                    onChange={(e) => onStatusChange(p.row, Number(e.target.value))}
                    sx={{ minWidth: 130 }}>
                    <MenuItem value={0}>{getString('any')}</MenuItem>
                    {statuses.map((s) => <MenuItem key={s.id} value={s.id}>{s.name || s.code}</MenuItem>)}
                </TextField>
            ),
        },
        {
            field: '_actions', headerName: '', width: 72, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<ProductSupplier>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('delete') || 'Delete'}>
                        <span><IconButton size="small" color="error" onClick={() => onDelete(p.row)} disabled={actionsPending}>
                            <DeleteIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
            ),
        },
    ];
}
