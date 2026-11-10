import type { UseMutationResult } from '@tanstack/react-query';
import type { Category, CategoryCreate, CategoryUpdate, MutationResponse } from './categoryApi';
import { fetchSegments } from '../segment/segmentApi';
import { CodeNameParentForm } from '../_shared/CodeNameParentForm';

interface Props {
    editing: Category | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Category>, Error, CategoryCreate>;
    updateMutation: UseMutationResult<MutationResponse<Category>, Error, { id: number; data: CategoryUpdate }>;
}

/** Category: code + name + segment + status (see CodeNameParentForm). */
export function CategoryForm(props: Props) {
    return (
        <CodeNameParentForm {...props} entityKey="category" parentField="segment_id" parentLabelKey="segment"
            parentQueryKey={['segments']} fetchParents={() => fetchSegments()} />
    );
}
