import { PicklistExampleComponent } from './picklist-example/picklist-example.component';

export interface Example {
    component: any;
    title: string;
}

export const EXAMPLE_COMPONENTS: { [key: string]: Example } = {
    'picklist-example': {
        component: PicklistExampleComponent,
        title: 'Picklist example'
    }
};
