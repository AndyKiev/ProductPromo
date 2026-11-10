import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid';
import { fetchNomenclatures, type Nomenclature } from './nomenclatureApi';
import { NOMENCLATURE_QK, useNomenclatureMutations } from './useNomenclatureMutations';
import { useNomenclatureColumns } from './useNomenclatureColumns';
import { NomenclatureForm } from './NomenclatureForm';
import { EMPTY_HIERARCHY, NomenclatureKeySelector, type HierarchyFilter } from './NomenclatureKeySelector';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { EMPTY } from '@ui/utils/empty';

export function NomenclatureCrud() {
    const getString = useString({ str: nomenclatureStrings });
    const [form, setForm] = useState<{ key: number; editing: Nomenclature | null } | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Nomenclature | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filter, setFilter] = useState<HierarchyFilter>(EMPTY_HIERARCHY);

    const { data: rows = EMPTY, isLoading, error } = useQuery({
        queryKey: NOMENCLATURE_QK, queryFn: () => fetchNomenclatures(), staleTime: 2 * 60 * 1000,
    });

    // The endpoint returns every link (~5k rows) in one call, so the selector filters client-side.
    const filteredRows = useMemo(() => rows.filter((r) =>
        (!filter.marketId || r.market_id === filter.marketId)
        && (!filter.segmentId || r.segment_id === filter.segmentId)
        && (!filter.categoryId || r.category_id === filter.categoryId)
        && (!filter.familyId || r.family_id === filter.familyId)), [rows, filter]);

    const onFilterChange = (next: HierarchyFilter) => {
        setFilter(next);
        setPaginationModel((p) => ({ ...p, page: 0 }));
    };

    const { createMutation, updateMutation, deleteMutation } = useNomenclatureMutations({
        onCreateSuccess: () => setForm(null),
        onUpdateSuccess: () => setForm(null),
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useNomenclatureColumns({
        getString,
        onEdit: (row) => setForm({ key: Date.now(), editing: row }),
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <CrudPage title={cfl(getString('links'))} onAdd={() => setForm({ key: Date.now(), editing: null })}
            isLoading={isLoading} error={error}
            toolbar={<NomenclatureKeySelector value={filter} onChange={onFilterChange} />}
            dialogs={<>
                {form && <NomenclatureForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
                    createMutation={createMutation} updateMutation={updateMutation} />}
                <ConfirmDeleteDialog open={!!rowToDelete}
                    label={rowToDelete ? `${rowToDelete.market_name} / ${rowToDelete.family_name}` : undefined}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                    onCancel={() => setRowToDelete(null)} />
            </>}>
            <DataGrid rows={filteredRows} columns={columns}
                paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]} disableRowSelectionOnClick getRowId={(r) => r.id}
                localeText={localeText} hideFooterSelectedRowCount />
        </CrudPage>
    );
}
