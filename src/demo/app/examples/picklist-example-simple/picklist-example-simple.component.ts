import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'picklist-example-simple',
    templateUrl: './picklist-example-simple.component.html',
    styleUrls: ['./picklist-example-simple.component.scss']
})
export class PicklistExampleSimpleComponent implements OnInit {

    cars = [
        { id: 1, name: 'Volvo' },
        { id: 2, name: 'Saab' },
        { id: 3, name: 'Opel' },
        { id: 4, name: 'Audi' },
        { id: 5, name: 'Toyota' },
        { id: 6, name: 'Ford' },
        { id: 7, name: 'GM' },
        { id: 8, name: 'Nissan' },
        { id: 9, name: 'Honda' },
        { id: 10, name: 'Chevy' }
    ];
    selectedCars = [{ id: 3, name: 'Opel' }];
    compareWith(a, b) {
        return a.id === b.id;
    }

    ngOnInit() {

    }

    updateOpts() {
        this.cars = [
            { id: 1, name: 'Volvo' },
            { id: 2, name: 'Saab' },
            { id: 3, name: 'Opel' },
            { id: 4, name: 'Audi' }
        ]
    }
}
