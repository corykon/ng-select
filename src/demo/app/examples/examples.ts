import { PicklistExampleSimpleComponent } from './picklist-example-simple/picklist-example-simple.component';
import { PicklistExampleComponent } from './picklist-example/picklist-example.component';

export interface Example {
    component: any;
    title: string;
}

export const EXAMPLE_COMPONENTS: { [key: string]: Example } = {
    'picklist-example-simple': {
        component: PicklistExampleSimpleComponent,
        title: 'Picklist Simple'
    }
};
