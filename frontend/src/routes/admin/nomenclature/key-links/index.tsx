import { createFileRoute } from '@tanstack/react-router';
import { KeyLinkTree } from '../../../../components/admin/nomenclature/nomenclature_key_link/KeyLinkTree';

export const Route = createFileRoute('/admin/nomenclature/key-links/')({
    component: KeyLinkTree,
});
