import { useMemo } from 'react';
import { enUS, ruRU } from '@mui/x-data-grid/locales';
import type { GridLocaleText } from '@mui/x-data-grid';
import useString from './useString';
import { useTranslationsStore } from '../store/useTranslationsStore';

export function useDataGridLocale() {
  const getString = useString();
  const selected = useTranslationsStore((s) => s.selected);
  return useMemo(() => {
    const base = (selected?.short_name === 'rus' ? ruRU : enUS).components.MuiDataGrid.defaultProps.localeText;
    const strings = Object.fromEntries(Object.entries(base).filter(([, v]) => typeof v === 'string')
      .map(([key]) => [key, getString(`grid.${key}`)]));
    return {
      ...base, ...strings,
      toolbarFiltersTooltipActive: (count) => getString('grid.activeFilters', { count }),
      columnHeaderFiltersTooltipActive: (count) => getString('grid.activeFilters', { count }),
      footerRowSelected: (count) => getString('grid.selectedRows', { count }),
      footerTotalVisibleRows: (visible, total) => getString('grid.visibleRows', { visible, total }),
      columnMenuAriaLabel: (name) => getString('grid.columnMenu', { name }),
      groupColumn: (name) => getString('grid.groupColumn', { name }),
      unGroupColumn: (name) => getString('grid.unGroupColumn', { name }),
      MuiTablePagination: {
        labelRowsPerPage: getString('grid.rowsPerPage'),
        labelDisplayedRows: ({ from, to, count }) => getString('grid.displayedRows', {
          from, to, count: count === -1 ? getString('grid.moreThan', { to }) : count,
        }),
        getItemAriaLabel: (type) => getString(`grid.${type}`),
      },
    } satisfies Partial<GridLocaleText>;
  }, [getString, selected]);
}
