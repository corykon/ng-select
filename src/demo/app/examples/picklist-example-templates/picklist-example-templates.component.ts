import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'picklist-example-templates',
    templateUrl: './picklist-example-templates.component.html',
    styleUrls: ['./picklist-example-templates.component.scss']
})
export class PicklistExampleTemplatesComponent {
    readonly selected = new FormControl([]);
    animals = [
        {name: 'Pig', type: 'farm'},
        {name: 'Cow', type: 'farm'},
        {name: 'Chicken', type: 'farm'},
        {name: 'Lion', type: 'safari'},
        {name: 'Antelope', type: 'safari'},
        {name: 'Giraffe', type: 'safari'}
    ];

    customSearchFn(term: string, item: any) {
        term = term.toLowerCase();
        return item.name.toLowerCase().indexOf(term) > -1 || item.type.toLowerCase().indexOf(term) > -1;
    }
}
