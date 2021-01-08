import { Component } from '@angular/core';

@Component({
    selector: 'picklist-example-simple',
    templateUrl: './picklist-example-simple.component.html',
    styleUrls: ['./picklist-example-simple.component.scss']
})
export class PicklistExampleSimpleComponent {

    cars = [
        { id: 1, details: { name: 'Volvo <strong>hi</strong>' }},
        { id: 2, details: { name: 'Saab' }},
        { id: 3, details: { name: 'Opel' }},
        { id: 4, details: { name: 'Audi' }},
        { id: 5, details: { name: 'Toyota' }},
        { id: 6, details: { name: 'Ford' }},
        { id: 7, details: { name: 'GM' }},
        { id: 8, details: { name: 'Nissan' }},
        { id: 9, details: { name: 'Honda' }},
        { id: 10, details: { name: 'Chevy' }},
        { id: 11, details: { name: 'Volvo' }},
        { id: 12, details: { name: 'Saab' }},
        { id: 13, details: { name: 'Opel' }},
        { id: 14, details: { name: 'Audi' }},
        { id: 15, details: { name: 'Toyota' }},
        { id: 16, details: { name: 'Ford' }},
        { id: 17, details: { name: 'GM' }},
        { id: 18, details: { name: 'Nissan' }},
        { id: 19, details: { name: 'Honda' }},
        { id: 20, details: { name: 'Chevy' }},
        { id: 21, details: { name: 'Volvo' }},
        { id: 22, details: { name: 'Saab' }},
        { id: 23, details: { name: 'Opel' }},
        { id: 24, details: { name: 'Audi' }},
        { id: 25, details: { name: 'Toyota' }},
        { id: 26, details: { name: 'Ford' }},
        { id: 27, details: { name: 'GM' }},
        { id: 28, details: { name: 'Nissan' }},
        { id: 29, details: { name: 'Honda' }},
        { id: 30, details: { name: 'Chevy' }}
    ];

    selectedCars = [{ name: 'Opel' }];

    compareWith(a, b) {
        return a.details.name === b.name;
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
