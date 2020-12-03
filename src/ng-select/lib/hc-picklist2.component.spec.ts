// it('should display custom dropdown option template', async(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
//             <ng-template hc-pick-option-tmp let-item="item">
//                 <div class="custom-option">{{item.name}}</div>
//             </ng-template>
//         </hc-pick-pane>`);

//     fixture.detectChanges();

//     fixture.whenStable().then(() => {
//         const el = fixture.debugElement.query(By.css('.custom-option')).nativeElement;
//         expect(el).not.toBeNull();
//     });
// }));

// it('should display custom footer and header template', async(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
//             <ng-template hc-pane-toolbar-tmp>
//                 <span class="toolbar-label">toolbar</span>
//             </ng-template>
//             <ng-template hc-pane-footer-tmp>
//                 <span class="footer-label">footer</span>
//             </ng-template>
//         </hc-pick-pane>`);
//     fixture.detectChanges();

//     fixture.whenStable().then(() => {
//         const header = fixture.debugElement.query(By.css('.header-label')).nativeElement;
//         expect(header.innerHTML).toBe('header');

//         const footer = fixture.debugElement.query(By.css('.footer-label')).nativeElement;
//         expect(footer.innerHTML).toBe('footer');
//     });
// }));

// it('should display custom item template', async(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity" [addCustomItem]="true">
//             <ng-template hc-pick-custom-item-tmp let-search="searchTerm">
//                 <span class="custom-item-template">{{searchTerm}}</span>
//             </ng-template>
//         </hc-pick-pane>`);

//     fixture.componentInstance.select.searchTerm = 'custom-item';
//     fixture.detectChanges();

//     fixture.whenStable().then(() => {
//         const template = fixture.debugElement.query(By.css('.custom-item-template')).nativeElement;
//         expect(template).toBeDefined();
//     });
// }));

// it('should display custom loading spinner template', fakeAsync(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities"
//                     [loading]="true"
//                     [(ngModel)]="selectedCity">

//             <ng-template ng-loadingspinner-tmp>
//                 <div class="custom-loadingspinner">
//                     Custom loading spinner
//                 </div>
//             </ng-template>
//         </hc-pick-pane>`);

//     fixture.whenStable().then(() => {
//         tickAndDetectChanges(fixture);
//         const spinner = fixture.debugElement.queryAll(By.css('.custom-loadingspinner'));
//         expect(spinner.length).toBe(1);
//     });
// }));

// describe('max selected items', () => {
//     let arrowIcon: DebugElement = null;
//     beforeEach(() => {
//         fixture.componentInstance.select.maxSelectedItems = 2;
//         arrowIcon = fixture.debugElement.query(By.css('.ng-arrow-wrapper'));
//     });

//     it('should be able to select only two elements', fakeAsync(() => {
//         selectOption(fixture, KeyCode.ArrowDown, 0);
//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         tickAndDetectChanges(fixture);
//         expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(2);
//     }));
// });

// fdescribe('Data source', () => {
//     it('should create items from hc-pick-option', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane>
//                 <hc-pick-option [value]="true">Yes</hc-pick-option>
//                 <hc-pick-option [value]="false">No</hc-pick-option>
//             </hc-pick-pane>`);

//         tickAndDetectChanges(fixture);

//         const items = fixture.componentInstance.select.itemsList.items;
//         expect(items.length).toBe(2);
//         expect(items[0]).toEqual(jasmine.objectContaining({
//             label: 'Yes', value: true, disabled: false
//         }));
//         expect(items[1]).toEqual(jasmine.objectContaining({
//             label: 'No', value: false, disabled: false
//         }));
//     }));
// });

// describe('Model bindings and data changes', () => {
//     let select: HcPickPaneComponent;

//     it('should update ngModel on value change', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.selectedCity).toEqual(jasmine.objectContaining(fixture.componentInstance.cities[1]));

//         fixture.componentInstance.select.itemsList.clearSelected();
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.selectedCity).toEqual(null);
//         discardPeriodicTasks();
//     }));

