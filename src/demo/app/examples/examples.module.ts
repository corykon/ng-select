import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { HcPicklist2Module } from '@ng-select/ng-select';
import { PicklistExampleComponent } from './picklist-example/picklist-example.component';
import { PicklistExampleSimpleComponent } from './picklist-example-simple/picklist-example-simple.component';
import { PicklistExampleTemplatesComponent } from './picklist-example-templates/picklist-example-templates.component';
import { PicklistExampleTaggingComponent } from './picklist-example-tagging/picklist-example-tagging.component';
import { PicklistExampleGroupingComponent } from './picklist-example-grouping/picklist-example-grouping.component';
import { PicklistRemoteDataExampleComponent } from './picklist-remote-data/picklist-remote-data-example.component';
import { PicklistOverviewExampleComponent } from './picklist-overview/picklist-overview-example.component';


const examples = [
    PicklistExampleComponent,
    PicklistExampleSimpleComponent,
    PicklistExampleTemplatesComponent,
    PicklistExampleTaggingComponent,
    PicklistExampleGroupingComponent,
    PicklistRemoteDataExampleComponent,
    PicklistOverviewExampleComponent
];

@NgModule({
    declarations: examples,
    imports: [
        HcPicklist2Module,
        NgOptionHighlightModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule
    ],
    exports: [
        HcPicklist2Module,
        NgOptionHighlightModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule
    ],
    entryComponents: examples
})
export class ExamplesModule {
}
