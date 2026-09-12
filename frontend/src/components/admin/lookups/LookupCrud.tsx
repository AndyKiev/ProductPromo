import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Paper, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import { useDataGridLocale } from '../../../hooks/useDataGridLocale';
import catalogStrings from '../catalogStrings';
import { DeleteConfirmDialog } from '../nomenclature/_shared/DeleteConfirmDialog';

export interface LookupRecord {
    id: number;
    code: string;
    name?: string | null;
    description?: string | null;
}

export interface LookupMutationResponse<T> { detail: string; data: T; }

export interface LookupApi {
    fetchAll: () => Promise<LookupRecord[]>;
    create: (body: { code: string; name?: string | null; description?: string | null }) => Promise<LookupMutationResponse<LookupRecord>>;
    update: (args: { id: number; data: { code?: string; name?: string | null; description?: string | null } }) => Promise<LookupMutationResponse<LookupRecord>>;
    remove: (id: number) => Promise<LookupMutationResponse<null>>;
}

interface Props {
    titleKey: string;
    entityKey: string;
    queryKey: readonly unknown[];
    api: LookupApi;
    secondField: 'name' | 'description';
    secondLabelKey: string;
    maxSecondLength: number;
    codeMaxLength?: number;
}

interface FormValues { code: string; second: string; }

export function LookupCrud({
    titleKey, entityKey, queryKey, api, secondField, secondLabelKey,
    maxSecondLength, codeMaxLength = 16,
}: Props) {
    const getString = useString({ str: catalogStrings });
    const qc = useQueryClient();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<LookupRecord | null>(null);
    const [rowToDelete, setRowToDelete] = useState<LookupRecord | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const schema = z.object({
        code: z.string().min(1, 'required').max(codeMaxLength, 'max_length'),
        second: z.string().max(maxSecondLength, 'max_length'),
    });

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
        defaultValues: { code: '', second: '' },
    });

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey, queryFn: api.fetchAll, staleTime: 2 * 60 * 1000,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey });
    const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

    const toPayload = (values: FormValues) => ({
        code: values.code,
        name: secondField === 'name' ? values.second || null : undefined,
        description: secondField === 'description' ? values.second || null : undefined,
    });

    const createMutation = useMutation({
        mutationFn: (values: FormValues) => api.create(toPayload(values)),
        onSuccess: async (res) => { await invalidate(); notify(res.detail, 'success'); setFormOpen(false); },
        onError: (err: Error) => notify(err.message, 'error'),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: number; values: FormValues }) =>
            api.update({ id, data: toPayload(values) }),
        onSuccess: async (res) => { await invalidate(); notify(res.detail, 'success'); setFormOpen(false); setEditing(null); },
        onError: (err: Error) => notify(err.message, 'error'),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.remove(id),
        onSuccess: async (res) => { await invalidate(); notify(res.detail, 'success'); setRowToDelete(null); },
        onError: (err: Error) => notify(err.message, 'error'),
    });

    useEffect(() => {
        reset({ code: editing?.code ?? '', second: (editing?.[secondField] ?? '') as string });
    }, [editing, formOpen, reset, secondField]);

    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        if (editing) updateMutation.mutate({ id: editing.id, values });
        else createMutation.mutate(values);
    };

    const localeText = useDataGridLocale();
    const columns: GridColDef[] = [
        { field: 'code', headerName: cfl(getString('code')) || 'code', flex: 1, minWidth: 120 },
        {
            field: secondField, headerName: cfl(getString(secondLabelKey)) || secondLabelKey, flex: 2, minWidth: 160,
            valueGetter: (_value, row) => (row as LookupRecord)[secondField] ?? '',
        },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<LookupRecord>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('edit') || 'Edit'}>
                        <span><IconButton size="small" onClick={() => { setEditing(p.row); setFormOpen(true); }}
                            disabled={updateMutation.isPending || deleteMutation.isPending}>
                            <EditIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                    <Tooltip title={getString('delete') || 'Delete'}>
                        <span><IconButton size="small" color="error" onClick={() => setRowToDelete(p.row)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}>
                            <DeleteIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{cfl(getString(titleKey))}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {!isLoading && error && <Alert severity="error" sx={{ m: 2 }}>{(error as Error).message}</Alert>}

            {!isLoading && !error && (
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <DataGrid rows={rows} columns={columns} paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick getRowId={(r) => r.id}
                        localeText={localeText} hideFooterSelectedRowCount autoHeight />
                </Paper>
            )}

            <Dialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {cfl(getString(editing ? 'edit' : 'create'))} — {getString(entityKey)}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Controller name="code" control={control} render={({ field }) => (
                                <TextField label={cfl(getString('code')) || 'code'} fullWidth size="small" {...field}
                                    error={!!errors.code}
                                    helperText={errors.code?.message ? getString(errors.code.message) : undefined}
                                    slotProps={{ htmlInput: { maxLength: codeMaxLength } }} />
                            )} />
                            <Controller name="second" control={control} render={({ field }) => (
                                <TextField label={cfl(getString(secondLabelKey)) || secondLabelKey} fullWidth size="small" {...field}
                                    error={!!errors.second}
                                    helperText={errors.second?.message ? getString(errors.second.message) : undefined}
                                    slotProps={{ htmlInput: { maxLength: maxSecondLength } }} />
                            )} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => { setFormOpen(false); setEditing(null); }} disabled={pending}>
                            {getString('cancel')}
                        </Button>
                        <Button variant="contained" type="submit" disabled={pending}
                            startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                            {getString(editing ? 'save' : 'create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

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
