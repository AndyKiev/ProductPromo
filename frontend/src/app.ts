// What this app is: its name, title (login page, header, browser tab) and ITS sections.
// It is a separate app with its own backend and login; other apps' screens do not belong here.
import { FolderTree, Package, Truck } from 'lucide-react';
import { configureApp } from '@ui/app/config';

configureApp({
    name: 'catalog',
    title: 'catalog',
    home: '/admin/nomenclature',
    sections: [
        { labelKey: 'nomenclature', path: '/admin/nomenclature', icon: FolderTree },
        { labelKey: 'products', path: '/admin/products', icon: Package },
        { labelKey: 'suppliers', path: '/admin/suppliers', icon: Truck },
    ],
});
