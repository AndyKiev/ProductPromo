import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { CrudPage } from '@ui/components/common/CrudPage';
import { ConfirmDeleteDialog } from '@ui/components/common/ConfirmDeleteDialog';
import { RowActions } from '@ui/components/common/RowActions';
import { notify, notifyApiError } from '@ui/components/common/notify';
import { TaxRateForm } from './TaxRateForm';
import { fetchTaxRates, createTaxRate, updateTaxRate, deleteTaxRate, type TaxRate } from './taxRateApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import { formatToUkrDate } from '@ui/utils/dateFormatter';
import { useDataGridLocale } from '@ui/hooks/useDataGridLocale';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { EMPTY } from '@ui/utils/empty';

const TAX_RATES_QK = ['tax_rates'] as const;

export function TaxRateCrud() {
    const getString = useString({ str: catalogStrings });
    const qc = useQueryClient();
    const [form, setForm] = useState<{ key: number; editing: TaxRate | null } | null>(null);
    const [rowToDelete, setRowToDelete] = useState<TaxRate | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

    const { data: rows = EMPTY, isLoading, error } = useQuery({
        queryKey: TAX_RATES_QK, queryFn: () => fetchTaxRates(), staleTime: 2 * 60 * 1000,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: TAX_RATES_QK });
    const createMutation = useMutation({
        mutationFn: createTaxRate,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); setForm(null); },
        onError: (err) => notifyApiError(err),
    });
    const updateMutation = useMutation({
        mutationFn: updateTaxRate,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); setForm(null); },
        onError: (err) => notifyApiError(err),
    });
    const deleteMutation = useMutation({
        mutationFn: deleteTaxRate,
        onSuccess: async (res) => { await invalidate(); notify(res.detail); setRowToDelete(null); },
        onError: (err) => notifyApiError(err),
    });

    const busy = updateMutation.isPending || deleteMutation.isPending;
    const localeText = useDataGridLocale();
    const columns: GridColDef<TaxRate>[] = [
        { field: 'tax_type_code', headerName: cfl(getString('taxType')), flex: 1, minWidth: 180, valueGetter: (_v, r) => r.tax_type_name || r.tax_type_code || '' },
        { field: 'rate', headerName: cfl(getString('rate')), width: 120, type: 'number', valueGetter: (v: string) => Number(v), valueFormatter: (v: number) => `${v}%` },
        { field: 'effective_from', headerName: cfl(getString('effectiveFrom')), width: 160, valueFormatter: (v: string) => formatToUkrDate(v) },
        { field: 'effective_till', headerName: cfl(getString('effectiveTill')), width: 160, valueFormatter: (v: string) => formatToUkrDate(v) },
        {
            field: '_actions', headerName: '', width: 96, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p: GridRenderCellParams<TaxRate>) => (
                <RowActions actions={[
                    { kind: 'edit', onClick: () => setForm({ key: Date.now(), editing: p.row }), disabled: busy },
                    { kind: 'delete', onClick: () => setRowToDelete(p.row), disabled: busy },
                ]} />
            ),
        },
    ];

    return (
        <CrudPage title={cfl(getString('taxRates'))} isLoading={isLoading} error={error}
            onAdd={() => setForm({ key: Date.now(), editing: null })}
            dialogs={<>
                {form && <TaxRateForm key={form.key} editing={form.editing} onClose={() => setForm(null)}
                    createMutation={createMutation} updateMutation={updateMutation} />}
                <ConfirmDeleteDialog open={!!rowToDelete}
                    label={rowToDelete ? `${rowToDelete.tax_type_code ?? ''} ${rowToDelete.rate}%` : undefined}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => rowToDelete && deleteMutation.mutate(rowToDelete.id)}
                    onCancel={() => setRowToDelete(null)} />
            </>}>
            <DataGrid rows={rows} columns={columns} paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick getRowId={(r) => r.id} localeText={localeText} hideFooterSelectedRowCount />
        </CrudPage>
    );
}
