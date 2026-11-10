// Key tree of a family: level 1 keys, their level 2 children, their level 3
// children. Children load when a node is expanded.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Loader2, Plus } from 'lucide-react';
import { Badge } from '@ui/components/ui/badge';
import { Button } from '@ui/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/components/ui/tooltip';
import { AsyncCombobox, type AsyncOption } from '@ui/components/common/AsyncCombobox';
import { entityLabel } from '@ui/components/common/Combobox';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { RowActions } from '@ui/components/common/RowActions';
import { searchFamilies } from '../family/familyApi';
import { searchNomenclatureKeys } from '../nomenclature_key/nomenclature_keyApi';
import { fetchKeyLinks1, fetchKeyLinks2, fetchKeyLinks3, type KeyLink } from './keyLinkApi';
import { KEY_LINK_QK, useKeyLink1Mutations, useKeyLink2Mutations, useKeyLink3Mutations } from './useKeyLinkMutations';
import { KeyLinkForm } from './KeyLinkForm';
import { axiosInstance } from '@ui/api/axiosInstance';
import { BASE_URL } from '@ui/utils/eNums';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { EMPTY } from '@ui/utils/empty';

const fetchStatusTypes = async () => {
    const res = await axiosInstance.get(`${BASE_URL}/nomenclature/key-links/status-types`);
    return (res.data ?? []) as { id: number; name: string; name_u: string; name_e: string }[];
};

type NodeHandlers = {
    onEdit: (node: KeyLink, level: number) => void;
    onDelete: (node: KeyLink, level: number) => void;
    onAddChild: (parentId: number, level: number) => void;
};

function TreeNode({ node, level, ...handlers }: { node: KeyLink; level: number } & NodeHandlers) {
    const getString = useString({ str: nomenclatureStrings });
    const [expanded, setExpanded] = useState(false);
    const canHaveChildren = level < 3;
    const fetcher = level === 2 ? fetchKeyLinks3 : fetchKeyLinks2;
    const { data: children = EMPTY, isLoading } = useQuery({
        queryKey: [...KEY_LINK_QK, `level${level + 1}`, node.id] as const,
        queryFn: () => fetcher(node.id),
        enabled: expanded && canHaveChildren,
        staleTime: 2 * 60 * 1000,
    });
    const addLabel = `${cfl(getString('add'))} L${level + 1}`;

    return (
        <div>
            <div className="flex items-center gap-1.5 rounded-md py-1 pr-1 hover:bg-accent" style={{ paddingLeft: (level - 1) * 28 }}>
                {canHaveChildren ? (
                    <Button variant="ghost" size="icon-sm" aria-expanded={expanded} aria-label={node.key_name || `L${level}`}
                        onClick={() => setExpanded((e) => !e)}>
                        {expanded ? <ChevronDown /> : <ChevronRight />}
                    </Button>
                ) : <span className="w-8" />}
                <span className="w-8 text-sm font-medium text-muted-foreground">L{level}</span>
                <Badge variant="secondary" className="font-semibold">{node.key_name || `ID ${node.key_id}`}</Badge>
                <span className="ml-1 text-xs text-muted-foreground">{node.status_name || '-'}</span>
                <span className="flex-1" />
                <RowActions actions={[
                    { kind: 'edit', onClick: () => handlers.onEdit(node, level) },
                    { kind: 'delete', onClick: () => handlers.onDelete(node, level) },
                ]} />
                {canHaveChildren && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="text-primary" aria-label={addLabel}
                                onClick={() => handlers.onAddChild(node.id, level)}>
                                <Plus />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{addLabel}</TooltipContent>
                    </Tooltip>
                )}
            </div>
            {canHaveChildren && expanded && (
                isLoading
                    ? <Loader2 className="my-1 size-4 animate-spin text-muted-foreground" style={{ marginLeft: level * 28 + 8 }} />
                    : children.length
                        ? children.map((child) => <TreeNode key={child.id} node={child} level={level + 1} {...handlers} />)
                        : <p className="py-1 text-xs text-muted-foreground" style={{ paddingLeft: level * 28 + 8 }}>
                            {getString('no_children') || 'no children'}
                        </p>
            )}
        </div>
    );
}

