import { createFileRoute } from '@tanstack/react-router';
import { FamilyCrud } from '../../../../components/admin/nomenclature/family/FamilyCrud';

export const Route = createFileRoute('/admin/nomenclature/families/')({
    component: FamilyCrud,
});
