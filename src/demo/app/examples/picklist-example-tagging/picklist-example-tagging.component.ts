import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'picklist-example-tagging',
    templateUrl: './picklist-example-tagging.component.html',
    styleUrls: ['./picklist-example-tagging.component.scss']
})
export class PicklistExampleTaggingComponent {

    readonly selected = new FormControl([]);
    transportOptions = [
        {name: 'Train'},
        {name: 'Bus'},
        {name: 'Ferry'},
        {name: 'Space Shuttle'},
        {name: 'Plane'},
        {name: 'Rocket'}
    ];
}
