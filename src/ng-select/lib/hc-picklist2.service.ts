import { Injectable } from '@angular/core';
import { HcPickPaneComponent } from './hc-pick-pane.component';
import { isDefined } from './value-utils';

@Injectable()
export class HcPicklist2Service {
    availablePane: HcPickPaneComponent;
    selectedPane: HcPickPaneComponent;
    public reset(availablePane: HcPickPaneComponent, selectedPane: HcPickPaneComponent) {
        this.availablePane = availablePane;
        this.selectedPane = selectedPane;
    }

    /** When the option/items are updated, update corresponding selected options in the selected pane.
     *  Make sure they aren't duplicated in the available pane */
    public mapIncomingOptionsToSelected(bindValue?: string) {
        if (!isDefined(this.availablePane) || !isDefined(this.selectedPane)) { return; }
        const selectedItems = this.selectedPane.itemsList.items.filter(i => !i.isParent);
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
