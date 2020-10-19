import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HcPicklist2Component } from './hc-picklist2.component';
import { NgDropdownPanelComponent } from './ng-dropdown-panel.component';
import { NgOptionComponent } from './ng-option.component';
import { NgSelectComponent, SELECTION_MODEL_FACTORY } from './ng-select.component';
import {
    NgFooterTemplateDirective,
    NgHeaderTemplateDirective,
    NgLoadingTextTemplateDirective,
    NgNotFoundTemplateDirective,
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
        NgNotFoundTemplateDirective,
        NgLoadingTextTemplateDirective,
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
        NgNotFoundTemplateDirective,
        NgLoadingTextTemplateDirective,
        NgTagTemplateDirective
    ],
    providers: [
        { provide: SELECTION_MODEL_FACTORY, useValue: DefaultSelectionModelFactory }
    ]
})
export class NgSelectModule {}
