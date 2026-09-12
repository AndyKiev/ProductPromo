import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Box, CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Supplier, SupplierCreate, SupplierUpdate, MutationResponse } from './supplierApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../catalogStrings';
import { fetchSupplierStatuses } from '../supplier_statuses/supplierStatusApi';

const NONE = 0;

const schema = z.object({
    code: z.string().min(1, 'required').max(16, 'max_length'),
    name: z.string().max(128, 'max_length'),
    status_id: z.number(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    open: boolean;
    editing: Supplier | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Supplier>, Error, SupplierCreate>;
    updateMutation: UseMutationResult<MutationResponse<Supplier>, Error, { id: number; data: SupplierUpdate }>;
}

export function SupplierForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: catalogStrings });
    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
        defaultValues: { code: '', name: '', status_id: 0 },
    });

    const { data: statuses = [] } = useQuery({ queryKey: ['supplier_statuses'], queryFn: fetchSupplierStatuses, staleTime: Infinity });

    useEffect(() => {
        reset({ code: editing?.code ?? '', name: editing?.name ?? '', status_id: editing?.status_id ?? 0 });
    }, [editing, open, reset]);

    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        const payload: SupplierCreate = { code: values.code, name: values.name || null, status_id: values.status_id || null };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('supplier')}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Controller name="code" control={control} render={({ field }) => (
                            <TextField label={cfl(getString('supplierCode')) || 'code'} fullWidth size="small" {...field}
                                error={!!errors.code} helperText={errors.code?.message ? getString(errors.code.message) : undefined}
                                slotProps={{ htmlInput: { maxLength: 16 } }} />
                        )} />
                        <Controller name="name" control={control} render={({ field }) => (
                            <TextField label={cfl(getString('supplierName')) || 'name'} fullWidth size="small" {...field}
                                error={!!errors.name} helperText={errors.name?.message ? getString(errors.name.message) : undefined}
                                slotProps={{ htmlInput: { maxLength: 128 } }} />
                        )} />
                        <Controller name="status_id" control={control} render={({ field }) => (
                            <TextField select label={cfl(getString('supplierStatus')) || 'status'} fullWidth size="small"
                                {...field} value={field.value ?? 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}>
                                <MenuItem value={NONE}>{getString('any')}</MenuItem>
                                {statuses.map((s) => <MenuItem key={s.id} value={s.id}>{s.name || s.code}</MenuItem>)}
                            </TextField>
                        )} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onClose} disabled={pending}>{getString('cancel')}</Button>
                    <Button variant="contained" type="submit" disabled={pending}
                        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                        {getString(editing ? 'save' : 'create')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