export function KeyLinkTree() {
    const getString = useString({ str: nomenclatureStrings });
    const [family, setFamily] = useState<AsyncOption | null>(null);
    // Form mounts fresh per open (key).
    const [form, setForm] = useState<{ key: number; level: number; parentId: number; editing: KeyLink | null } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ node: KeyLink; level: number } | null>(null);
    const familyId = family?.id ?? null;

    const { data: statusTypes = EMPTY, isLoading: statusLoading } = useQuery({
        queryKey: ['key_link_status_types'], queryFn: fetchStatusTypes, staleTime: 5 * 60 * 1000,
    });
    const { data: l1 = EMPTY, isLoading: l1Loading } = useQuery({
        queryKey: [...KEY_LINK_QK, 'level1', familyId],
        queryFn: () => fetchKeyLinks1(familyId ?? undefined),
        enabled: !!familyId,
        staleTime: 2 * 60 * 1000,
    });

    const searchFamilyOptions = async (q: string): Promise<AsyncOption[]> =>
        (await searchFamilies(q)).map((f) => ({ id: f.id, label: entityLabel(f) }));
    const searchKeyOptions = async (q: string): Promise<AsyncOption[]> =>
        (await searchNomenclatureKeys(q)).map((k) => ({ id: k.id, label: k.name }));

    const l1Mutations = useKeyLink1Mutations({ onSuccess: () => setForm(null) });
    const l2Mutations = useKeyLink2Mutations({ onSuccess: () => setForm(null) });
    const l3Mutations = useKeyLink3Mutations({ onSuccess: () => setForm(null) });
    const mutationsFor = (level: number) => (level === 2 ? l2Mutations : level === 3 ? l3Mutations : l1Mutations);

    const handlers: NodeHandlers = {
        onEdit: (node, level) => setForm({ key: Date.now(), level, parentId: node.parent_id, editing: node }),
        onDelete: (node, level) => setDeleteTarget({ node, level }),
        onAddChild: (parentId, level) => setForm({ key: Date.now(), level: level + 1, parentId, editing: null }),
    };
    const deleting = deleteTarget ? mutationsFor(deleteTarget.level).deleteMutation : null;
    const statusOptions = statusTypes.map((s) => ({ id: s.id, name: s.name || String(s.id) }));

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="mb-3 flex shrink-0 flex-wrap items-end gap-4">
                <h2 className="text-xl font-semibold">{cfl(getString('key_tree') || 'key tree')}</h2>
                <AsyncCombobox className="min-w-[280px] max-w-[480px] flex-1" label={cfl(getString('family'))}
                    valueId={familyId} valueLabel={family?.label ?? null} search={searchFamilyOptions} onChange={setFamily} />
                {familyId && (
                    <Button onClick={() => setForm({ key: Date.now(), level: 1, parentId: familyId, editing: null })}>
                        <Plus />{cfl(getString('add'))} L1
                    </Button>
                )}
            </div>

            {statusLoading && <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>}
            {!statusLoading && !familyId && (
                <p className="p-2 text-muted-foreground">
                    {cfl(getString('select_family_to_view_keys') || 'Select a family to view its key tree')}
                </p>
            )}
            {!statusLoading && familyId && (
                // The tree scrolls inside its card; the section frame itself never scrolls.
                <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border bg-card p-2">
                    {l1Loading
                        ? <div className="flex justify-center p-4"><Loader2 className="size-5 animate-spin text-primary" /></div>
                        : l1.length === 0
                            ? <p className="p-4 text-center text-muted-foreground">
                                {cfl(getString('no_level1_keys') || 'No level 1 keys. Click "Add L1" to create one.')}
                            </p>
                            : l1.map((node) => <TreeNode key={node.id} node={node} level={1} {...handlers} />)}
                </div>
            )}

            {form && (
                <KeyLinkForm key={form.key} level={form.level} editing={form.editing} parentId={form.parentId}
                    onClose={() => setForm(null)}
                    createMutation={mutationsFor(form.level).createMutation}
                    updateMutation={mutationsFor(form.level).updateMutation}
                    statusOptions={statusOptions} searchKeys={searchKeyOptions} />
            )}
            <ConfirmDeleteDialog open={!!deleteTarget}
                label={deleteTarget ? (deleteTarget.node.key_name || `ID ${deleteTarget.node.id}`) : undefined}
                isPending={!!deleting?.isPending}
                onConfirm={() => deleteTarget && deleting?.mutate(deleteTarget.node.id, { onSuccess: () => setDeleteTarget(null) })}
                onCancel={() => setDeleteTarget(null)} />
        </div>
    );
}
