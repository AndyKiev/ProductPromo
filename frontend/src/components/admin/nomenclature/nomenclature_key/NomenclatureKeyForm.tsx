import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Box, CircularProgress } from '@mui/material';
import type { UseMutationResult } from '@tanstack/react-query';
import type { NomenclatureKey, NomenclatureKeyCreate, NomenclatureKeyUpdate, MutationResponse } from './nomenclature_keyApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';


interface Props {
    open: boolean;
    editing: NomenclatureKey | null;          // null = create mode
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<NomenclatureKey>, Error, NomenclatureKeyCreate>;
    updateMutation: UseMutationResult<MutationResponse<NomenclatureKey>, Error, { id: number; data: NomenclatureKeyUpdate }>;
}

export function NomenclatureKeyForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: nomenclatureStrings });
    const [name, set_name] = useState<string>('');


    useEffect(() => {
        if (editing) {
            set_name(String((editing as any).name ?? ''));
        } else {
        set_name('');
        }
    }, [editing, open]);

    const pending = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = () => {
        const payload = {
            name: name,
        };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload as NomenclatureKeyCreate);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('nomenclature')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label={cfl(getString('key_name')) || 'key_name'} fullWidth size="small"
                    value={name} onChange={(e) => set_name(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 64 } }} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose} disabled={pending}>{getString('cancel')}</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={pending}
                    startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                    {getString(editing ? 'save' : 'create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
