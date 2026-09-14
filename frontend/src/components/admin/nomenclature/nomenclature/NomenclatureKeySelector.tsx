import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Paper, TextField, MenuItem, Typography } from '@mui/material';
import { fetchMarkets } from '../market/marketApi';
import { fetchSegments } from '../segment/segmentApi';
import { fetchCategories } from '../category/categoryApi';
import { fetchFamilies } from '../family/familyApi';
import { fetchKeyLinks1, fetchKeyLinks2, fetchKeyLinks3, type KeyLink } from '../nomenclature_key_link/keyLinkApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';

const NONE = 0;

interface SelectProps {
    label: string;
    value: number;
    disabled: boolean;
    placeholder: string;
    options: { id: number; label: string }[];
    onChange: (value: number) => void;
}

function CascadingSelect({ label, value, disabled, placeholder, options, onChange }: SelectProps) {
    return (
        <TextField
            select
            size="small"
            label={label}
            sx={{ minWidth: 200, flex: 1 }}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
        >
            <MenuItem value={NONE}>{placeholder}</MenuItem>
            {options.map((o) => (
                <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
            ))}
        </TextField>
    );
}

// 0 means "not selected" at that level.
export interface HierarchyFilter {
    marketId: number;
    segmentId: number;
    categoryId: number;
    familyId: number;
}

export const EMPTY_HIERARCHY: HierarchyFilter = { marketId: NONE, segmentId: NONE, categoryId: NONE, familyId: NONE };

interface NomenclatureKeySelectorProps {
    value: HierarchyFilter;
    onChange: (value: HierarchyFilter) => void;
}

export function NomenclatureKeySelector({ value, onChange }: NomenclatureKeySelectorProps) {
    const getString = useString({ str: nomenclatureStrings });

    const { marketId, segmentId, categoryId, familyId } = value;
    const [link1Id, setLink1Id] = useState(NONE);
    const [link2Id, setLink2Id] = useState(NONE);
    const [link3Id, setLink3Id] = useState(NONE);

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
    const { data: keys1 = [] } = useQuery({
        queryKey: ['nomenclature_key_links', 'level1', familyId],
        queryFn: () => fetchKeyLinks1(familyId), enabled: !!familyId,
        staleTime: 2 * 60 * 1000,
    });
    const { data: keys2 = [] } = useQuery({
        queryKey: ['nomenclature_key_links', 'level2', link1Id],
        queryFn: () => fetchKeyLinks2(link1Id), enabled: !!link1Id,
        staleTime: 2 * 60 * 1000,
    });
    const { data: keys3 = [] } = useQuery({
        queryKey: ['nomenclature_key_links', 'level3', link2Id],
        queryFn: () => fetchKeyLinks3(link2Id), enabled: !!link2Id,
        staleTime: 2 * 60 * 1000,
    });

    const keyOptions = (links: KeyLink[]) => links.map((l) => ({ id: l.id, label: l.key_name || `ID ${l.key_id}` }));

    const resetKeys = () => { setLink1Id(NONE); setLink2Id(NONE); setLink3Id(NONE); };
    const onMarketChange = (v: number) => {
        onChange({ marketId: v, segmentId: NONE, categoryId: NONE, familyId: NONE }); resetKeys();
    };
    const onSegmentChange = (v: number) => {
        onChange({ ...value, segmentId: v, categoryId: NONE, familyId: NONE }); resetKeys();
    };
    const onCategoryChange = (v: number) => {
        onChange({ ...value, categoryId: v, familyId: NONE }); resetKeys();
    };
    const onFamilyChange = (v: number) => {
        onChange({ ...value, familyId: v }); resetKeys();
    };
    const onKey1Change = (v: number) => { setLink1Id(v); setLink2Id(NONE); setLink3Id(NONE); };
    const onKey2Change = (v: number) => { setLink2Id(v); setLink3Id(NONE); };
    const onKey3Change = (v: number) => setLink3Id(v);

    const placeholder = cfl(getString('selectPlaceholder') || 'select…');

    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                {cfl(getString('nomenclature'))} — {cfl(getString('key_tree') || 'key tree')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                <CascadingSelect label={cfl(getString('market')) || 'market'} value={marketId} disabled={false}
                    placeholder={placeholder} options={markets.map((m) => ({ id: m.id, label: m.name }))}
                    onChange={onMarketChange} />
                <CascadingSelect label={cfl(getString('segment')) || 'segment'} value={segmentId} disabled={!marketId}
                    placeholder={placeholder} options={segments.map((s) => ({ id: s.id, label: s.name }))}
                    onChange={onSegmentChange} />
                <CascadingSelect label={cfl(getString('category')) || 'category'} value={categoryId} disabled={!segmentId}
                    placeholder={placeholder} options={categories.map((c) => ({ id: c.id, label: c.name }))}
                    onChange={onCategoryChange} />
                <CascadingSelect label={cfl(getString('family')) || 'family'} value={familyId} disabled={!categoryId}
                    placeholder={placeholder} options={families.map((f) => ({ id: f.id, label: f.name }))}
                    onChange={onFamilyChange} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <CascadingSelect label={cfl(getString('key_level_1')) || 'level 1 keys'} value={link1Id} disabled={!familyId}
                    placeholder={placeholder} options={keyOptions(keys1)} onChange={onKey1Change} />
                <CascadingSelect label={cfl(getString('key_level_2')) || 'level 2 keys'} value={link2Id} disabled={!link1Id}
                    placeholder={placeholder} options={keyOptions(keys2)} onChange={onKey2Change} />
                <CascadingSelect label={cfl(getString('key_level_3')) || 'level 3 keys'} value={link3Id} disabled={!link2Id}
                    placeholder={placeholder} options={keyOptions(keys3)} onChange={onKey3Change} />
            </Box>
        </Paper>
    );
}
