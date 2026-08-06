import { useEffect, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, SxProps, TextField, Theme } from '@mui/material';

export interface AsyncOption {
    id: number;
    label: string;
}

interface Props {
    label: string;
    /** Currently selected option id (0/null = none). */
    valueId: number | null;
    /** Label of the selected option when it is not present in the search results (edit mode). */
    valueLabel?: string | null;
    onChange: (option: AsyncOption | null) => void;
    /** Server-side search: returns a short list of options for the typed text. */
    search: (query: string) => Promise<AsyncOption[]>;
    minLength?: number;
    disabled?: boolean;
    placeholder?: string;
    error?: boolean;
    helperText?: string;
    sx?: SxProps<Theme>;
}

/**
 * Type-ahead Autocomplete: typing inside the same input where the selected
 * value is displayed triggers a debounced server search that fills a short
 * option list. Used for large lookup tables (families, keys).
 */
export function AsyncAutocomplete({
    label, valueId, valueLabel, onChange, search,
    minLength = 1, disabled = false, placeholder, error = false, helperText, sx,
}: Props) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [options, setOptions] = useState<AsyncOption[]>([]);
    const [loading, setLoading] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const active = useRef(false);
    const searchRef = useRef(search);
    useEffect(() => { searchRef.current = search; });

    const selected = valueId
        ? { id: valueId, label: options.find((o) => o.id === valueId)?.label ?? valueLabel ?? '' }
        : null;

    // keep the current selection in the option list so it stays visible and
    // MUI never sees a controlled value that is missing from `options`
    const effectiveOptions = selected && !options.some((o) => o.id === selected.id)
        ? [selected, ...options]
        : options;

    useEffect(() => { active.current = open; }, [open]);

    // sync the box to the current selection when it changes externally
    useEffect(() => {
        setInput(selected?.label ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueId]);

    useEffect(() => {
        if (!open) return;
        if (timer.current) clearTimeout(timer.current);
        const q = input.trim();
        if (q.length < minLength) {
            setOptions([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        timer.current = setTimeout(async () => {
            try {
                const res = await searchRef.current(q);
                if (active.current) setOptions(res);
            } catch {
                if (active.current) setOptions([]);
            } finally {
                if (active.current) setLoading(false);
            }
        }, 300);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [input, open, minLength]);

    return (
        <Autocomplete
            size="small"
            sx={sx}
            options={effectiveOptions}
            value={selected}
            inputValue={input}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            loading={loading}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            filterOptions={(x) => x}
            onChange={(_, v) => onChange(v ?? null)}
            onInputChange={(_, v) => setInput(v)}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
