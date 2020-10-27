import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HcOption } from 'src/ng-select/lib/hc-pick.types';

@Component({
    selector: 'picklist-example-templates',
    templateUrl: './picklist-example-templates.component.html',
    styleUrls: ['./picklist-example-templates.component.scss']
})
export class PicklistExampleTemplatesComponent implements OnInit {

    readonly selected = new FormControl([]);
    transportOptions = [
        {name: 'Train', icon: 'train', color: 'green', type: 'land'},
        {name: 'Bus', icon: 'bus', color: 'blue', type: 'land'},
        {name: 'Ferry', icon: 'ship', color: 'teal', type: 'sea'},
        {name: 'Space Shuttle', icon: 'space-shuttle', color: 'dark-blue', type: 'air'},
        {name: 'Plane', icon: 'plane', color: 'purple', type: 'air'},
        {name: 'Rocket', icon: 'rocket', color: 'orange', type: 'air'}
    ];

    manyOptions = [];

    ngOnInit() {
        this.transportOptions.forEach(opt => {
            for (let index = 0; index < 100; index++) {
                const clone = { ...opt };
                clone.name += `-${index}`;
                this.manyOptions.push(clone);
            }
            
        });
    }
    

    customSearchFn(term: string, item: any) {
        term = term.toLowerCase();
        return item.name.toLowerCase().indexOf(term) > -1 || item.type.toLowerCase().indexOf(term) > -1;
    }

    sortFn(a: HcOption, b: HcOption) {
        return a.label.localeCompare(b.label);
    }
}
