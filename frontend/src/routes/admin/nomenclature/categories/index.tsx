import { createFileRoute } from '@tanstack/react-router';
import { CategoryCrud } from '../../../../components/admin/nomenclature/category/CategoryCrud';

export const Route = createFileRoute('/admin/nomenclature/categories/')({
    component: CategoryCrud,
});
