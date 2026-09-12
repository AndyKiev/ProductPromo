import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem,
    ListItemText, Stack, Tab, Tabs, Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import type { Product } from './productApi';
import { fetchEans } from '../eans/eanApi';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import catalogStrings from '../../catalogStrings';

interface Props {
    open: boolean;
    product: Product | null;
    onClose: () => void;
}

const EAN_TAB = 0;

export function ProductCardModal({ open, product, onClose }: Props) {
    const getString = useString({ str: catalogStrings });
    const [tab, setTab] = useState(EAN_TAB);
    const [copied, setCopied] = useState<string | null>(null);

    const { data: eans = [], isFetching } = useQuery({
        queryKey: ['eans', product?.id],
        queryFn: () => fetchEans(product!.id),
        enabled: open && !!product,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (open) {
            setTab(EAN_TAB);
            setCopied(null);
        }
    }, [open, product?.id]);

    const copyEan = async (ean: string) => {
        try {
            await navigator.clipboard.writeText(ean);
            setCopied(ean);
            setTimeout(() => setCopied((p) => (p === ean ? null : p)), 1500);
        } catch {
            setCopied(null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pr: 6 }}>
                <Stack spacing={0.25}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {product ? `${cfl(getString('product'))} ${product.code}` : ''}
                    </Typography>
                    {product?.name && (
                        <Typography variant="body2" color="text.secondary" noWrap title={product.name}>
                            {product.name}
                        </Typography>
                    )}
                </Stack>
                <IconButton onClick={onClose} size="small"
                    sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label={`${cfl(getString('eans'))}${eans.length ? ` (${eans.length})` : ''}`} />
            </Tabs>

            <DialogContent sx={{ minHeight: 260 }}>
                {isFetching && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={26} /></Box>
                )}

                {!isFetching && eans.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        {getString('noEans')}
                    </Typography>
                )}

                {!isFetching && eans.length > 0 && (
                    <List dense disablePadding>
                        {eans.map((row) => (
                            <ListItem key={row.id} disableGutters divider
                                secondaryAction={
                                    <Tooltip title={copied === row.ean ? getString('copied') : getString('copy')}>
                                        <IconButton edge="end" size="small" onClick={() => copyEan(row.ean)}>
                                            {copied === row.ean
                                                ? <CheckIcon fontSize="small" color="success" />
                                                : <ContentCopyIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                }>
                                <ListItemText
                                    primary={row.ean}
                                    slotProps={{ primary: { fontFamily: 'monospace', fontSize: 15 } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
}
