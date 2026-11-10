import type { UseMutationResult } from '@tanstack/react-query';
import type { Segment, SegmentCreate, SegmentUpdate, MutationResponse } from './segmentApi';
import { fetchMarkets } from '../market/marketApi';
import { CodeNameParentForm } from '../_shared/CodeNameParentForm';

interface Props {
    editing: Segment | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Segment>, Error, SegmentCreate>;
    updateMutation: UseMutationResult<MutationResponse<Segment>, Error, { id: number; data: SegmentUpdate }>;
}

/** Segment: code + name + market + status (see CodeNameParentForm). */
export function SegmentForm(props: Props) {
    return (
        <CodeNameParentForm {...props} entityKey="segment" parentField="market_id" parentLabelKey="market"
            parentQueryKey={['markets']} fetchParents={() => fetchMarkets()} />
    );
}
