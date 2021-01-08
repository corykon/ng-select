import { Component, OnInit } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, delay, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
    selector: 'picklist-remote-data-example',
    templateUrl: './picklist-remote-data-example.component.html'
})
export class PicklistRemoteDataExampleComponent implements OnInit {
    mockPeople = [
        {
            'id': '12345',
            'age': 23,
            'name': 'Karyn Wright',
        },
        {
            'id': '12346',
            'age': 35,
            'name': 'Rochelle Estes',
        },
        {
            'id': '12347',
            'age': 25,
            'name': 'Mendoza Ruiz',
        },
        {
            'id': '12348',
            'age': 39,
            'name': 'Rosales Russell',
        },
        {
            'id': '12349',
            'age': 32,
            'name': 'Marquez Nolan',
        },
        {
            'id': '12350',
            'age': 28,
            'name': 'Franklin James',
        },
        {
            'id': '12351',
            'age': 24,
            'name': 'Elsa Bradley',
        },
        {
            'id': '12352',
            'age': 40,
            'name': 'Pearson Thompson',
        },
        {
            'id': '12353',
            'age': 32,
            'name': 'Ina Pugh',
        },
        {
            'id': '12354',
            'age': 25,
            'name': 'Nguyen Elliott',
        },
        {
            'id': '12355',
            'age': 31,
            'name': 'Mills Barnett',
        },
        {
            'id': '12356',
            'age': 36,
            'name': 'Margaret Reynolds',
        },
        {
            'id': '12357',
            'age': 29,
            'name': 'Yvette Navarro',
        },
        {
            'id': '12358',
            'age': 20,
            'name': 'Elisa Guzman',
        },
        {
            'id': '12359',
            'age': 33,
            'name': 'Jodie Bowman',
        },
        {
            'id': '12360',
            'age': 24,
            'name': 'Diann Booker',
        },
        {
            'id': '12361',
            'age': 32,
            'name': 'Harriet Hamilton',
        },
        {
            'id': '12362',
            'age': 32,
            'name': 'Ruby Pearce',
        },
        {
            'id': '12363',
            'age': 32,
            'name': 'Zoe Stewart',
        },
        {
            'id': '12364',
            'age': 32,
            'name': 'Zoey Ellis',
        },
        {
            'id': '12365',
            'age': 32,
            'name': 'Evelyn Harvey',
        },
        {
            'id': '12366',
            'age': 32,
            'name': 'Matthew Spencer',
        },
        {
            'id': '12367',
            'age': 32,
            'name': 'Sebastian Gray',
        },
        {
            'id': '12368',
            'age': 32,
            'name': 'Aiden Bell',
        },
        {
            'id': '12369',
            'age': 32,
            'name': 'Braxton Watson',
        },
        {
            'id': '12370',
            'age': 32,
            'name': 'Justin Wright',
        },
    ];
    people$: Observable<any>;
    peopleLoading = true;
    peopleInput$ = new Subject<string>();
    selectedPersons: [] = <any>this.mockPeople.slice(0,2);

    ngOnInit() {
        this.loadPeople();
    }

    trackByFn(item: any) {
        return item.id;
    }

    addCustomItemFn = this.addCustomItem.bind(this);

    addCustomItem(term: string): any {
        const customItem = {
            id: `1234-${term}`,
            age: Math.floor(Math.random() * 40) + 18,
            name: term
        };
        this.mockPeople.push(customItem);
        return customItem;
    }

    private loadPeople() {
        this.people$ = concat(
            of([]), // default items
            this.peopleInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.peopleLoading = true),
                switchMap(term => this.getPeople(term, this.selectedPersons).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => { this.peopleLoading = false; })
                ))
            )
        );
    }

    getPeople(term: string = "", selectedPersons: Array<any>): Observable<any[]> {
        let items = this.mockPeople.filter(mp => !selectedPersons.some(sp => sp.id === mp.id));
        if (term) {
            items = items.filter(x => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1).slice(0, 10);
        } else {
            items = items.slice(0, 10);
        }
        console.log("items", items);
        return of(items).pipe(delay(1000));
    }

    
}

