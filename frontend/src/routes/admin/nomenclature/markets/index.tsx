import { createFileRoute } from '@tanstack/react-router';
import { MarketCrud } from '../../../../components/admin/nomenclature/market/MarketCrud';

export const Route = createFileRoute('/admin/nomenclature/markets/')({
    component: MarketCrud,
});
