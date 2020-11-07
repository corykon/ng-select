import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgSelectConfig {
    placeholder: string;
    notFoundText = 'No items found';
    addCustomItemText = 'Add item';
    disableVirtualScroll = true;
    bindValue: string;
}
