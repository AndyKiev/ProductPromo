import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@ui/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/components/ui/tooltip';
import type { Product } from './productApi';
import { fetchEans } from '../eans/eanApi';
import useString from '@ui/hooks/useString';
import cfl from '@ui/utils/capitalizeFirstLetter';
import catalogStrings from '@ui/components/admin/catalogStrings';
import { EMPTY } from '@ui/utils/empty';

interface Props {
    product: Product;
    onClose: () => void;
}

/** Read-only product card; one tab (EANs) for now. Mounted per product by the parent. */
export function ProductCardModal({ product, onClose }: Props) {
    const getString = useString({ str: catalogStrings });
    const [copied, setCopied] = useState<string | null>(null);

    const { data: eans = EMPTY, isFetching } = useQuery({
        queryKey: ['eans', product.id], queryFn: () => fetchEans(product.id), staleTime: 2 * 60 * 1000,
    });

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
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="min-w-0 pr-6">
                    <DialogTitle>{`${cfl(getString('product'))} ${product.code}`}</DialogTitle>
                    <DialogDescription className="truncate" title={product.name ?? undefined}>{product.name ?? ''}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="eans">
                    <TabsList variant="line">
                        <TabsTrigger value="eans">{`${cfl(getString('eans'))}${eans.length ? ` (${eans.length})` : ''}`}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="eans" className="min-h-[240px]">
                        {isFetching && (
                            <div className="flex justify-center p-6"><Loader2 className="size-6 animate-spin text-primary" aria-label={getString('loading')} /></div>
                        )}
                        {!isFetching && eans.length === 0 && (
                            <p className="p-4 text-sm text-muted-foreground">{getString('noEans')}</p>
                        )}
                        {!isFetching && eans.length > 0 && (
                            <ul className="divide-y">
                                {eans.map((row) => (
                                    <li key={row.id} className="flex items-center justify-between py-1.5">
                                        <span className="font-mono text-[15px]">{row.ean}</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => copyEan(row.ean)}
                                                    aria-label={`${getString('copy')} ${row.ean}`}>
                                                    {copied === row.ean ? <Check className="text-success" /> : <Copy />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{getString(copied === row.ean ? 'copied' : 'copy')}</TooltipContent>
                                        </Tooltip>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