//     it('should update internal model on ngModel change', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems).toEqual([
//             jasmine.objectContaining({
//                 value: fixture.componentInstance.cities[0]
//             })
//         ]);

//         fixture.componentInstance.selectedCity = null;
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.select.selectedItems).toEqual([]);
//         discardPeriodicTasks();
//     }));

//     it('should update internal model after it was toggled with *ngIf', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane *ngIf="visible"
//                     [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         // select first city
//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
//         tickAndDetectChanges(fixture);

//         // toggle to hide/show
//         fixture.componentInstance.toggleVisible();
//         tickAndDetectChanges(fixture);
//         fixture.componentInstance.toggleVisible();
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.selectedCity = null;
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.select.selectedItems).toEqual([]);
//     }));

//     it('should set items correctly after ngModel set first when bindValue is used', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     bindValue="id"
//                     [(ngModel)]="selectedCityId">
//             </hc-pick-pane>`);

//         fixture.componentInstance.cities = [];
//         fixture.componentInstance.selectedCityId = 7;
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
//         tickAndDetectChanges(fixture);

//         select = fixture.componentInstance.select;
//         expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
//         expect(select.selectedItems).toEqual([jasmine.objectContaining({
//             value: { id: 7, name: 'Pailgis' }
//         })]);
//     }));

//     it('should set items correctly after ngModel set first when bindValue is not used', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.cities = [];
//         fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
//         tickAndDetectChanges(fixture);

//         select = fixture.componentInstance.select;
//         expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
//         expect(select.selectedItems).toEqual([jasmine.objectContaining({
//             value: { id: 7, name: 'Pailgis' }
//         })]);
//     }));

//     it('should bind whole object as value when bindValue prop is specified with empty string in template', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     bindValue=""
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`
//         );

//         fixture.componentInstance.cities = [];
//         fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
//         tickAndDetectChanges(fixture);

//         select = fixture.componentInstance.select;
//         expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
//         expect(select.selectedItems).toEqual([jasmine.objectContaining({
//             value: { id: 7, name: 'Pailgis' }
//         })]);
//     }));

//     it('should set items correctly after ngModel set first when externalSearchSubject and single select is used', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                 bindLabel="name"
//                 [externalSearchSubject]="filter"
//                 placeholder="select value"
//                 [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         select = fixture.componentInstance.select;
//         fixture.componentInstance.selectedCity = { id: 1, name: 'Vilnius' };
//         tickAndDetectChanges(fixture);
//         expect(select.selectedItems).toEqual([
//             jasmine.objectContaining({ label: 'Vilnius', value: { id: 1, name: 'Vilnius' } })
//         ]);

//         fixture.componentInstance.cities = [
//             { id: 1, name: 'Vilnius' },
//             { id: 2, name: 'Kaunas' },
//             { id: 3, name: 'Pabrade' },
//         ];
//         tickAndDetectChanges(fixture);
//         const vilnius = select.itemsList.items[0];
//         expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
//         expect(vilnius.selected).toBeTruthy();
//     }));

//     it('should set items correctly after ngModel set first when externalSearchSubject and multi-select is used', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                 bindLabel="name"
//                 [externalSearchSubject]="filter"
//                 placeholder="select value"
//                 [(ngModel)]="selectedCities">
//             </hc-pick-pane>`);

//         select = fixture.componentInstance.select;
//         fixture.componentInstance.selectedCities = [{ id: 1, name: 'Vilnius' }, { id: 2, name: 'Kaunas' }];
//         tickAndDetectChanges(fixture);
//         expect(select.selectedItems).toEqual([
//             jasmine.objectContaining({ label: 'Vilnius', value: { id: 1, name: 'Vilnius' } }),
//             jasmine.objectContaining({ label: 'Kaunas', value: { id: 2, name: 'Kaunas' } })
//         ]);

