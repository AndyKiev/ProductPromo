import { useState, useMemo, type FC, type ReactNode } from "react";
import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
    CssBaseline,
} from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";
import {
    themes,
    THEME_KEYS,
    THEME_FAMILIES,
    DEFAULT_THEME,
    type ThemeKey,
} from "./themes";
import { ThemeContext } from "./useTheme";
import useString from '../../hooks/useString';

const STORAGE_KEY = "productpromo.theme";

function readStored(): ThemeKey {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && (THEME_KEYS as string[]).includes(stored)
        ? (stored as ThemeKey)
        : DEFAULT_THEME;
}

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const getString = useString();
    const [themeKey, setThemeKeyState] = useState<ThemeKey>(readStored);
    const t = themes[themeKey] ?? themes[DEFAULT_THEME];
    const mode: "light" | "dark" = t.isDark ? "dark" : "light";

    const setThemeKey = (key: ThemeKey) => {
        setThemeKeyState(key);
        localStorage.setItem(STORAGE_KEY, key);
    };
    const toggle = () => setThemeKey(THEME_FAMILIES[themeKey]);

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: { main: t.accent },
                    background: { default: t.appBg, paper: t.cardBg },
                    text: { primary: t.text, secondary: t.textMuted, disabled: t.disabledText },
                    divider: t.border,
                },
                typography: { fontFamily: "'Segoe UI', 'Roboto', sans-serif" },
                shape: { borderRadius: 10 },
                components: {
                    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
                    MuiAutocomplete: { defaultProps: { handleHomeEndKeys: false,
                        clearText: getString('clear'), closeText: getString('close'),
                        openText: getString('open'), loadingText: getString('loading'), noOptionsText: getString('noOptions'),
                    } },
                    MuiAlert: { defaultProps: { closeText: getString('close') } },
                    MuiBreadcrumbs: { defaultProps: { expandText: getString('expandBreadcrumbs') } },
                    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
                    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 500, minHeight: 48 } } },
                    MuiOutlinedInput: {
                        styleOverrides: {
                            root: {
                                backgroundColor: t.inputBg,
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: t.accent },
                            },
                        },
                    },
                    MuiSelect: { styleOverrides: { select: { paddingTop: "9px", paddingBottom: "9px" } } },
                    // Tooltips are portaled to <body>, so one that resolves past the
                    // right edge WIDENS the document and leaves the page scrolling
                    // sideways into empty background. Keep every tooltip inside the
                    // viewport and cap its width so a long hint wraps instead.
                    MuiTooltip: {
                        defaultProps: {
                            PopperProps: {
                                modifiers: [
                                    { name: "preventOverflow", options: { boundary: "viewport", padding: 8 } },
                                    { name: "flip", options: { fallbackPlacements: ["top", "bottom", "left"] } },
                                ],
                            },
                        },
                        styleOverrides: { tooltip: { maxWidth: 280 } },
                    },
                    MuiMenuItem: { styleOverrides: { root: { whiteSpace: "normal", wordBreak: "break-word" } } },
                    MuiDataGrid: {
                        defaultProps: { columnHeaderHeight: 44 },
                        styleOverrides: {
                            // One ink colour for the whole header: title, menu icons and
                            // the sort arrow must all be identical (they previously
                            // disagreed in dark mode: black text, white arrow).
                            columnHeader: ({ theme }) => ({
                                backgroundColor: theme.palette.primary.light,
                                color: mode === "dark" ? "#000" : "#fff",
                            }),
                            columnHeaderTitle: { fontWeight: "bold", color: mode === "dark" ? "#000" : "#fff" },
                            iconButtonContainer: { "& button": { color: mode === "dark" ? "#000" : "#fff" } },
                            menuIcon: { "& button": { color: mode === "dark" ? "#000" : "#fff" } },
                            sortIcon: { color: mode === "dark" ? "#000" : "#fff", opacity: 1 },
                            // Built-in filter panel: keep the three fields on one baseline
                            // and stop the floating labels crowding the inputs.
                            filterForm: {
                                alignItems: "center",
                                columnGap: 12,
                                rowGap: 12,
                                paddingTop: 12,
                                paddingBottom: 12,
                                "& .MuiFormControl-root": { margin: 0 },
                                "& .MuiInputLabel-root": { transform: "translate(0, -6px) scale(1)" },
                            },
                        },
                    },
                },
            }),
        [mode, t, getString],
    );

    return (
        <ThemeContext.Provider value={{ t, themeKey, setThemeKey, availableThemes: THEME_KEYS, mode, toggle }}>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
