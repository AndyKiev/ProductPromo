import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, type GridSortModel } from '@mui/x-data-grid';
import { fetchSuppliers, type Supplier, type SupplierListParams } from './supplierApi';
import { SUPPLIER_QK, useSupplierMutations } from './useSupplierMutations';
import { useSupplierColumns } from './useSupplierColumns';
import { SupplierForm } from './SupplierForm';
import { DeleteConfirmDialog } from '../../nomenclature/_shared/DeleteConfirmDialog';
import { useDataGridLocale } from '../../../../hooks/useDataGridLocale';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../catalogStrings';
import { fetchSupplierStatuses } from '../supplier_statuses/supplierStatusApi';

const NONE = 0;

export function SupplierCrud() {
    const getString = useString({ str: catalogStrings });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Supplier | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const [statusId, setStatusId] = useState(NONE);

    const { data: statuses = [] } = useQuery({ queryKey: ['supplier_statuses'], queryFn: fetchSupplierStatuses, staleTime: Infinity });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQ(q), 400);
        return () => clearTimeout(timer);
    }, [q]);

    const filters: SupplierListParams = {
        q: debouncedQ || undefined,
        status_id: statusId || undefined,
        page: paginationModel.page,
        page_size: paginationModel.pageSize,
        sort: sortModel[0]?.field,
        order: (sortModel[0]?.sort as 'asc' | 'desc' | null) ?? undefined,
    };

    const { data, isFetching, error } = useQuery({
        queryKey: [...SUPPLIER_QK, filters],
        queryFn: () => fetchSuppliers(filters),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useSupplierMutations({
        setSnackbar,
        onCreateSuccess: () => setFormOpen(false),
        onUpdateSuccess: () => { setFormOpen(false); setEditing(null); },
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useSupplierColumns({
        getString,
        onEdit: (row) => { setEditing(row); setFormOpen(true); },
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <Box className="admin-crud">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {cfl(getString('suppliers'))}
                    {data ? ` (${data.total.toLocaleString()})` : ''}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField size="small" label={cfl(getString('search')) || 'search'} sx={{ minWidth: 260, flex: 2 }}
                        value={q} onChange={(e) => setQ(e.target.value)}
                        placeholder={`${getString('supplierCode')} / ${getString('supplierName')}`} />
                    <TextField select size="small" label={cfl(getString('supplierStatus')) || 'status'} sx={{ minWidth: 200, flex: 1 }}
                        value={statusId} onChange={(e) => { setStatusId(Number(e.target.value)); setPaginationModel((p) => ({ ...p, page: 0 })); }}>
                        <MenuItem value={NONE}>{getString('any')}</MenuItem>
                        {statuses.map((s) => <MenuItem key={s.id} value={s.id}>{s.name || s.code}</MenuItem>)}
                    </TextField>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as Error).message}</Alert>}

            <Paper className="admin-data-grid-paper" elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <DataGrid
                    rows={data?.items ?? []}
                    columns={columns}
                    rowCount={data?.total ?? 0}
                    loading={isFetching}
                    paginationMode="server"
                    sortingMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    getRowId={(r) => r.id}
                    localeText={localeText}
                    hideFooterSelectedRowCount
                    sx={{ minHeight: 0 }}
                />
            </Paper>

            <SupplierForm open={formOpen} editing={editing}
                onClose={() => { setFormOpen(false); setEditing(null); }}
                createMutation={createMutation} updateMutation={updateMutation} />

            <DeleteConfirmDialog open={!!rowToDelete} label={rowToDelete?.code}
                isPending={deleteMutation.isPending}
                onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                onCancel={() => setRowToDelete(null)} />

            <Snackbar open={snackbar.open} autoHideDuration={6000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
