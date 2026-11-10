import type { UseMutationResult } from '@tanstack/react-query';
import type { Family, FamilyCreate, FamilyUpdate, MutationResponse } from './familyApi';
import { fetchCategories } from '../category/categoryApi';
import { CodeNameParentForm } from '../_shared/CodeNameParentForm';

interface Props {
    editing: Family | null;
    onClose: () => void;
    createMutation: UseMutationResult<MutationResponse<Family>, Error, FamilyCreate>;
    updateMutation: UseMutationResult<MutationResponse<Family>, Error, { id: number; data: FamilyUpdate }>;
}

/** Family: code + name + category + status (see CodeNameParentForm). */
export function FamilyForm(props: Props) {
    return (
        <CodeNameParentForm {...props} entityKey="family" parentField="category_id" parentLabelKey="category"
            parentQueryKey={['categories']} fetchParents={() => fetchCategories()} />
    );
}
