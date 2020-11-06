import { PicklistExampleSimpleComponent } from './picklist-example-simple/picklist-example-simple.component';
import { PicklistExampleTemplatesComponent } from './picklist-example-templates/picklist-example-templates.component';
import { PicklistExampleGroupingComponent } from './picklist-example-grouping/picklist-example-grouping.component';
import { PicklistExampleComponent } from './picklist-example/picklist-example.component';
import { PicklistExampleTaggingComponent } from './picklist-example-tagging/picklist-example-tagging.component';

export interface Example {
    component: any;
    title: string;
}

export const EXAMPLE_COMPONENTS: { [key: string]: Example } = {
    'picklist-example-templates': {
        component: PicklistExampleTemplatesComponent,
        title: 'Picklist Templates'
    },
    'picklist-example-grouping': {
        component: PicklistExampleTaggingComponent,
        title: 'Picklist Tagging'
    }
};
