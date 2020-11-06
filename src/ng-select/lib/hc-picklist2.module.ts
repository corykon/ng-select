import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HcPicklist2Component } from './hc-picklist2.component';
import { HcPickPaneListComponent } from './hc-pick-pane-list.component';
import { HcPickOptionComponent } from './hc-pick-option.component';
import { HcPickPaneComponent } from './hc-pick-pane.component';
import { SELECTION_MODEL_FACTORY } from './hc-pick.types';
import {
    HcPaneListFooterTemplateDirective,
    HcPaneListHeaderTemplateDirective,
    HcPickOptgroupTemplateDirective,
    HcPickOptionTemplateDirective,
    HcPaneHeaderLeftTemplateDirective,
    HcPaneHeaderRightTemplateDirective,
    HcPickCustomItemTemplateDirective,
    HcPickItemLabelDirective
} from './hc-pick-templates.directive';
import { DefaultSelectionModelFactory } from './selection-model';

@NgModule({
    declarations: [
        HcPickPaneListComponent,
        HcPickOptionComponent,
        HcPickPaneComponent,
        HcPicklist2Component,
        HcPickOptgroupTemplateDirective,
        HcPickOptionTemplateDirective,
        HcPaneHeaderLeftTemplateDirective,
        HcPaneHeaderRightTemplateDirective,
        HcPaneListHeaderTemplateDirective,
        HcPaneListFooterTemplateDirective,
        HcPickCustomItemTemplateDirective,
        HcPickItemLabelDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        HcPickPaneComponent,
        HcPicklist2Component,
        HcPickOptionComponent,
        HcPickOptgroupTemplateDirective,
        HcPickOptionTemplateDirective,
        HcPaneHeaderLeftTemplateDirective,
        HcPaneHeaderRightTemplateDirective,
        HcPaneListHeaderTemplateDirective,
        HcPaneListFooterTemplateDirective,
        HcPickCustomItemTemplateDirective
    ],
    providers: [
        { provide: SELECTION_MODEL_FACTORY, useValue: DefaultSelectionModelFactory }
    ]
})
export class HcPicklist2Module {}
