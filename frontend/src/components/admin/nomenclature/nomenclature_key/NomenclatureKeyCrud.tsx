import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid';
import { fetchNomenclatureKeys, type NomenclatureKey } from './nomenclature_keyApi';
import { NOMENCLATURE_KEY_QK, useNomenclatureKeyMutations } from './useNomenclatureKeyMutations';
import { useNomenclatureKeyColumns } from './useNomenclatureKeyColumns';
import { NomenclatureKeyForm } from './NomenclatureKeyForm';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { EMPTY } from '@ui/utils/empty';

export function NomenclatureKeyCrud() {
    const getString = useString({ str: nomenclatureStrings });
    // Form mounts fresh per open (key), so it never shows the previous record.
    const [form, setForm] = useState<{ key: number; editing: NomenclatureKey | null } | null>(null);
    const [rowToDelete, setRowToDelete] = useState<NomenclatureKey | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    const { data: rows = EMPTY, isLoading, error } = useQuery({
        queryKey: NOMENCLATURE_KEY_QK, queryFn: () => fetchNomenclatureKeys(), staleTime: 2 * 60 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useNomenclatureKeyMutations({
        onCreateSuccess: () => setForm(null),
        onUpdateSuccess: () => setForm(null),
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useNomenclatureKeyColumns({
        getString,
        onEdit: (row) => setForm({ key: Date.now(), editing: row }),
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <CrudPage title={cfl(getString('keys'))} onAdd={() => setForm({ key: Date.now(), editing: null })}
            isLoading={isLoading} error={error}
            dialogs={<>
                {form && <NomenclatureKeyForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
                    createMutation={createMutation} updateMutation={updateMutation} />}
                <ConfirmDeleteDialog open={!!rowToDelete} label={rowToDelete?.name}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                    onCancel={() => setRowToDelete(null)} />
            </>}>
            <DataGrid rows={rows} columns={columns}
                paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]} disableRowSelectionOnClick getRowId={(r) => r.id}
                localeText={localeText} hideFooterSelectedRowCount />
        </CrudPage>
    );
}