//         fixture.componentInstance.cities = [
//             { id: 1, name: 'Vilnius' },
//             { id: 2, name: 'Kaunas' },
//             { id: 3, name: 'Pabrade' },
//         ];
//         tickAndDetectChanges(fixture);
//         const vilnius = select.itemsList.items[0];
//         const kaunas = select.itemsList.items[1];
//         expect(select.selectedItems[0]).toBe(vilnius);
//         expect(vilnius.selected).toBeTruthy();
//         expect(select.selectedItems[1]).toBe(kaunas);
//         expect(kaunas.selected).toBeTruthy();
//     }));

//     it('should set items correctly if there is no bindLabel', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-option
//                 [items]="cities"
//                 [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         const cities = [{ id: 7, name: 'Pailgis' }];
//         fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
//         tickAndDetectChanges(fixture);
//         fixture.componentInstance.cities = [{ id: 1, name: 'Vilnius' }, { id: 2, name: 'Kaunas' }];
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems[0]).toEqual(jasmine.objectContaining({
//             value: cities[0]
//         }));
//     }));

//     it('should bind ngModel object even if items are empty', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.cities = [];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             value: { id: 7, name: 'Pailgis' },
//             selected: true
//         })]);
//     }));

//     it('should bind ngModel simple value even if items are empty', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="citiesNames"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.cities = [];
//         tickAndDetectChanges(fixture);
//         fixture.componentInstance.selectedCity = <any>'Kaunas';
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             value: 'Kaunas',
//             label: 'Kaunas',
//             selected: true
//         })]);
//     }));

//     it('should preserve latest selected value when items are changing', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
//         tickAndDetectChanges(fixture);


//         fixture.componentInstance.select.select(fixture.componentInstance.select.itemsList.items[1]);
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[1]);

//         fixture.componentInstance.select.itemsList.clearSelected();
//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.selectedCity).toBeNull();
//     }));

//     it('should map selected items with items in dropdown', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         select = fixture.componentInstance.select;

//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[0]);
//         expect(select.itemsList.filteredItems[0].selected).toBeTruthy();
//     }));

//     it('should keep selected item while setting new items and bindValue is incorrect', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     bindValue="value"
//                     [(ngModel)]="selectedCityId">
//             </hc-pick-pane>`);

//         tickAndDetectChanges(fixture); // triggers write value

//         select = fixture.componentInstance.select;
//         select.select(select.itemsList.items[1]);
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);

//         expect(select.selectedItems[0]).toEqual(jasmine.objectContaining({
//             value: { id: 2, name: 'Kaunas' }
//         }));
//     }));

//     it('should clear previous single select value when setting new model', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
//         tickAndDetectChanges(fixture);

//         const lastSelection: any = fixture.componentInstance.select.selectedItems[0];
//         expect(lastSelection.selected).toBeTruthy();

//         fixture.componentInstance.selectedCity = null;
//         tickAndDetectChanges(fixture);
//         expect(lastSelection.selected).toBeFalsy();
//     }));

//     it('should clear disabled selected values when setting new model', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCities">
//             </hc-pick-pane>`);


//         const disabled = { ...fixture.componentInstance.cities[1], disabled: true };
//         fixture.componentInstance.selectedCities = <any>[fixture.componentInstance.cities[0], disabled];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities[1].disabled = true;
//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.selectedCities = [];
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems).toEqual([]);
//     }));

//     it('should clear previous selected value even if it is disabled', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         fixture.componentInstance.cities[0].disabled = true;
//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems.length).toBe(1);
//     }));

//     it('should clear previous select value when setting new model', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCities">
//             </hc-pick-pane>`);

//         fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
//         tickAndDetectChanges(fixture);
//         select = fixture.componentInstance.select;
//         expect(select.selectedItems.length).toBe(1);

//         fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[1]];
//         tickAndDetectChanges(fixture);
//         expect(select.selectedItems.length).toBe(1);

//         fixture.componentInstance.selectedCities = [];
//         tickAndDetectChanges(fixture);
//         expect(select.selectedItems.length).toBe(0);
//     }));

//     it('should not add custom items to new items list when [items] are changed', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCities">
//             </hc-pick-pane>`);

//         fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities.slice(0, 2)];
//         tickAndDetectChanges(fixture);

