import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Paper, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import { fetchCategorys, type Category } from './categoryApi';
import { CATEGORY_QK, useCategoryMutations } from './useCategoryMutations';
import { useCategoryColumns } from './useCategoryColumns';
import { CategoryForm } from './CategoryForm';
import { DeleteConfirmDialog } from '../_shared/DeleteConfirmDialog';
import { useDataGridLocale } from '../../../../hooks/useDataGridLocale';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';

export function CategoryCrud() {
    const getString = useString({ str: nomenclatureStrings });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Category | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey: CATEGORY_QK, queryFn: () => fetchCategorys(), staleTime: 2 * 60 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useCategoryMutations({
        setSnackbar,
        onCreateSuccess: () => { setFormOpen(false); },
        onUpdateSuccess: () => { setFormOpen(false); setEditing(null); },
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useCategoryColumns({
        getString,
        onEdit: (row) => { setEditing(row); setFormOpen(true); },
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {cfl(getString('categories'))}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {!isLoading && error && <Alert severity="error" sx={{ m: 2 }}>{(error as Error).message}</Alert>}

            {!isLoading && !error && (
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <DataGrid rows={rows} columns={columns}
                        paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 25, 50]} disableRowSelectionOnClick getRowId={(r) => r.id}
                        localeText={localeText} hideFooterSelectedRowCount />
                </Paper>
            )}

            <CategoryForm open={formOpen} editing={editing}
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
