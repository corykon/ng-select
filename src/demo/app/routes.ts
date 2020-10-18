import { Routes } from '@angular/router';
import { RouteViewerComponent } from './shared/route-viewer/route-viewer.component';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/picklist',
        pathMatch: 'full'
    },
    { path: 'picklist', component: RouteViewerComponent, data: { title: 'Pick List', examples: 'picklist' } }
];
