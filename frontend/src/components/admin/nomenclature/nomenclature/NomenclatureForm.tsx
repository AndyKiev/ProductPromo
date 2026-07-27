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
import type { Nomenclature, NomenclatureCreate, NomenclatureUpdate, MutationResponse } from './nomenclatureApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';
import { fetchMarkets } from '../market/marketApi';
import { fetchSegments } from '../segment/segmentApi';
import { fetchCategories } from '../category/categoryApi';
import { fetchFamilies } from '../family/familyApi';

const schema = z.object({
  market_id: z.number({ message: 'required' }).min(1, 'required'),
  segment_id: z.number({ message: 'required' }).min(1, 'required'),
  category_id: z.number({ message: 'required' }).min(1, 'required'),
  family_id: z.number({ message: 'required' }).min(1, 'required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  editing: Nomenclature | null;
  onClose: () => void;
  createMutation: UseMutationResult<MutationResponse<Nomenclature>, Error, NomenclatureCreate>;
  updateMutation: UseMutationResult<MutationResponse<Nomenclature>, Error, { id: number; data: NomenclatureUpdate }>;
}

export function NomenclatureForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
  const getString = useString({ str: nomenclatureStrings });
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: { market_id: 0, segment_id: 0, category_id: 0, family_id: 0 },
  });

  const marketId = watch('market_id');
  const segmentId = watch('segment_id');
  const categoryId = watch('category_id');

  const { data: markets = [] } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
  const { data: segments = [] } = useQuery({
    queryKey: ['segments', marketId], queryFn: () => fetchSegments(marketId), enabled: !!marketId,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', segmentId], queryFn: () => fetchCategories(segmentId), enabled: !!segmentId,
  });
  const { data: families = [] } = useQuery({
    queryKey: ['families', categoryId], queryFn: () => fetchFamilies(categoryId), enabled: !!categoryId,
  });

  useEffect(() => {
    reset({
      market_id: editing?.market_id ?? 0,
      segment_id: editing?.segment_id ?? 0,
      category_id: editing?.category_id ?? 0,
      family_id: editing?.family_id ?? 0,
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
        {cfl(getString(editing ? 'edit' : 'create'))} — {getString('nomenclature')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                  onChange={(e) => { field.onChange(Number(e.target.value)); reset((prev) => ({ ...prev, segment_id: 0, category_id: 0, family_id: 0 })); }}
                >
                  {markets.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller
              name="segment_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={cfl(getString('segment')) || 'segment'}
                  fullWidth size="small"
                  disabled={!marketId}
                  {...field}
                  value={field.value ?? 0}
                  error={!!errors.segment_id}
                  helperText={errors.segment_id?.message ? getString(errors.segment_id.message as any) : undefined}
                  onChange={(e) => { field.onChange(Number(e.target.value)); reset((prev) => ({ ...prev, category_id: 0, family_id: 0 })); }}
                >
                  {segments.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={cfl(getString('category')) || 'category'}
                  fullWidth size="small"
                  disabled={!segmentId}
                  {...field}
                  value={field.value ?? 0}
                  error={!!errors.category_id}
                  helperText={errors.category_id?.message ? getString(errors.category_id.message as any) : undefined}
                  onChange={(e) => { field.onChange(Number(e.target.value)); reset((prev) => ({ ...prev, family_id: 0 })); }}
                >
                  {categories.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller
              name="family_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={cfl(getString('family')) || 'family'}
                  fullWidth size="small"
                  disabled={!categoryId}
                  {...field}
                  value={field.value ?? 0}
                  error={!!errors.family_id}
                  helperText={errors.family_id?.message ? getString(errors.family_id.message as any) : undefined}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {families.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
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