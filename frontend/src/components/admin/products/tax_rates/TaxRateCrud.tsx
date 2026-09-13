import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, MenuItem, Paper, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import { useDataGridLocale } from '../../../../hooks/useDataGridLocale';
import catalogStrings from '../../catalogStrings';
import { DeleteConfirmDialog } from '../../nomenclature/_shared/DeleteConfirmDialog';
import { fetchTaxTypes } from '../tax_types/taxTypeApi';
import { fetchTaxRates, createTaxRate, updateTaxRate, deleteTaxRate, type TaxRate } from './taxRateApi';

const TAX_RATES_QK = ['tax_rates'] as const;
const NONE = 0;

const schema = z.object({
    tax_type_id: z.number({ message: 'required' }).min(1, 'required'),
    rate: z.number({ message: 'required' }).min(0, 'required'),
    effective_from: z.string().min(1, 'required'),
    effective_till: z.string().min(1, 'required'),
});
type FormValues = z.infer<typeof schema>;

export function TaxRateCrud() {
    const getString = useString({ str: catalogStrings });
    const qc = useQueryClient();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<TaxRate | null>(null);
    const [rowToDelete, setRowToDelete] = useState<TaxRate | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey: TAX_RATES_QK, queryFn: () => fetchTaxRates(), staleTime: 2 * 60 * 1000,
    });
    const { data: taxTypes = [] } = useQuery({ queryKey: ['tax_types'], queryFn: fetchTaxTypes, staleTime: Infinity });

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
        defaultValues: { tax_type_id: 0, rate: 0, effective_from: '2000-01-01', effective_till: '2050-12-01' },
    });

    useEffect(() => {
        reset({
            tax_type_id: editing?.tax_type_id ?? 0,
            rate: editing?.rate ?? 0,
            effective_from: editing?.effective_from ?? '2000-01-01',
            effective_till: editing?.effective_till ?? '2050-12-01',
        });
    }, [editing, formOpen, reset]);

    const invalidate = () => qc.invalidateQueries({ queryKey: TAX_RATES_QK });
    const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

    const createMutation = useMutation({
        mutationFn: createTaxRate,
        onSuccess: async (res) => { await invalidate(); notify(res.detail, 'success'); setFormOpen(false); },
        onError: (err: Error) => notify(err.message, 'error'),
    });
    const updateMutation = useMutation({
        mutationFn: updateTaxRate,
        onSuccess: async (res) => { await invalidate(); notify(res.detail, 'success'); setFormOpen(false); setEditing(null); },
        onError: (err: Error) => notify(err.message, 'error'),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteTaxRate,
        onSuccess: async (res) => { await invalidate(); notify(res.detail, 'success'); setRowToDelete(null); },
        onError: (err: Error) => notify(err.message, 'error'),
    });

    const pending = createMutation.isPending || updateMutation.isPending;
    const onSubmit = (values: FormValues) => {
        if (editing) updateMutation.mutate({ id: editing.id, data: values });
        else createMutation.mutate(values);
    };

    const localeText = useDataGridLocale();
    const columns: GridColDef[] = [
        { field: 'tax_type_code', headerName: cfl(getString('taxType')) || 'tax type', width: 180, valueGetter: (_v, r: TaxRate) => r.tax_type_name || r.tax_type_code || '' },
        { field: 'rate', headerName: cfl(getString('rate')) || 'rate', width: 120 },
        { field: 'effective_from', headerName: cfl(getString('effectiveFrom')) || 'from', width: 160 },
        { field: 'effective_till', headerName: cfl(getString('effectiveTill')) || 'till', width: 160 },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<TaxRate>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('edit') || 'Edit'}>
                        <span><IconButton size="small" onClick={() => { setEditing(p.row); setFormOpen(true); }}
                            disabled={updateMutation.isPending || deleteMutation.isPending}><EditIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                    <Tooltip title={getString('delete') || 'Delete'}>
                        <span><IconButton size="small" color="error" onClick={() => setRowToDelete(p.row)}
                            disabled={updateMutation.isPending || deleteMutation.isPending}><DeleteIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box className="admin-crud">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{cfl(getString('taxRates'))}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {!isLoading && error && <Alert severity="error" sx={{ m: 2 }}>{(error as Error).message}</Alert>}

            {!isLoading && !error && (
                <Paper className="admin-data-grid-paper" elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <DataGrid rows={rows} columns={columns} paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick getRowId={(r) => r.id}
                        localeText={localeText} hideFooterSelectedRowCount />
                </Paper>
            )}

            <Dialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} maxWidth="sm" fullWidth>
                <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('taxRate')}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Controller name="tax_type_id" control={control} render={({ field }) => (
                                <TextField select label={cfl(getString('taxType')) || 'tax type'} fullWidth size="small"
                                    {...field} value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    error={!!errors.tax_type_id}
                                    helperText={errors.tax_type_id?.message ? getString(errors.tax_type_id.message) : undefined}>
                                    <MenuItem value={NONE}>{getString('any')}</MenuItem>
                                    {taxTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.name || t.code}</MenuItem>)}
                                </TextField>
                            )} />
                            <Controller name="rate" control={control} render={({ field }) => (
                                <TextField label={cfl(getString('rate')) || 'rate'} type="number" fullWidth size="small"
                                    {...field} value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    error={!!errors.rate}
                                    helperText={errors.rate?.message ? getString(errors.rate.message) : undefined}
                                    slotProps={{ htmlInput: { step: '0.01', min: 0 } }} />
                            )} />
                            <Controller name="effective_from" control={control} render={({ field }) => (
                                <TextField label={cfl(getString('effectiveFrom')) || 'effective from'} type="date" fullWidth size="small"
                                    {...field} slotProps={{ inputLabel: { shrink: true } }}
                                    error={!!errors.effective_from}
                                    helperText={errors.effective_from?.message ? getString(errors.effective_from.message) : undefined} />
                            )} />
                            <Controller name="effective_till" control={control} render={({ field }) => (
                                <TextField label={cfl(getString('effectiveTill')) || 'effective till'} type="date" fullWidth size="small"
                                    {...field} slotProps={{ inputLabel: { shrink: true } }}
                                    error={!!errors.effective_till}
                                    helperText={errors.effective_till?.message ? getString(errors.effective_till.message) : undefined} />
                            )} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => { setFormOpen(false); setEditing(null); }} disabled={pending}>{getString('cancel')}</Button>
                        <Button variant="contained" type="submit" disabled={pending}
                            startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                            {getString(editing ? 'save' : 'create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <DeleteConfirmDialog open={!!rowToDelete}
                label={rowToDelete ? `${rowToDelete.tax_type_code ?? ''} ${rowToDelete.rate}%` : undefined}
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
