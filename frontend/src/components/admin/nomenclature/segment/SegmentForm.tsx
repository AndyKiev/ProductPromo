import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Segment, SegmentCreate, SegmentUpdate, MutationResponse } from './segmentApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';
import { fetchMarkets } from '../market/marketApi';
import { fetchStatusTypes } from '../status_type/statusTypeApi';

const schema = z.object({
  code: z.string().min(1, 'required').max(8, 'max_length'),
  name: z.string().min(1, 'required').max(64, 'max_length'),
  market_id: z.number({ message: 'required' }).min(1, 'required'),
  status_id: z.number({ message: 'required' }).min(1, 'required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  editing: Segment | null;
  onClose: () => void;
  createMutation: UseMutationResult<MutationResponse<Segment>, Error, SegmentCreate>;
  updateMutation: UseMutationResult<MutationResponse<Segment>, Error, { id: number; data: SegmentUpdate }>;
}

export function SegmentForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
  const getString = useString({ str: nomenclatureStrings });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: { code: '', name: '', market_id: 0, status_id: 0 },
  });

  const { data: markets = [] } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
  const { data: statuses = [] } = useQuery({ queryKey: ['directories', 'status_types'], queryFn: fetchStatusTypes, staleTime: Infinity });

  useEffect(() => {
    reset({
      code: editing?.code ?? '',
      name: editing?.name ?? '',
      market_id: editing?.market_id ?? 0,
      status_id: editing?.status_id ?? 0,
    });
  }, [editing, open, reset]);

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: values });
    else createMutation.mutate(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {cfl(getString(editing ? 'edit' : 'create'))} — {getString('segment')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <TextField
                  label={cfl(getString('code')) || 'code'}
                  fullWidth size="small"
                  {...field}
                  error={!!errors.code}
                  helperText={errors.code?.message ? getString(errors.code.message as any) : undefined}
                  slotProps={{ htmlInput: { maxLength: 8 } }}
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  label={cfl(getString('name')) || 'name'}
                  fullWidth size="small"
                  {...field}
                  error={!!errors.name}
                  helperText={errors.name?.message ? getString(errors.name.message as any) : undefined}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                />
              )}
            />
            <Controller
              name="market_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={cfl(getString('market')) || 'market'}
                  fullWidth size="small"
                  {...field}
                  value={field.value ?? 0}
                  error={!!errors.market_id}
                  helperText={errors.market_id?.message ? getString(errors.market_id.message as any) : undefined}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {markets.map((o: any) => (
                    <MenuItem key={o.id} value={o.id}>{o.name ?? o.code ?? o.id}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={cfl(getString('status')) || 'status'}
                  fullWidth size="small"
                  {...field}
                  value={field.value ?? 0}
                  error={!!errors.status_id}
                  helperText={errors.status_id?.message ? getString(errors.status_id.message as any) : undefined}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {statuses.map((o: any) => (
                    <MenuItem key={o.id} value={o.id}>{o.name ?? o.code ?? o.id}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={pending}>
            {getString('cancel')}
          </Button>
          <Button variant="contained" type="submit" disabled={pending}
            startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {getString(editing ? 'save' : 'create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}