import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid';
import { fetchMarkets, type Market } from './marketApi';
import { MARKET_QK, useMarketMutations } from './useMarketMutations';
import { useMarketColumns } from './useMarketColumns';
import { MarketForm } from './MarketForm';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import nomenclatureStrings from '@ui/components/admin/nomenclature/_shared/nomenclatureStrings';
import { EMPTY } from '@ui/utils/empty';

export function MarketCrud() {
    const getString = useString({ str: nomenclatureStrings });
    // Form mounts fresh per open (key), so it never shows the previous record.
    const [form, setForm] = useState<{ key: number; editing: Market | null } | null>(null);
    const [rowToDelete, setRowToDelete] = useState<Market | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

    const { data: rows = EMPTY, isLoading, error } = useQuery({
        queryKey: MARKET_QK, queryFn: () => fetchMarkets(), staleTime: 2 * 60 * 1000,
    });

    const { createMutation, updateMutation, deleteMutation } = useMarketMutations({
        onCreateSuccess: () => setForm(null),
        onUpdateSuccess: () => setForm(null),
        onDeleteSuccess: () => setRowToDelete(null),
    });

    const localeText = useDataGridLocale();
    const columns = useMarketColumns({
        getString,
        onEdit: (row) => setForm({ key: Date.now(), editing: row }),
        onDelete: (row) => setRowToDelete(row),
        actionsPending: updateMutation.isPending || deleteMutation.isPending,
    });

    return (
        <CrudPage title={cfl(getString('markets'))} onAdd={() => setForm({ key: Date.now(), editing: null })}
            isLoading={isLoading} error={error}
            dialogs={<>
                {form && <MarketForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
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
