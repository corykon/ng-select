import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HcPicklist2Component, SELECTION_MODEL_FACTORY } from './hc-picklist2.component';
import { NgDropdownPanelComponent } from './ng-dropdown-panel.component';
import { NgOptionComponent } from './ng-option.component';
import { NgSelectComponent } from './ng-select.component';
import {
    NgFooterTemplateDirective,
    NgHeaderTemplateDirective,
    NgOptgroupTemplateDirective,
    NgOptionTemplateDirective,
    HcPaneHeaderLeftTemplateDirective,
    HcPaneHeaderRightTemplateDirective,
    NgTagTemplateDirective,
    NgItemLabelDirective
} from './ng-templates.directive';
import { DefaultSelectionModelFactory } from './selection-model';

@NgModule({
    declarations: [
        NgDropdownPanelComponent,
        NgOptionComponent,
        NgSelectComponent,
        HcPicklist2Component,
        NgOptgroupTemplateDirective,
        NgOptionTemplateDirective,
        HcPaneHeaderLeftTemplateDirective,
        HcPaneHeaderRightTemplateDirective,
        NgHeaderTemplateDirective,
        NgFooterTemplateDirective,
        NgTagTemplateDirective,
        NgItemLabelDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NgSelectComponent,
        HcPicklist2Component,
        NgOptionComponent,
        NgOptgroupTemplateDirective,
        NgOptionTemplateDirective,
        HcPaneHeaderLeftTemplateDirective,
        HcPaneHeaderRightTemplateDirective,
        NgHeaderTemplateDirective,
        NgFooterTemplateDirective,
        NgTagTemplateDirective
    ],
    providers: [
        { provide: SELECTION_MODEL_FACTORY, useValue: DefaultSelectionModelFactory }
    ]
})
export class NgSelectModule {}
