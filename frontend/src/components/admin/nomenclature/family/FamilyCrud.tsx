import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Paper, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import { fetchFamilies, type Family } from './familyApi';
import { FAMILY_QK, useFamilyMutations } from './useFamilyMutations';
import { useFamilyColumns } from './useFamilyColumns';
import { FamilyForm } from './FamilyForm';
import { DeleteConfirmDialog } from '../_shared/DeleteConfirmDialog';
import { useDataGridLocale } from '../../../../hooks/useDataGridLocale';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';

export function FamilyCrud() {
    const getString = useString({ str: nomenclatureStrings });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Family | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Family | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey: FAMILY_QK, queryFn: () => fetchFamilies(), staleTime: 2 * 60 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useFamilyMutations({
        setSnackbar,
        onCreateSuccess: () => { setFormOpen(false); },
        onUpdateSuccess: () => { setFormOpen(false); setEditing(null); },
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useFamilyColumns({
        getString,
        onEdit: (row) => { setEditing(row); setFormOpen(true); },
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <Box className="admin-crud">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {cfl(getString('families'))}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {!isLoading && error && <Alert severity="error" sx={{ m: 2 }}>{(error as Error).message}</Alert>}

            {!isLoading && !error && (
                <Paper className="admin-data-grid-paper" elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <DataGrid rows={rows} columns={columns}
                        paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 25, 50]} disableRowSelectionOnClick getRowId={(r) => r.id}
                        localeText={localeText} hideFooterSelectedRowCount />
                </Paper>
            )}

            <FamilyForm open={formOpen} editing={editing}
                onClose={() => { setFormOpen(false); setEditing(null); }}
                createMutation={createMutation} updateMutation={updateMutation} />

            <DeleteConfirmDialog open={!!rowToDelete}
                label={(rowToDelete as any)?.name ?? undefined}
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
