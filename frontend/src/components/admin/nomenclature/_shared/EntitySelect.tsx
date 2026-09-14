import { useMemo } from 'react';
import { Autocomplete, FilterOptionsState, SxProps, TextField, Theme } from '@mui/material';

export interface EntityOption {
    id: number;
    name: string;
    code?: string | null;
}

/** "CODE Name" for entities that carry a code, plain name otherwise. */
export function entityLabel(e: { name: string; code?: string | null }): string {
    return e.code ? `${e.code} ${e.name}` : e.name;
}

interface Props {
    label: string;
    /** Currently selected id (0 = none). */
    value: number;
    /** Label of the "none" choice shown while nothing is selected. */
    placeholder: string;
    /** Full option list (already scoped by parent entity); filtering happens client-side. */
    options: EntityOption[];
    onChange: (id: number) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
    sx?: SxProps<Theme>;
}

const NONE_ID = 0;

/**
 * Searchable select over an in-memory entity list: options render "CODE Name",
 * typed tokens match code and name in any order (case-insensitive).
 */
export function EntitySelect({
    label, value, placeholder, options, onChange,
    disabled = false, fullWidth = false, error = false, helperText, sx,
}: Props) {
    const fullOptions = useMemo<EntityOption[]>(
        () => [{ id: NONE_ID, name: placeholder }, ...options],
        [options, placeholder],
    );

    const filterOptions = (opts: EntityOption[], state: FilterOptionsState<EntityOption>) => {
        const tokens = state.inputValue.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return opts;
        return opts.filter((o) => {
            if (o.id === NONE_ID) return false;
            const hay = entityLabel(o).toLowerCase();
            return tokens.every((t) => hay.includes(t));
        });
    };

    return (
        <Autocomplete
            size="small"
            sx={sx}
            fullWidth={fullWidth}
            disabled={disabled}
            options={fullOptions}
            value={fullOptions.find((o) => o.id === value) ?? fullOptions[0]}
            getOptionLabel={(o) => (o.id === NONE_ID ? o.name : entityLabel(o))}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            filterOptions={filterOptions}
            onChange={(_, v) => onChange(v?.id ?? NONE_ID)}
            renderInput={(params) => (
                <TextField {...params} label={label} error={error} helperText={helperText} />
            )}
        />
    );
}
