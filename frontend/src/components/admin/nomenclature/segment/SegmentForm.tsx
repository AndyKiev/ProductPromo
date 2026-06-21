import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Box, CircularProgress } from '@mui/material';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Segment, SegmentCreate, SegmentUpdate, MutationResponse } from './segmentApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';
import { fetchMarkets } from '../market/marketApi';
import { fetchStatusTypes } from '../status_type/statusTypeApi';

interface Props {
    open: boolean;
    editing: Segment | null;          // null = create mode
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Segment>, Error, SegmentCreate>;
    updateMutation: UseMutationResult<MutationResponse<Segment>, Error, { id: number; data: SegmentUpdate }>;
}

export function SegmentForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: nomenclatureStrings });
    const [market_id, set_market_id] = useState<string>('');
    const [status_id, set_status_id] = useState<string>('');
    const [code, set_code] = useState<string>('');
    const [name, set_name] = useState<string>('');
    const { data: market_idOpts = [] } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: status_idOpts = [] } = useQuery({ queryKey: ['directories','status_types'], queryFn: fetchStatusTypes, staleTime: Infinity });

    useEffect(() => {
        if (editing) {
            set_market_id(String((editing as any).market_id ?? ''));
            set_status_id(String((editing as any).status_id ?? ''));
            set_code(String((editing as any).code ?? ''));
            set_name(String((editing as any).name ?? ''));
        } else {
        set_market_id('');
        set_status_id('');
        set_code('');
        set_name('');
        }
    }, [editing, open]);

    const pending = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = () => {
        const payload = {
            market_id: Number(market_id),
            status_id: Number(status_id),
            code: code,
            name: name,
        };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload as SegmentCreate);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('segment')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label={cfl(getString('code')) || 'code'} fullWidth size="small"
                    value={code} onChange={(e) => set_code(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 8 } }} />
                <TextField label={cfl(getString('name')) || 'name'} fullWidth size="small"
                    value={name} onChange={(e) => set_name(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 64 } }} />
                <TextField select label={cfl(getString('market')) || 'market'} fullWidth size="small"
                    value={market_id} onChange={(e) => set_market_id(e.target.value)}>
                    {market_idOpts.map((o: any) => <MenuItem key={o.id} value={String(o.id)}>{o.name ?? o.code ?? o.id}</MenuItem>)}
                </TextField>
                <TextField select label={cfl(getString('status')) || 'status'} fullWidth size="small"
                    value={status_id} onChange={(e) => set_status_id(e.target.value)}>
                    {status_idOpts.map((o: any) => <MenuItem key={o.id} value={String(o.id)}>{o.name ?? o.code ?? o.id}</MenuItem>)}
                </TextField>
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
