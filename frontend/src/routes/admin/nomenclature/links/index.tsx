import { createFileRoute } from '@tanstack/react-router';
import { NomenclatureCrud } from '../../../../components/admin/nomenclature/nomenclature/NomenclatureCrud';

export const Route = createFileRoute('/admin/nomenclature/links/')({
    component: NomenclatureCrud,
});
