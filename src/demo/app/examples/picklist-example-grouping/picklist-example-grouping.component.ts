import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HcOption } from 'src/ng-select/lib/hc-pick.types';

@Component({
    selector: 'picklist-example-grouping',
    templateUrl: './picklist-example-grouping.component.html',
    styleUrls: ['./picklist-example-grouping.component.scss']
})
export class PicklistExampleGroupingComponent implements OnInit {

    readonly selected = new FormControl([]);
    transportOptions = [
        {name: 'Train', icon: 'train', color: 'green', type: 'land'},
        {name: 'Bus', icon: 'bus', color: 'blue', type: 'land'},
        {name: 'Ferry', icon: 'ship', color: 'teal', type: 'sea'},
        {name: 'Space Shuttle', icon: 'space-shuttle', color: 'dark-blue', type: 'air'},
        {name: 'Plane', icon: 'plane', color: 'purple', type: 'air'},
        {name: 'Rocket', icon: 'rocket', color: 'orange', type: 'air'},
        {name: 'Sled', icon: '', color: 'orange', type: null }
    ];

    selectedProjects = [];
    projects = [
        {
            id: 'p1',
            title: 'Domestic',
            subprojects: [
                { title: 'Chevy', id: 's1p1' },
                { title: 'Ford', id: 's2p1',
                    subprojects: [
                        { title: 'Ranger', id: 'sscs2p1' },
                        { title: 'F150', id: 'ssds2p1' },
                    ]
                },
            ]
        },
        {
            id: 'p2',
            title: 'Foreign',
            subprojects: [
                { title: 'Toyota', id: 's1p2' },
                { title: 'Nissan', id: 's2p2' },
            ]
        }
    ]

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
    
    groupByFn = (item) => item.type;

    customSearchFn(term: string, item: any) {
        term = term.toLowerCase();
        return item.name.toLowerCase().indexOf(term) > -1 || item.type.toLowerCase().indexOf(term) > -1;
    }

    sortFn(a: HcOption, b: HcOption) {
        return a.label.localeCompare(b.label);
    }
}