//         fixture.componentInstance.cities = [{ id: 1, name: 'New city' }];
//         tickAndDetectChanges(fixture);

//         const internalItems = fixture.componentInstance.select.itemsList.items;
//         expect(internalItems.length).toBe(1);
//         expect(internalItems[0].value).toEqual(jasmine.objectContaining({ id: 1, name: 'New city' }));
//     }));

//     it('should reset marked item when [items] are changed and dropdown is opened', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);
//         select = fixture.componentInstance.select;

//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[2];
//         tickAndDetectChanges(fixture);
//         triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
//         expect(fixture.componentInstance.select.itemsList.markedItem.value).toEqual({ name: 'Pabrade', id: 3 });

//         fixture.componentInstance.selectedCity = { name: 'New city', id: 5 };
//         tickAndDetectChanges(fixture);
//         fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.itemsList.markedItem.value).toEqual({ name: 'Vilnius', id: 1 });
//     }));

//     it('should bind to custom object properties', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         bindValue="id"
//                         [(ngModel)]="selectedCityId">
//             </hc-pick-pane>`);

//         selectOption(fixture, KeyCode.ArrowDown, 0);
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.selectedCityId).toEqual(1);

//         fixture.componentInstance.selectedCityId = 2;
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             value: fixture.componentInstance.cities[1]
//         })]);
//     }));

//     it('should bind to nested label property', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="countries"
//                         bindLabel="description.name"
//                         [(ngModel)]="selectedCountry">
//             </hc-pick-pane>`);

//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         fixture.detectChanges();
//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             label: 'USA',
//             value: fixture.componentInstance.countries[1]
//         })]);

//         fixture.componentInstance.selectedCountry = fixture.componentInstance.countries[0];
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             label: 'Lithuania',
//             value: fixture.componentInstance.countries[0]
//         })]);
//     }));

//     it('should bind to nested value property', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="countries"
//                         bindLabel="description.name"
//                         bindValue="description.id"
//                         [(ngModel)]="selectedCountry">
//             </hc-pick-pane>`);

//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.selectedCountry).toEqual('b');

//         fixture.componentInstance.selectedCountry = fixture.componentInstance.countries[2].description.id;
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             label: 'Australia',
//             value: fixture.componentInstance.countries[2]
//         })]);

//         selectOption(fixture, KeyCode.ArrowUp, 1);
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.selectedCountry).toEqual('b');
//     }));

//     it('should bind to simple array', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="citiesNames"
//                         [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         selectOption(fixture, KeyCode.ArrowDown, 0);
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.selectedCity).toBe(<any>'Vilnius');
//         fixture.componentInstance.selectedCity = <any>'Kaunas';
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.select.selectedItems)
//             .toEqual([jasmine.objectContaining({ label: 'Kaunas', value: 'Kaunas' })]);
//     }));

//     it('should bind to object', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         // from component to model
//         selectOption(fixture, KeyCode.ArrowDown, 0);
//         tickAndDetectChanges(fixture);
//         expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[0]);

//         // from model to component
//         fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
//         tickAndDetectChanges(fixture);

//         expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//             value: fixture.componentInstance.cities[1]
//         })]);
//         discardPeriodicTasks();
//     }));

//     describe('hc-pick-option', () => {
//         it('should reset to empty array', fakeAsync(() => {
//             const fixture = createTestingModule(
//                 NgSelectTestCmp,
//                 `<hc-pick-pane [(ngModel)]="selectedCityId">
//                     <hc-pick-pane *ngFor="let city of cities" [value]="city.id">{{city.name}}</hc-pick-pane>
//                 </hc-pick-pane>`);

//             select = fixture.componentInstance.select;
//             tickAndDetectChanges(fixture);
//             expect(select.items.length).toEqual(3);

//             fixture.componentInstance.cities = [];
//             tickAndDetectChanges(fixture);
//             expect(select.items.length).toEqual(0);
//         }));

