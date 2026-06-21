import { createFileRoute } from '@tanstack/react-router';
import { NomenclatureKeyCrud } from '../../../../components/admin/nomenclature/nomenclature_key/NomenclatureKeyCrud';

export const Route = createFileRoute('/admin/nomenclature/keys/')({
    component: NomenclatureKeyCrud,
});
