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
    'picklist-example-simple-component': {
        component: PicklistExampleSimpleComponent,
        title: 'Picklist Simple'
    },
    // 'picklist-example-grouping': {
    //     component: PicklistExampleGroupingComponent,
    //     title: 'Grouping'
    // },
    'picklist-example': {
        component: PicklistExampleComponent,
        title: 'Picklist'
    },
    // 'picklist-example-templates': {
    //     component: PicklistExampleTemplatesComponent,
    //     title: 'Templates'
    // },
    'picklist-example-custom-items': {
        component: PicklistExampleTaggingComponent,
        title: 'Custom Options'
    }
};
