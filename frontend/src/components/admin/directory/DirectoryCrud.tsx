// Generic CRUD screen for a directory. Everything except the path comes from
// OpenAPI: columns (Read schema), form fields + zod rules (Create schema) and
// which fields stay editable (Update schema).
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, IconButton, Paper, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { api } from '../../../api/typedApi';
import { axiosInstance } from '../../../api/axiosInstance';
import useString from '../../../hooks/useString';
import cfl from '../../../utils/capitalizeFirstLetter';
import { useDataGridLocale } from '../../../hooks/useDataGridLocale';
import catalogStrings from '../catalogStrings';
import { DeleteConfirmDialog } from '../nomenclature/_shared/DeleteConfirmDialog';
import { buildDirectoryMeta, useOpenApi, type DirectoryMeta, type FieldMeta } from './directoryMeta';
import { camel, type DirectoryDef } from './directory';

type Row = Record<string, unknown> & { id: number };
type FormValues = Record<string, string | boolean>;
interface Mutation { detail: string }

const API_ROOT = import.meta.env.VITE_BACKEND_API_URL ?? '';

function fieldSchema(f: FieldMeta): z.ZodType {
    if (f.kind === 'boolean') return z.boolean();
    let s = z.string();
    if (f.required) s = s.min(1, 'required');
    if (f.maxLength) s = s.max(f.maxLength, 'max_length');
    if (f.pattern) s = s.regex(new RegExp(f.pattern), 'invalid_format');
    if (f.kind !== 'number') return s;
    return s.refine((v) => v === '' || (!Number.isNaN(Number(v))
        && (f.min == null || Number(v) >= f.min) && (f.max == null || Number(v) <= f.max)), 'invalid_format');
}

const emptyValue = (f: FieldMeta) => (f.kind === 'boolean' ? false : '');
const toFormValue = (f: FieldMeta, v: unknown) => (f.kind === 'boolean' ? !!v : v == null ? '' : String(v));
function toPayloadValue(f: FieldMeta, v: string | boolean) {
    if (f.kind === 'boolean') return v;
    if (v === '') return f.nullable ? null : v;
    return f.kind === 'number' ? Number(v) : v;
}

export function DirectoryCrud({ def }: { def: DirectoryDef }) {
    const getString = useString({ str: catalogStrings });
    const { data: doc, isLoading, error } = useOpenApi();
    const meta = useMemo(() => (doc ? buildDirectoryMeta(doc, def.path) : null), [doc, def.path]);

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error || !meta) return <Alert severity="error" sx={{ m: 2 }}>{(error as Error)?.message ?? getString('networkError')}</Alert>;
    return <DirectoryTable key={def.key} def={def} meta={meta} />;
}

