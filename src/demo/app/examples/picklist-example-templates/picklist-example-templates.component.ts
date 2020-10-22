import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'picklist-example-templates',
    templateUrl: './picklist-example-templates.component.html',
    styleUrls: ['./picklist-example-templates.component.scss']
})
export class PicklistExampleTemplatesComponent {

    readonly selected = new FormControl([]);
    transportOptions = [
        {name: 'Bus', icon: 'bus', color: 'blue', type: 'land'},
        {name: 'Train', icon: 'train', color: 'green', type: 'land'},
        {name: 'Ferry', icon: 'ship', color: 'teal', type: 'sea'},
        {name: 'Plane', icon: 'plane', color: 'purple', type: 'air'},
        {name: 'Rocket', icon: 'rocket', color: 'orange', type: 'air'},
        {name: 'Space Shuttle', icon: 'space-shuttle', color: 'dark-blue', type: 'air'}
    ];

    customSearchFn(term: string, item: any) {
        term = term.toLowerCase();
        return item.name.toLowerCase().indexOf(term) > -1 || item.type.toLowerCase().indexOf(term) > -1;
    }
}
