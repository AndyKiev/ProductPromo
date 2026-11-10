import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarkets } from '../market/marketApi';
import { fetchSegments } from '../segment/segmentApi';
import { fetchCategories } from '../category/categoryApi';
import { fetchFamilies } from '../family/familyApi';
import { fetchKeyLinks1, fetchKeyLinks2, fetchKeyLinks3, type KeyLink } from '../nomenclature_key_link/keyLinkApi';
import { Combobox } from '@ui/components/common/Combobox';
import { EMPTY } from '@ui/utils/empty';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';

const NONE = 0;

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

    const { data: markets = EMPTY } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets });
    const { data: segments = EMPTY } = useQuery({
        queryKey: ['segments', marketId], queryFn: () => fetchSegments(marketId), enabled: !!marketId,
    });
    const { data: categories = EMPTY } = useQuery({
        queryKey: ['categories', segmentId], queryFn: () => fetchCategories(segmentId), enabled: !!segmentId,
    });
    const { data: families = EMPTY } = useQuery({
        queryKey: ['families', categoryId], queryFn: () => fetchFamilies(categoryId), enabled: !!categoryId,
    });
    const { data: keys1 = EMPTY } = useQuery({
        queryKey: ['nomenclature_key_links', 'level1', familyId],
        queryFn: () => fetchKeyLinks1(familyId), enabled: !!familyId,
        staleTime: 2 * 60 * 1000,
    });
    const { data: keys2 = EMPTY } = useQuery({
        queryKey: ['nomenclature_key_links', 'level2', link1Id],
        queryFn: () => fetchKeyLinks2(link1Id), enabled: !!link1Id,
        staleTime: 2 * 60 * 1000,
    });
    const { data: keys3 = EMPTY } = useQuery({
        queryKey: ['nomenclature_key_links', 'level3', link2Id],
        queryFn: () => fetchKeyLinks3(link2Id), enabled: !!link2Id,
        staleTime: 2 * 60 * 1000,
    });

    const keyOptions = (links: KeyLink[]) => links.map((l) => ({ id: l.id, name: l.key_name || `ID ${l.key_id}` }));

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
        <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">
                {cfl(getString('nomenclature'))} — {cfl(getString('key_tree') || 'key tree')}
            </h3>

            <div className="mb-3 flex flex-wrap gap-3">
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('market')) || 'market'}
                    value={marketId} placeholder={placeholder} disabled={false}
                    options={markets.map((m) => ({ id: m.id, name: m.name }))} onChange={onMarketChange} />
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('segment')) || 'segment'}
                    value={segmentId} placeholder={placeholder} disabled={!marketId}
                    options={segments.map((s) => ({ id: s.id, name: s.name, code: s.code }))} onChange={onSegmentChange} />
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('category')) || 'category'}
                    value={categoryId} placeholder={placeholder} disabled={!segmentId}
                    options={categories.map((c) => ({ id: c.id, name: c.name, code: c.code }))} onChange={onCategoryChange} />
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('family')) || 'family'}
                    value={familyId} placeholder={placeholder} disabled={!categoryId}
                    options={families.map((f) => ({ id: f.id, name: f.name, code: f.code }))} onChange={onFamilyChange} />
            </div>

            <div className="flex flex-wrap gap-3">
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('key_level_1')) || 'level 1 keys'}
                    value={link1Id} placeholder={placeholder} disabled={!familyId}
                    options={keyOptions(keys1)} onChange={onKey1Change} />
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('key_level_2')) || 'level 2 keys'}
                    value={link2Id} placeholder={placeholder} disabled={!link1Id}
                    options={keyOptions(keys2)} onChange={onKey2Change} />
                <Combobox className="min-w-[200px] flex-1" label={cfl(getString('key_level_3')) || 'level 3 keys'}
                    value={link3Id} placeholder={placeholder} disabled={!link2Id}
                    options={keyOptions(keys3)} onChange={onKey3Change} />
            </div>
        </div>
    );
}
