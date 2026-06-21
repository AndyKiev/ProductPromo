import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Box, CircularProgress } from '@mui/material';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Nomenclature, NomenclatureCreate, NomenclatureUpdate, MutationResponse } from './nomenclatureApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';
import { fetchMarkets } from '../market/marketApi';
import { fetchSegments } from '../segment/segmentApi';
import { fetchCategories } from '../category/categoryApi';
import { fetchFamilies } from '../family/familyApi';

interface Props {
    open: boolean;
    editing: Nomenclature | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Nomenclature>, Error, NomenclatureCreate>;
    updateMutation: UseMutationResult<MutationResponse<Nomenclature>, Error, { id: number; data: NomenclatureUpdate }>;
}

// Cascading classification picker: market → segment → category → family.
// Each child list is fetched filtered by the chosen parent id (backend list
// endpoints accept market_id / segment_id / category_id).
export function NomenclatureForm({ open, editing, onClose, createMutation, updateMutation }: Props) {
    const getString = useString({ str: nomenclatureStrings });

    const [marketId, setMarketId] = useState<string>('');
    const [segmentId, setSegmentId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [familyId, setFamilyId] = useState<string>('');

    const { data: markets = [] } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: segments = [] } = useQuery({
        queryKey: ['segments', { marketId }], queryFn: () => fetchSegments(Number(marketId)), enabled: !!marketId,
    });
    const { data: categories = [] } = useQuery({
        queryKey: ['categories', { segmentId }], queryFn: () => fetchCategories(Number(segmentId)), enabled: !!segmentId,
    });
    const { data: families = [] } = useQuery({
        queryKey: ['families', { categoryId }], queryFn: () => fetchFamilies(Number(categoryId)), enabled: !!categoryId,
    });

    useEffect(() => {
        if (editing) {
            setMarketId(String(editing.market_id ?? ''));
            setSegmentId(String(editing.segment_id ?? ''));
            setCategoryId(String(editing.category_id ?? ''));
            setFamilyId(String(editing.family_id ?? ''));
        } else {
            setMarketId(''); setSegmentId(''); setCategoryId(''); setFamilyId('');
        }
    }, [editing, open]);

    const pending = createMutation.isPending || updateMutation.isPending;
    const canSubmit = marketId && segmentId && categoryId && familyId;

    const handleSubmit = () => {
        const payload = {
            market_id: Number(marketId),
            segment_id: Number(segmentId),
            category_id: Number(categoryId),
            family_id: Number(familyId),
        };
        if (editing) updateMutation.mutate({ id: editing.id, data: payload });
        else createMutation.mutate(payload);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{cfl(getString(editing ? 'edit' : 'create'))} — {getString('nomenclature')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField select label={cfl(getString('market')) || 'market'} fullWidth size="small"
                        value={marketId}
                        onChange={(e) => { setMarketId(e.target.value); setSegmentId(''); setCategoryId(''); setFamilyId(''); }}>
                        {markets.map((o) => <MenuItem key={o.id} value={String(o.id)}>{o.name}</MenuItem>)}
                    </TextField>

                    <TextField select label={cfl(getString('segment')) || 'segment'} fullWidth size="small"
                        value={segmentId} disabled={!marketId}
                        onChange={(e) => { setSegmentId(e.target.value); setCategoryId(''); setFamilyId(''); }}>
                        {segments.map((o) => <MenuItem key={o.id} value={String(o.id)}>{o.name}</MenuItem>)}
                    </TextField>

                    <TextField select label={cfl(getString('category')) || 'category'} fullWidth size="small"
                        value={categoryId} disabled={!segmentId}
                        onChange={(e) => { setCategoryId(e.target.value); setFamilyId(''); }}>
                        {categories.map((o) => <MenuItem key={o.id} value={String(o.id)}>{o.name}</MenuItem>)}
                    </TextField>

                    <TextField select label={cfl(getString('family')) || 'family'} fullWidth size="small"
                        value={familyId} disabled={!categoryId}
                        onChange={(e) => setFamilyId(e.target.value)}>
                        {families.map((o) => <MenuItem key={o.id} value={String(o.id)}>{o.name}</MenuItem>)}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose} disabled={pending}>{getString('cancel')}</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={pending || !canSubmit}
                    startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                    {getString(editing ? 'save' : 'create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
