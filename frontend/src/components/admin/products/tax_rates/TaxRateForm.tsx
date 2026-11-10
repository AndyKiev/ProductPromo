import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, type UseMutationResult } from '@tanstack/react-query';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { IsoDateField } from '@ui/components/common/DateField';
import type { MutationResponse, TaxRate, TaxRateCreate, TaxRateUpdate } from './taxRateApi';
import { fetchTaxTypes } from '../tax_types/taxTypeApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { EMPTY } from '@ui/utils/empty';

// Zod messages are translation keys, resolved at render.
const schema = z.object({
    tax_type_id: z.number().min(1, 'required'),
    rate: z.number({ message: 'required' }).min(0, 'invalidValue'),
    effective_from: z.string().min(1, 'required'),
    effective_till: z.string().min(1, 'required'),
});
type FormValues = z.infer<typeof schema>;

interface Props {
    editing: TaxRate | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<TaxRate>, Error, TaxRateCreate>;
    updateMutation: UseMutationResult<MutationResponse<TaxRate>, Error, { id: number; data: TaxRateUpdate }>;
}

/** MUI Dialog, not FormDialog: it holds DatePickers (see DateField). Mounted fresh per open. */
export function TaxRateForm({ editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: catalogStrings });
    const t = (key?: string) => (key ? getString(key) : undefined);
    const { data: taxTypes = EMPTY } = useQuery({ queryKey: ['tax_types'], queryFn: fetchTaxTypes, staleTime: Infinity });
    const { control, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            tax_type_id: editing?.tax_type_id ?? 0,
            rate: editing ? Number(editing.rate) : 0,
            effective_from: editing?.effective_from ?? '2000-01-01',
            effective_till: editing?.effective_till ?? '2050-12-01',
        },
    });
    const pending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (values: FormValues) => {
        if (editing && !isDirty) return onClose();
        if (editing) updateMutation.mutate({ id: editing.id, data: values });
        else createMutation.mutate(values);
    };

    return (
        <Dialog open onClose={pending ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('taxRate')}</DialogTitle>
            <DialogContent>
                <form id="tax-rate-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 pt-2">
                    <Controller name="tax_type_id" control={control} render={({ field }) => (
                        <TextField select fullWidth size="small" required autoFocus label={cfl(getString('taxType'))}
                            value={field.value} onChange={(e) => field.onChange(Number(e.target.value))}
                            error={!!errors.tax_type_id} helperText={t(errors.tax_type_id?.message)}>
                            <MenuItem value={0} disabled>—</MenuItem>
                            {taxTypes.map((tt) => <MenuItem key={tt.id} value={tt.id}>{tt.name || tt.code}</MenuItem>)}
                        </TextField>
                    )} />
                    <Controller name="rate" control={control} render={({ field }) => (
                        <TextField fullWidth size="small" required type="number" label={cfl(getString('rate'))}
                            value={Number.isNaN(field.value) ? '' : field.value}
                            onChange={(e) => field.onChange(e.target.value === '' ? Number.NaN : Number(e.target.value))}
                            error={!!errors.rate} helperText={t(errors.rate?.message)}
                            slotProps={{ htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' } }} />
                    )} />
                    <div className="flex gap-3">
                        <Controller name="effective_from" control={control} render={({ field }) => (
                            <IsoDateField fullWidth required label={cfl(getString('effectiveFrom'))}
                                value={field.value} onChange={(v) => field.onChange(v ?? '')}
                                error={!!errors.effective_from} helperText={t(errors.effective_from?.message)} />
                        )} />
                        <Controller name="effective_till" control={control} render={({ field }) => (
                            <IsoDateField fullWidth required label={cfl(getString('effectiveTill'))}
                                value={field.value} onChange={(v) => field.onChange(v ?? '')}
                                error={!!errors.effective_till} helperText={t(errors.effective_till?.message)} />
                        )} />
                    </div>
                </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onClose} disabled={pending}>{getString('cancel')}</Button>
                <Button variant="contained" type="submit" form="tax-rate-form" disabled={pending}
                    startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                    {getString(editing ? 'save' : 'create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
