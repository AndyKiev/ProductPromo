import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, CircularProgress, Autocomplete,
} from '@mui/material';
import type { UseMutationResult } from '@tanstack/react-query';
import type { KeyLink, KeyLinkCreate, KeyLinkUpdate, MutationResponse } from './keyLinkApi';
import { AsyncAutocomplete, type AsyncOption } from '../_shared/AsyncAutocomplete';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';

const schema = z.object({
  status_id: z.number().min(1, 'required'),
  parent_id: z.number().min(1, 'required'),
  key_id: z.number().min(1, 'required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  level: number;
  editing: KeyLink | null;
  parentId: number;
  onClose: () => void;
  createMutation: UseMutationResult<MutationResponse<KeyLink>, Error, KeyLinkCreate>;
  updateMutation: UseMutationResult<MutationResponse<KeyLink>, Error, { id: number; data: KeyLinkUpdate }>;
  statusOptions: { id: number; label: string }[];
  searchKeys: (query: string) => Promise<AsyncOption[]>;
}

export function KeyLinkForm({
  open, level, editing, parentId, onClose,
  createMutation, updateMutation, statusOptions, searchKeys,
}: Props) {
  const getString = useString({ str: nomenclatureStrings });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: { status_id: statusOptions[0]?.id ?? 0, parent_id: parentId, key_id: 0 },
  });

  useEffect(() => {
    reset({
      status_id: editing ? editing.status_id : (statusOptions[0]?.id ?? 0),
      parent_id: editing ? editing.parent_id : parentId,
      key_id: editing ? editing.key_id : 0,
    });
  }, [editing, open, reset, parentId, statusOptions]);

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: { status_id: values.status_id, key_id: values.key_id } });
    else createMutation.mutate(values as KeyLinkCreate);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {cfl(getString(editing ? 'edit' : 'add'))} — Level {level}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={statusOptions}
                  value={statusOptions.find((o) => o.id === field.value) ?? null}
                  onChange={(_, v) => field.onChange(v?.id ?? 0)}
                  renderInput={(params) => (
                    <TextField {...params} label={cfl(getString('status')) || 'status'}
                      error={!!errors.status_id} helperText={errors.status_id?.message ? getString(errors.status_id.message as any) : undefined} />
                  )}
                />
              )}
            />
            <Controller
              name="key_id"
              control={control}
              render={({ field }) => (
                <AsyncAutocomplete
                  label={cfl(getString('key_name')) || 'key name'}
                  valueId={field.value || null}
                  valueLabel={editing?.key_name ?? null}
                  search={searchKeys}
                  onChange={(o) => field.onChange(o?.id ?? 0)}
                  error={!!errors.key_id}
                  helperText={errors.key_id?.message ? getString(errors.key_id.message as any) : undefined}
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