//         it('should bind value', fakeAsync(() => {
//             const fixture = createTestingModule(
//                 NgSelectTestCmp,
//                 `<hc-pick-pane [(ngModel)]="selectedCityId">
//                 <hc-pick-option [value]="1">A</hc-pick-option>
//                 <hc-pick-option [value]="2">B</hc-pick-option>
//             </hc-pick-pane>`);

//             // from component to model
//             selectOption(fixture, KeyCode.ArrowDown, 0);
//             tickAndDetectChanges(fixture);
//             expect(fixture.componentInstance.selectedCityId).toEqual(1);

//             // from model to component
//             fixture.componentInstance.selectedCityId = 2;
//             tickAndDetectChanges(fixture);

//             expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//                 value: 2,
//                 label: 'B'
//             })]);
//             discardPeriodicTasks();
//         }));

//         it('should not fail while resolving selected item from object', fakeAsync(() => {
//             const fixture = createTestingModule(
//                 NgSelectTestCmp,
//                 `<hc-pick-pane [(ngModel)]="selectedCity">
//                     <hc-pick-option [value]="cities[0]">Vilnius</hc-pick-option>
//                     <hc-pick-option [value]="cities[1]">Kaunas</hc-pick-option>
//             </hc-pick-pane>`);

//             const selected = { name: 'Vilnius', id: 1 };
//             fixture.componentInstance.selectedCity = selected;
//             tickAndDetectChanges(fixture);

//             expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
//                 value: selected,
//                 label: ''
//             })]);
//         }));
//     });


//     it('should not set internal model when single select ngModel is not valid', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         const invalidValues = [undefined, null];

//         for (let v of invalidValues) {
//             fixture.componentInstance.selectedCity = <any>v;
//             tickAndDetectChanges(fixture);
//             expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
//         }
//     }));

//     it('should not set internal model when multiselect ngModel is not valid', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane [items]="cities"
//                     bindLabel="name"
//                     [(ngModel)]="selectedCity">
//             </hc-pick-pane>`);

//         const invalidValues = [{}, '', undefined, 0, 1, 'false', 'true', false];

//         for (let v of invalidValues) {
//             fixture.componentInstance.selectedCity = <any>v;
//             tickAndDetectChanges(fixture);
//             expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
//         }
//     }));

//     describe('Pre-selected model', () => {
//         describe('single', () => {
//             it('should select by bindValue when primitive type', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         bindValue="id"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCityId">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.selectedCityId = 2;
//                 tickAndDetectChanges(fixture);
//                 const result = [jasmine.objectContaining({
//                     value: { id: 2, name: 'Kaunas' },
//                     selected: true
//                 })];
//                 select = fixture.componentInstance.select;
//                 expect(select.selectedItems).toEqual(result);
//             }));

//             it('should select by bindValue ', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         bindValue="id"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCityId">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.cities = [{ id: 0, name: 'Vilnius' }];
//                 fixture.componentInstance.selectedCityId = 0;

//                 tickAndDetectChanges(fixture);

//                 const result = [jasmine.objectContaining({
//                     value: { id: 0, name: 'Vilnius' },
//                     selected: true
//                 })];
//                 expect(fixture.componentInstance.select.selectedItems).toEqual(result);
//             }));

//             it('should select by bindLabel when binding to object', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCity">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.selectedCity = { id: 2, name: 'Kaunas' };
//                 tickAndDetectChanges(fixture);
//                 const result = [jasmine.objectContaining({
//                     value: { id: 2, name: 'Kaunas' },
//                     selected: true
//                 })];
//                 expect(fixture.componentInstance.select.selectedItems).toEqual(result);
//             }));

//             it('should select by object reference', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCity">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
//                 tickAndDetectChanges(fixture);
//                 const result = [jasmine.objectContaining({
//                     value: { id: 2, name: 'Kaunas' },
//                     selected: true
//                 })];
//                 expect(fixture.componentInstance.select.selectedItems).toEqual(result);
//             }));

//             it('should select by compareWith function when bindValue is not used', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         placeholder="select value"
//                         [compareWith]="compareWith"
//                         [(ngModel)]="selectedCity">
//                     </hc-pick-pane>`);


