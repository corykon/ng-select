import { Injectable } from '@angular/core';
import { NgSelectComponent } from './ng-select.component';

import { isDefined } from './value-utils';

@Injectable()
export class HcPicklist2Service {
    availablePane: NgSelectComponent;
    selectedPane: NgSelectComponent;
    public reset(availablePane: NgSelectComponent, selectedPane: NgSelectComponent) {
        this.availablePane = availablePane;
        this.selectedPane = selectedPane;
    }

    /** When the option/items are updated, update them in the selected pane and make sure they aren't sitting in the available pane */
    public mapIncomingOptionsToSelected(bindValue?: string) {
        if (!isDefined(this.availablePane) || !isDefined(this.selectedPane)) { return; }
        const selectedItems = this.selectedPane.itemsList.items.slice();
        selectedItems.forEach(selected => {
            const value = bindValue ?
                this.selectedPane.itemsList.resolveNested(selected.value, bindValue) : selected.value;
            const item = isDefined(value) ? this.availablePane.itemsList.findOption(value) : null;
            if (item) { this.availablePane.itemsList.removeOption(item); }
            this.selectedPane.itemsList.removeOption(selected);
            this.selectedPane.itemsList.addOption(item || selected);
        });
        this.availablePane.itemsList.reIndex();
        this.selectedPane.itemsList.reIndex();
    }
}
