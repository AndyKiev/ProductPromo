import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid';
import { fetchFamilies, type Family } from './familyApi';
import { FAMILY_QK, useFamilyMutations } from './useFamilyMutations';
import { useFamilyColumns } from './useFamilyColumns';
import { FamilyForm } from './FamilyForm';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { EMPTY } from '@ui/utils/empty';

export function FamilyCrud() {
    const getString = useString({ str: nomenclatureStrings });
    // Form mounts fresh per open (key), so it never shows the previous record.
    const [form, setForm] = useState<{ key: number; editing: Family | null } | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Family | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    const { data: rows = EMPTY, isLoading, error } = useQuery({
        queryKey: FAMILY_QK, queryFn: () => fetchFamilies(), staleTime: 2 * 60 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useFamilyMutations({
        onCreateSuccess: () => setForm(null),
        onUpdateSuccess: () => setForm(null),
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useFamilyColumns({
        getString,
        onEdit: (row) => setForm({ key: Date.now(), editing: row }),
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <CrudPage title={cfl(getString('families'))} onAdd={() => setForm({ key: Date.now(), editing: null })}
            isLoading={isLoading} error={error}
            dialogs={<>
                {form && <FamilyForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
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
