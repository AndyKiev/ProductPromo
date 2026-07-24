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
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import type { UseMutationResult } from '@tanstack/react-query';
import type { NomenclatureKey, NomenclatureKeyCreate, NomenclatureKeyUpdate, MutationResponse } from './nomenclature_keyApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';

const schema = z.object({
  name: z.string().min(1, 'required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  editing: NomenclatureKey | null;
  onClose: () => void;
  createMutation: UseMutationResult<MutationResponse<NomenclatureKey>, Error, NomenclatureKeyCreate>;
  updateMutation: UseMutationResult<MutationResponse<NomenclatureKey>, Error, { id: number; data: NomenclatureKeyUpdate }>;
}

export function NomenclatureKeyForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
  const getString = useString({ str: nomenclatureStrings });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: { name: '' },
  });

  useEffect(() => {
    reset({ name: editing ? editing.name : '' });
  }, [editing, open, reset]);

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: values });
    else createMutation.mutate(values as NomenclatureKeyCreate);
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
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  label={cfl(getString('key_name')) || 'key_name'}
                  fullWidth
                  size="small"
                  {...field}
                  error={!!errors.name}
                  helperText={errors.name?.message ? getString(errors.name.message as any) : undefined}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                />
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