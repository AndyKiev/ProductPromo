import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import useString from '../../../../hooks/useString';
import nomenclatureStrings from './nomenclatureStrings';

interface Props {
    open: boolean;
    label?: string;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmDialog({ open, label, isPending, onConfirm, onCancel }: Props) {
    const getString = useString({ str: nomenclatureStrings });
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{getString('confirmDelete')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {getString('deletePrompt')}{label ? ` — ${label}` : ''}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onCancel} disabled={isPending}>{getString('cancel')}</Button>
                <Button variant="contained" color="error" onClick={onConfirm} disabled={isPending}
                    startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                    {getString('delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
