import { createFileRoute } from '@tanstack/react-router';
import { SegmentCrud } from '../../../../components/admin/nomenclature/segment/SegmentCrud';

export const Route = createFileRoute('/admin/nomenclature/segments/')({
    component: SegmentCrud,
});