function DirectoryTable({ def, meta }: { def: DirectoryDef; meta: DirectoryMeta }) {
    const getString = useString({ str: catalogStrings });
    const label = (name: string) => cfl(getString(camel(name)));
    const qc = useQueryClient();
    const queryKey = ['directory', def.key];
    const fields = useMemo(() => Object.values(meta.fields), [meta]);
    const columns = def.columns ?? meta.columns;

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Row | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const schema = useMemo(() => z.object(Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f)]))), [fields]);
    const defaults = useMemo(() => Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)])), [fields]);
    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema) as never, mode: 'onSubmit', defaultValues: defaults,
    });

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey, staleTime: 2 * 60 * 1000,
        queryFn: async () => (await api.get(def.path)) as unknown as Row[],
    });

    const itemUrl = (id: number) => `${API_ROOT}${meta.itemPath.replace(`{${meta.itemParam}}`, String(id))}`;
    const toPayload = (values: FormValues, onlyEditable: boolean) => Object.fromEntries(
        fields.filter((f) => !onlyEditable || f.editable).map((f) => [f.name, toPayloadValue(f, values[f.name])]));

    const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });
    const done = async (res: Mutation) => {
        await qc.invalidateQueries({ queryKey });
        notify(res.detail, 'success');
        setFormOpen(false); setEditing(null); setRowToDelete(null);
    };
    const onError = (err: Error) => notify(err.message, 'error');

    const createMutation = useMutation({
        mutationFn: async (values: FormValues) => (await axiosInstance.post<Mutation>(`${API_ROOT}${def.path}`, toPayload(values, false))).data,
        onSuccess: done, onError,
    });
    const updateMutation = useMutation({
        mutationFn: async ({ id, values }: { id: number; values: FormValues }) =>
            (await axiosInstance.patch<Mutation>(itemUrl(id), toPayload(values, true))).data,
        onSuccess: done, onError,
    });
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => (await axiosInstance.delete<Mutation>(itemUrl(id))).data,
        onSuccess: done, onError,
    });

    useEffect(() => {
        reset(editing ? Object.fromEntries(fields.map((f) => [f.name, toFormValue(f, editing[f.name])])) : defaults);
    }, [editing, formOpen, reset, fields, defaults]);

    const pending = createMutation.isPending || updateMutation.isPending;
    const busy = updateMutation.isPending || deleteMutation.isPending;
    const onSubmit = (values: FormValues) => (editing
        ? updateMutation.mutate({ id: editing.id, values })
        : createMutation.mutate(values));
    const close = () => { setFormOpen(false); setEditing(null); };
    const rowLabel = (r: Row | null) => (r ? String(r.code ?? r.name ?? r.id) : undefined);

    const localeText = useDataGridLocale();
    const gridColumns: GridColDef[] = [
        ...columns.map((c): GridColDef => {
            const isBool = meta.fields[c]?.kind === 'boolean';
            return {
                field: c, headerName: label(c), flex: c === 'code' ? 1 : 2, minWidth: 120,
                ...(isBool && { renderCell: (p: GridRenderCellParams<Row>) => (p.value ? <CheckIcon fontSize="small" /> : null) }),
            };
        }),
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<Row>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={getString('edit')}>
                        <span><IconButton size="small" disabled={busy}
                            onClick={() => { setEditing(p.row); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                    <Tooltip title={getString('delete')}>
                        <span><IconButton size="small" color="error" disabled={busy}
                            onClick={() => setRowToDelete(p.row)}><DeleteIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box className="admin-crud">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>{cfl(getString(def.titleKey))}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    {cfl(getString('add'))}
                </Button>
            </Box>

            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            {!isLoading && error && <Alert severity="error" sx={{ m: 2 }}>{(error as Error).message}</Alert>}
            {!isLoading && !error && (
                <Paper className="admin-data-grid-paper" elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <DataGrid rows={rows} columns={gridColumns} paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick getRowId={(r) => r.id} localeText={localeText} hideFooterSelectedRowCount />
                </Paper>
            )}

            <Dialog open={formOpen} onClose={close} maxWidth="sm" fullWidth>
                <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString(def.entityKey)}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {fields.map((f) => (
                                <Controller key={f.name} name={f.name} control={control} render={({ field }) => {
                                    const disabled = !!editing && !f.editable;
                                    if (f.kind === 'boolean') {
                                        return <FormControlLabel label={label(f.name)} disabled={disabled}
                                            control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />;
                                    }
                                    const msg = errors[f.name]?.message;
                                    return (
                                        <TextField {...field} value={field.value as string} label={label(f.name)} fullWidth size="small"
                                            required={f.required} disabled={disabled} type={f.kind === 'number' ? 'number' : 'text'}
                                            error={!!msg} helperText={msg ? getString(String(msg)) : undefined}
                                            slotProps={{ htmlInput: { maxLength: f.maxLength } }} />
                                    );
                                }} />
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={close} disabled={pending}>{getString('cancel')}</Button>
                        <Button variant="contained" type="submit" disabled={pending}
                            startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                            {getString(editing ? 'save' : 'create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <DeleteConfirmDialog open={!!rowToDelete} label={rowLabel(rowToDelete)} isPending={deleteMutation.isPending}
                onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)} onCancel={() => setRowToDelete(null)} />

            <Snackbar open={snackbar.open} autoHideDuration={6000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