//                 const city = { name: 'Vilnius', id: 7, district: 'Ozo parkas' };
//                 fixture.componentInstance.cities.push(city);
//                 fixture.componentInstance.cities = [...fixture.componentInstance.cities];
//                 fixture.componentInstance.selectedCity = { name: 'Vilnius', district: 'Ozo parkas' } as any;

//                 tickAndDetectChanges(fixture);
//                 expect(fixture.componentInstance.select.selectedItems[0].value).toEqual(city);
//             }));

//             it('should select by compareWith function when bindValue is used', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         bindValue="id"
//                         placeholder="select value"
//                         [compareWith]="compareWith"
//                         [(ngModel)]="selectedCityId">
//                     </hc-pick-pane>`);

//                 const cmp = fixture.componentInstance;
//                 cmp.selectedCityId = cmp.cities[1].id.toString();

//                 cmp.compareWith = (city, model: string) => city.id === +model;

//                 tickAndDetectChanges(fixture);
//                 expect(cmp.select.selectedItems[0].value).toEqual(cmp.cities[1]);
//             }));

//             it('should select selected when there is no items', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         bindValue="id"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCityId">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.cities = [];
//                 fixture.componentInstance.selectedCityId = 2;
//                 tickAndDetectChanges(fixture);
//                 const selected = fixture.componentInstance.select.selectedItems[0];
//                 expect(selected.label).toEqual('');
//                 expect(selected.value).toEqual({ name: null, id: 2 });
//             }));
//         });

//         describe('multiple', () => {
//             const result = [
//                 jasmine.objectContaining({
//                     value: { id: 2, name: 'Kaunas' },
//                     selected: true
//                 }),
//                 jasmine.objectContaining({
//                     value: { id: 3, name: 'Pabrade' },
//                     selected: true
//                 })];

//             it('should select by bindValue when primitive type', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         bindValue="id"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCityIds">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.selectedCityIds = [2, 3];
//                 tickAndDetectChanges(fixture);

//                 expect(fixture.componentInstance.select.selectedItems).toEqual(result)
//             }));

//             it('should select by bindLabel when binding to object', fakeAsync(() => {
//                 const fixture = createTestingModule(
//                     NgSelectTestCmp,
//                     `<hc-pick-pane [items]="cities"
//                         bindLabel="name"
//                         placeholder="select value"
//                         [(ngModel)]="selectedCities">
//                     </hc-pick-pane>`);

//                 fixture.componentInstance.selectedCities = [{ id: 2, name: 'Kaunas' }, { id: 3, name: 'Pabrade' }];
//                 tickAndDetectChanges(fixture);
//                 expect(fixture.componentInstance.select.selectedItems).toEqual(result);
//             }));
//         });
//     });
// });

// describe('Hc-pick-option', () => {
//     it('should update hc-pick-option state', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane>
//                 <hc-pick-option [disabled]="disabled" [value]="true">Yes</hc-pick-option>
//                 <hc-pick-option [value]="false">No</hc-pick-option>
//             </hc-pick-pane>`);

//         tickAndDetectChanges(fixture);
//         const pickPane = fixture.componentInstance.pickPane;
//         expect(pickPane.itemsList.items[0].disabled).toBeFalsy();
//         fixture.componentInstance.disabled = true;
//         tickAndDetectChanges(fixture);
//         expect(pickPane.itemsList.items[0].disabled).toBeTruthy();
//     }));

//     it('should update hc-pick-option label', fakeAsync(() => {
//         const fixture = createTestingModule(
//             NgSelectTestCmp,
//             `<hc-pick-pane>
//                 <hc-pick-option [disabled]="disabled" [value]="true">{{label}}</hc-pick-option>
//                 <hc-pick-option [value]="false">No</hc-pick-option>
//             </hc-pick-pane>`);

//         fixture.componentInstance.label = 'Indeed';
//         tickAndDetectChanges(fixture);
//         const items = fixture.componentInstance.pickPane.itemsList.items;
//         expect(items[0].label).toBe('Indeed');
//     }));
// });