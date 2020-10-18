import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'picklist-example',
    templateUrl: './picklist-example.component.html',
    styleUrls: ['./picklist-example.component.scss']
})
export class PicklistExampleComponent implements OnInit {

    selectedCars = [3];
    cars = [
        { id: 1, name: 'Volvo' },
        { id: 2, name: 'Saab', disabled: true },
        { id: 3, name: 'Opel' },
        { id: 4, name: 'Audi' },
    ];

    ngOnInit() {

    }

    toggleDisabled() {
        const car: any = this.cars[1];
        car.disabled = !car.disabled;
    }
}
