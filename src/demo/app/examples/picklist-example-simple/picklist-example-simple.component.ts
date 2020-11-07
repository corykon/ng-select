import { Component } from '@angular/core';

@Component({
    selector: 'picklist-example-simple',
    templateUrl: './picklist-example-simple.component.html',
    styleUrls: ['./picklist-example-simple.component.scss']
})
export class PicklistExampleSimpleComponent {

    cars = [
        { id: 1, details: { name: 'Volvo' }},
        { id: 2, details: { name: 'Saab' }},
        { id: 3, details: { name: 'Opel' }},
        { id: 4, details: { name: 'Audi' }},
        { id: 5, details: { name: 'Toyota' }},
        { id: 6, details: { name: 'Ford' }},
        { id: 7, details: { name: 'GM' }},
        { id: 8, details: { name: 'Nissan' }},
        { id: 9, details: { name: 'Honda' }},
        { id: 10, details: { name: 'Chevy' }}
    ];

    selectedCars = [3];

    compareWith(a, b) {
        return a.id === b.id;
    }

    updateOpts() {
        this.cars = [
            { id: 1, details: { name: 'Volvo' }},
            { id: 2, details: { name: 'Saab' }},
            { id: 3, details: { name: 'Opel' }},
            { id: 4, details: { name: 'Audi' }}
        ];
    }
}
