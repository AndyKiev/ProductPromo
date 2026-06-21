import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Box, CircularProgress } from '@mui/material';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Market, MarketCreate, MarketUpdate, MutationResponse } from './marketApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';


interface Props {
    open: boolean;
    editing: Market | null;          // null = create mode
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Market>, Error, MarketCreate>;
    updateMutation: UseMutationResult<MutationResponse<Market>, Error, { id: number; data: MarketUpdate }>;
}

export function MarketForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
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
        else createMutation.mutate(payload as MarketCreate);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('market')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label={cfl(getString('name')) || 'name'} fullWidth size="small"
                    value={name} onChange={(e) => set_name(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 128 } }} />
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
