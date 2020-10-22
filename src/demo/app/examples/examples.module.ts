import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { PicklistExampleComponent } from './picklist-example/picklist-example.component';
import { PicklistExampleSimpleComponent } from './picklist-example-simple/picklist-example-simple.component';
import { PicklistExampleTemplatesComponent } from './picklist-example-templates/picklist-example-templates.component';


const examples = [
    PicklistExampleComponent,
    PicklistExampleSimpleComponent,
    PicklistExampleTemplatesComponent
];

@NgModule({
    declarations: examples,
    imports: [
        NgSelectModule,
        NgOptionHighlightModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule
    ],
    exports: [
        NgSelectModule,
        NgOptionHighlightModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule
    ],
    entryComponents: examples
})
export class ExamplesModule {
}
