import { async, ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, ErrorHandler, NgZone, Type, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConsoleService } from './console.service';
import { FormsModule } from '@angular/forms';
import { getNgSelectElement, selectOption, TestsErrorHandler, tickAndDetectChanges, triggerKeyDownEvent } from '../testing/helpers';
import { KeyCode, HcOption } from './hc-pick.types';
import { MockConsole, MockNgZone } from '../testing/mocks';
import { HcPickPaneComponent } from '@ng-select/ng-select';
import { HcPicklist2Module } from './hc-picklist2.module';
import { Subject } from 'rxjs';
import { NgSelectConfig } from './config.service';

describe('HcPickPaneComponent', () => {

    describe('Data source', () => {
        it('should set items from primitive numbers array', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="[0, 30, 60, 90, 120, 180, 240]">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const itemsList = fixture.componentInstance.select.itemsList;
            expect(itemsList.items.length).toBe(7);
            expect(itemsList.items[0]).toEqual(jasmine.objectContaining({
                label: '0',
                value: 0
            }));
        }));

        it('should create items from hc-pick-option', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [(ngModel)]="selectedCity">
                <hc-pick-option [value]="true">Yes</hc-pick-option>
                <hc-pick-option [value]="false">No</hc-pick-option>
            </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            const items = fixture.componentInstance.select.itemsList.items;
            expect(items.length).toBe(2);
            expect(items[0]).toEqual(jasmine.objectContaining({
                label: 'Yes', value: true, disabled: false
            }));
            expect(items[1]).toEqual(jasmine.objectContaining({
                label: 'No', value: false, disabled: false
            }));
        }));
    });

    describe('Model bindings and data changes', () => {
        let select: HcPickPaneComponent;

        it('should update ngModel on value change', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 1);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.selectedCity).toEqual(jasmine.objectContaining(fixture.componentInstance.cities[1]));

            fixture.componentInstance.select.clearModel();
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.selectedCity).toEqual(null);
            discardPeriodicTasks();
        }));

        it('should update internal model on ngModel change', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems).toEqual([
                jasmine.objectContaining({
                    value: fixture.componentInstance.cities[0]
                })
            ]);

            fixture.componentInstance.selectedCity = null;
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.select.selectedItems).toEqual([]);
            discardPeriodicTasks();
        }));

        it('should update internal model after it was toggled with *ngIf', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane *ngIf="visible"
                        [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            // select first city
            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);

            // toggle to hide/show
            fixture.componentInstance.toggleVisible();
            tickAndDetectChanges(fixture);
            fixture.componentInstance.toggleVisible();
            tickAndDetectChanges(fixture);

            fixture.componentInstance.selectedCity = null;
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.select.selectedItems).toEqual([]);
        }));

        it('should set items correctly after ngModel set first when bindValue is used', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        bindValue="id"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </hc-pick-pane>`);

            fixture.componentInstance.cities = [];
            fixture.componentInstance.selectedCityId = 7;
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
            tickAndDetectChanges(fixture);

            select = fixture.componentInstance.select;
            expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
            expect(select.selectedItems).toEqual([jasmine.objectContaining({
                value: { id: 7, name: 'Pailgis' }
            })]);
        }));

        it('should set items correctly after ngModel set first when bindValue is not used', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.cities = [];
            fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
            tickAndDetectChanges(fixture);

            select = fixture.componentInstance.select;
            expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
            expect(select.selectedItems).toEqual([jasmine.objectContaining({
                value: { id: 7, name: 'Pailgis' }
            })]);
        }));

        it('should set items correctly after ngModel set first when bindValue is used from NgSelectConfig', fakeAsync(() => {
            const config = new NgSelectConfig();
            config.bindValue = 'id';
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </hc-pick-pane>`,
                config
            );

            fixture.componentInstance.cities = [];
            fixture.componentInstance.selectedCityId = 7;
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
            tickAndDetectChanges(fixture);

            select = fixture.componentInstance.select;
            expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
            expect(select.selectedItems).toEqual([jasmine.objectContaining({
                value: { id: 7, name: 'Pailgis' }
            })]);
        }));

        it('should not apply global bindValue from NgSelectConfig if bindValue prop explicitly provided in template', fakeAsync(() => {
            const config = new NgSelectConfig();
            config.bindValue = 'globalbindvalue';
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        bindValue="id"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </hc-pick-pane>`,
                config
            );

            fixture.componentInstance.cities = [];
            fixture.componentInstance.selectedCityId = 7;
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
            tickAndDetectChanges(fixture);

            select = fixture.componentInstance.select;
            expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
            expect(select.selectedItems).toEqual([jasmine.objectContaining({
                value: { id: 7, name: 'Pailgis' }
            })]);
        }));

        it('should bind whole object as value when bindValue prop is specified with empty string in template', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        bindValue=""
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`
            );

            fixture.componentInstance.cities = [];
            fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [{ id: 7, name: 'Pailgis' }];
            tickAndDetectChanges(fixture);

            select = fixture.componentInstance.select;
            expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
            expect(select.selectedItems).toEqual([jasmine.objectContaining({
                value: { id: 7, name: 'Pailgis' }
            })]);
        }));

        it('should map label correctly', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.cities = [{ label: 'Vilnius city', name: 'Vilnius' }];
            tickAndDetectChanges(fixture);
            select = fixture.componentInstance.select;

            expect(select.itemsList.items[0].label).toBe('Vilnius');
        }));

        it('should set items correctly after ngModel set first when searchTermSubject and single select is used', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [searchTermSubject]="filter"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            select = fixture.componentInstance.select;
            fixture.componentInstance.selectedCity = { id: 1, name: 'Vilnius' };
            tickAndDetectChanges(fixture);
            expect(select.selectedItems).toEqual([
                jasmine.objectContaining({ label: 'Vilnius', value: { id: 1, name: 'Vilnius' } })
            ]);

            fixture.componentInstance.cities = [
                { id: 1, name: 'Vilnius' },
                { id: 2, name: 'Kaunas' },
                { id: 3, name: 'Pabrade' },
            ];
            tickAndDetectChanges(fixture);
            const vilnius = select.itemsList.items[0];
            expect(select.selectedItems[0]).toBe(select.itemsList.items[0]);
            expect(vilnius.selected).toBeTruthy();
        }));

        it('should set items correctly after ngModel set first when searchTermSubject and multi-select is used', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [multiple]="true"
                    [searchTermSubject]="filter"
                    placeholder="select value"
                    [(ngModel)]="selectedCities">
                </hc-pick-pane>`);

            select = fixture.componentInstance.select;
            fixture.componentInstance.selectedCities = [{ id: 1, name: 'Vilnius' }, { id: 2, name: 'Kaunas' }];
            tickAndDetectChanges(fixture);
            expect(select.selectedItems).toEqual([
                jasmine.objectContaining({ label: 'Vilnius', value: { id: 1, name: 'Vilnius' } }),
                jasmine.objectContaining({ label: 'Kaunas', value: { id: 2, name: 'Kaunas' } })
            ]);

            fixture.componentInstance.cities = [
                { id: 1, name: 'Vilnius' },
                { id: 2, name: 'Kaunas' },
                { id: 3, name: 'Pabrade' },
            ];
            tickAndDetectChanges(fixture);
            const vilnius = select.itemsList.items[0];
            const kaunas = select.itemsList.items[1];
            expect(select.selectedItems[0]).toBe(vilnius);
            expect(vilnius.selected).toBeTruthy();
            expect(select.selectedItems[1]).toBe(kaunas);
            expect(kaunas.selected).toBeTruthy();
        }));

        it('should set items correctly if there is no bindLabel', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-option
                    [items]="cities"
                    [clearable]="true"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            const cities = [{ id: 7, name: 'Pailgis' }];
            fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
            tickAndDetectChanges(fixture);
            fixture.componentInstance.cities = [{ id: 1, name: 'Vilnius' }, { id: 2, name: 'Kaunas' }];
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems[0]).toEqual(jasmine.objectContaining({
                value: cities[0]
            }));
        }));

        it('should bind ngModel object even if items are empty', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.cities = [];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.selectedCity = { id: 7, name: 'Pailgis' };
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                value: { id: 7, name: 'Pailgis' },
                selected: true
            })]);
        }));

        it('should bind ngModel simple value even if items are empty', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.cities = [];
            tickAndDetectChanges(fixture);
            fixture.componentInstance.selectedCity = <any>'Kaunas';
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                value: 'Kaunas',
                label: 'Kaunas',
                selected: true
            })]);
        }));

        it('should preserve latest selected value when items are changing', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);


            fixture.componentInstance.select.select(fixture.componentInstance.select.itemsList.items[1]);
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[1]);

            fixture.componentInstance.select.clearModel();
            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.selectedCity).toBeNull();
        }));

        it('should map selected items with items in dropdown', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            select = fixture.componentInstance.select;

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[0]);
            expect(select.itemsList.filteredItems[0].selected).toBeTruthy();
        }));

        it('should keep selected item while setting new items and bindValue is incorrect', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        bindValue="value"
                        [clearable]="true"
                        [(ngModel)]="selectedCityId">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture); // triggers write value

            select = fixture.componentInstance.select;
            select.select(select.itemsList.items[1]);
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);

            expect(select.selectedItems[0]).toEqual(jasmine.objectContaining({
                value: { id: 2, name: 'Kaunas' }
            }));
        }));

        it('should clear previous single select value when setting new model', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);

            const lastSelection: any = fixture.componentInstance.select.selectedItems[0];
            expect(lastSelection.selected).toBeTruthy();

            fixture.componentInstance.selectedCity = null;
            tickAndDetectChanges(fixture);
            expect(lastSelection.selected).toBeFalsy();
        }));

        it('should clear disabled selected values when setting new model', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [multiple]="true"
                        [clearable]="true"
                        [(ngModel)]="selectedCities">
                </hc-pick-pane>`);


            const disabled = { ...fixture.componentInstance.cities[1], disabled: true };
            fixture.componentInstance.selectedCities = <any>[fixture.componentInstance.cities[0], disabled];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities[1].disabled = true;
            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.selectedCities = [];
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems).toEqual([]);
        }));

        it('should clear previous selected value even if it is disabled', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.cities[0].disabled = true;
            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems.length).toBe(1);
        }));

        it('should clear previous multiple select value when setting new model', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [multiple]="true"
                        [clearable]="true"
                        [(ngModel)]="selectedCities">
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
            tickAndDetectChanges(fixture);
            select = fixture.componentInstance.select;
            expect(select.selectedItems.length).toBe(1);

            fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[1]];
            tickAndDetectChanges(fixture);
            expect(select.selectedItems.length).toBe(1);

            fixture.componentInstance.selectedCities = [];
            tickAndDetectChanges(fixture);
            expect(select.selectedItems.length).toBe(0);
        }));

        it('should not add custom itemected items to new items list when [items] are changed', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [multiple]="true"
                        [clearable]="true"
                        [(ngModel)]="selectedCities">
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities.slice(0, 2)];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.cities = [{ id: 1, name: 'New city' }];
            tickAndDetectChanges(fixture);

            const internalItems = fixture.componentInstance.select.itemsList.items;
            expect(internalItems.length).toBe(1);
            expect(internalItems[0].value).toEqual(jasmine.objectContaining({ id: 1, name: 'New city' }));
        }));

        it('should reset marked item when [items] are changed and dropdown is opened', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);
            select = fixture.componentInstance.select;

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[2];
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            expect(fixture.componentInstance.select.itemsList.markedItem.value).toEqual({ name: 'Pabrade', id: 3 });

            fixture.componentInstance.selectedCity = { name: 'New city', id: 5 };
            tickAndDetectChanges(fixture);
            fixture.componentInstance.cities = [...fixture.componentInstance.cities];
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.itemsList.markedItem.value).toEqual({ name: 'Vilnius', id: 1 });
        }));

        it('should bind to custom object properties', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            [(ngModel)]="selectedCityId">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 0);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.selectedCityId).toEqual(1);

            fixture.componentInstance.selectedCityId = 2;
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                value: fixture.componentInstance.cities[1]
            })]);
        }));

        it('should bind to nested label property', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="countries"
                            bindLabel="description.name"
                            [(ngModel)]="selectedCountry">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 1);
            fixture.detectChanges();
            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                label: 'USA',
                value: fixture.componentInstance.countries[1]
            })]);

            fixture.componentInstance.selectedCountry = fixture.componentInstance.countries[0];
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                label: 'Lithuania',
                value: fixture.componentInstance.countries[0]
            })]);
        }));

        it('should bind to nested value property', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="countries"
                            bindLabel="description.name"
                            bindValue="description.id"
                            [(ngModel)]="selectedCountry">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 1);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.selectedCountry).toEqual('b');

            fixture.componentInstance.selectedCountry = fixture.componentInstance.countries[2].description.id;
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                label: 'Australia',
                value: fixture.componentInstance.countries[2]
            })]);

            selectOption(fixture, KeyCode.ArrowUp, 1);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.selectedCountry).toEqual('b');
        }));

        it('should bind to simple array', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 0);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.selectedCity).toBe(<any>'Vilnius');
            fixture.componentInstance.selectedCity = <any>'Kaunas';
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.selectedItems)
                .toEqual([jasmine.objectContaining({ label: 'Kaunas', value: 'Kaunas' })]);
        }));

        it('should bind to object', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            // from component to model
            selectOption(fixture, KeyCode.ArrowDown, 0);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.selectedCity).toEqual(fixture.componentInstance.cities[0]);

            // from model to component
            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                value: fixture.componentInstance.cities[1]
            })]);
            discardPeriodicTasks();
        }));

        describe('hc-pick-option', () => {
            it('should reset to empty array', fakeAsync(() => {
                const fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [(ngModel)]="selectedCityId">
                        <hc-pick-pane *ngFor="let city of cities" [value]="city.id">{{city.name}}</hc-pick-pane>
                    </hc-pick-pane>`);

                select = fixture.componentInstance.select;
                tickAndDetectChanges(fixture);
                expect(select.items.length).toEqual(3);

                fixture.componentInstance.cities = [];
                tickAndDetectChanges(fixture);
                expect(select.items.length).toEqual(0);
            }));

            it('should bind value', fakeAsync(() => {
                const fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [(ngModel)]="selectedCityId">
                    <hc-pick-option [value]="1">A</hc-pick-option>
                    <hc-pick-option [value]="2">B</hc-pick-option>
                </hc-pick-pane>`);

                // from component to model
                selectOption(fixture, KeyCode.ArrowDown, 0);
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.selectedCityId).toEqual(1);

                // from model to component
                fixture.componentInstance.selectedCityId = 2;
                tickAndDetectChanges(fixture);

                expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                    value: 2,
                    label: 'B'
                })]);
                discardPeriodicTasks();
            }));

            it('should not fail while resolving selected item from object', fakeAsync(() => {
                const fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [(ngModel)]="selectedCity">
                        <hc-pick-option [value]="cities[0]">Vilnius</hc-pick-option>
                        <hc-pick-option [value]="cities[1]">Kaunas</hc-pick-option>
                </hc-pick-pane>`);

                const selected = { name: 'Vilnius', id: 1 };
                fixture.componentInstance.selectedCity = selected;
                tickAndDetectChanges(fixture);

                expect(fixture.componentInstance.select.selectedItems).toEqual([jasmine.objectContaining({
                    value: selected,
                    label: ''
                })]);
            }));
        });


        it('should not set internal model when single select ngModel is not valid', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [multiple]="false"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            const invalidValues = [undefined, null];

            for (let v of invalidValues) {
                fixture.componentInstance.selectedCity = <any>v;
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
            }
        }));

        it('should not set internal model when multiselect ngModel is not valid', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [clearable]="true"
                        [multiple]="true"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            const invalidValues = [{}, '', undefined, 0, 1, 'false', 'true', false];

            for (let v of invalidValues) {
                fixture.componentInstance.selectedCity = <any>v;
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
            }
        }));

        describe('Pre-selected model', () => {
            describe('single', () => {
                it('should select by bindValue when primitive type', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </hc-pick-pane>`);

                    fixture.componentInstance.selectedCityId = 2;
                    tickAndDetectChanges(fixture);
                    const result = [jasmine.objectContaining({
                        value: { id: 2, name: 'Kaunas' },
                        selected: true
                    })];
                    select = fixture.componentInstance.select;
                    expect(select.selectedItems).toEqual(result);
                }));

                it('should select by bindValue ', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </hc-pick-pane>`);

                    fixture.componentInstance.cities = [{ id: 0, name: 'Vilnius' }];
                    fixture.componentInstance.selectedCityId = 0;

                    tickAndDetectChanges(fixture);

                    const result = [jasmine.objectContaining({
                        value: { id: 0, name: 'Vilnius' },
                        selected: true
                    })];
                    expect(fixture.componentInstance.select.selectedItems).toEqual(result);
                }));

                it('should select by bindLabel when binding to object', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            placeholder="select value"
                            [(ngModel)]="selectedCity">
                        </hc-pick-pane>`);

                    fixture.componentInstance.selectedCity = { id: 2, name: 'Kaunas' };
                    tickAndDetectChanges(fixture);
                    const result = [jasmine.objectContaining({
                        value: { id: 2, name: 'Kaunas' },
                        selected: true
                    })];
                    expect(fixture.componentInstance.select.selectedItems).toEqual(result);
                }));

                it('should select by object reference', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            placeholder="select value"
                            [(ngModel)]="selectedCity">
                        </hc-pick-pane>`);

                    fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
                    tickAndDetectChanges(fixture);
                    const result = [jasmine.objectContaining({
                        value: { id: 2, name: 'Kaunas' },
                        selected: true
                    })];
                    expect(fixture.componentInstance.select.selectedItems).toEqual(result);
                }));

                it('should select by compareWith function when bindValue is not used', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            placeholder="select value"
                            [compareWith]="compareWith"
                            [(ngModel)]="selectedCity">
                        </hc-pick-pane>`);


                    const city = { name: 'Vilnius', id: 7, district: 'Ozo parkas' };
                    fixture.componentInstance.cities.push(city);
                    fixture.componentInstance.cities = [...fixture.componentInstance.cities];
                    fixture.componentInstance.selectedCity = { name: 'Vilnius', district: 'Ozo parkas' } as any;

                    tickAndDetectChanges(fixture);
                    expect(fixture.componentInstance.select.selectedItems[0].value).toEqual(city);
                }));

                it('should select by compareWith function when bindValue is used', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [compareWith]="compareWith"
                            [(ngModel)]="selectedCityId">
                        </hc-pick-pane>`);

                    const cmp = fixture.componentInstance;
                    cmp.selectedCityId = cmp.cities[1].id.toString();

                    cmp.compareWith = (city, model: string) => city.id === +model;

                    tickAndDetectChanges(fixture);
                    expect(cmp.select.selectedItems[0].value).toEqual(cmp.cities[1]);
                }));

                it('should select selected when there is no items', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            placeholder="select value"
                            [(ngModel)]="selectedCityId">
                        </hc-pick-pane>`);

                    fixture.componentInstance.cities = [];
                    fixture.componentInstance.selectedCityId = 2;
                    tickAndDetectChanges(fixture);
                    const selected = fixture.componentInstance.select.selectedItems[0];
                    expect(selected.label).toEqual('');
                    expect(selected.value).toEqual({ name: null, id: 2 });
                }));
            });

            describe('multiple', () => {
                const result = [
                    jasmine.objectContaining({
                        value: { id: 2, name: 'Kaunas' },
                        selected: true
                    }),
                    jasmine.objectContaining({
                        value: { id: 3, name: 'Pabrade' },
                        selected: true
                    })];

                it('should select by bindValue when primitive type', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            bindValue="id"
                            multiple="true"
                            placeholder="select value"
                            [(ngModel)]="selectedCityIds">
                        </hc-pick-pane>`);

                    fixture.componentInstance.selectedCityIds = [2, 3];
                    tickAndDetectChanges(fixture);

                    expect(fixture.componentInstance.select.selectedItems).toEqual(result)
                }));

                it('should select by bindLabel when binding to object', fakeAsync(() => {
                    const fixture = createTestingModule(
                        NgSelectTestCmp,
                        `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            multiple="true"
                            placeholder="select value"
                            [(ngModel)]="selectedCities">
                        </hc-pick-pane>`);

                    fixture.componentInstance.selectedCities = [{ id: 2, name: 'Kaunas' }, { id: 3, name: 'Pabrade' }];
                    tickAndDetectChanges(fixture);
                    expect(fixture.componentInstance.select.selectedItems).toEqual(result);
                }));
            });
        });
    });

    describe('Dropdown panel', () => {
        it('should set and render items in dropdown panel', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="city">
                </hc-pick-pane>`);

            const select = fixture.componentInstance.select;

            expect(select.dropdownPanel.items.length).toBe(3);
            let options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(3);
            expect(options[0].innerText).toBe('Vilnius');
            expect(options[1].innerText).toBe('Kaunas');
            expect(options[2].innerText).toBe('Pabrade');

            fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);
            options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(30);
            expect(options[0].innerText).toBe('a');
        }));

        it('should always have div #padding with height 0 in dropdown panel when virtual scroll is disabled', fakeAsync(() => {
            createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="false">
                </hc-pick-pane>`);

            const panelItems = document.querySelector('.hc-pick-pane-list-items');
            const firstChild = <HTMLScriptElement>panelItems.firstChild;

            expect(firstChild.offsetHeight).toBe(0);
        }));

        it('should have div #padding with height other than 0 in dropdown panel when virtual scroll is enabled', fakeAsync(() => {

            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.detectChanges();

            expect(fixture.componentInstance.select.dropdownPanel.items.length).toBe(3);
            let options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(3);
            expect(options[0].innerText).toBe('Vilnius');
            expect(options[1].innerText).toBe('Kaunas');
            expect(options[2].innerText).toBe('Pabrade');

            fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);
            fixture.detectChanges();

            const panelItems = document.querySelector('.hc-pick-pane-list-items');
            const firstChild = <HTMLScriptElement>panelItems.firstChild;

            expect(firstChild.offsetHeight).not.toBe(0);
        }));

        it('should set and render items in dropdown panel with virtual scroll', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [virtualScroll]="true"
                            [(ngModel)]="city">
                </hc-pick-pane>`);

            const select = fixture.componentInstance.select;
            tickAndDetectChanges(fixture);
            fixture.detectChanges();

            expect(fixture.componentInstance.select.dropdownPanel.items.length).toBe(3);
            let options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(3);
            expect(options[0].innerText).toBe('Vilnius');
            expect(options[1].innerText).toBe('Kaunas');
            expect(options[2].innerText).toBe('Pabrade');

            fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);
            fixture.detectChanges();
            options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(8);
            expect(options[0].innerText).toBe('a');
        }));


        it('should scroll to item and do not change scroll position when scrolled to visible item', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="city">
                </hc-pick-pane>`);
            const cmp = fixture.componentInstance;
            const el: HTMLElement = fixture.debugElement.nativeElement;
            tickAndDetectChanges(fixture);

            cmp.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);

            cmp.select.dropdownPanel.scrollTo(cmp.select.itemsList.items[1]);
            tickAndDetectChanges(fixture);

            const panelItems = el.querySelector('.hc-pick-pane-list-items');
            expect(panelItems.scrollTop).toBe(0);
        }));

        it('should scroll to item and change scroll position when scrolled to not visible item', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="city">
                </hc-pick-pane>`);
            const cmp = fixture.componentInstance;
            const el: HTMLElement = fixture.debugElement.nativeElement;

            cmp.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);

            cmp.select.dropdownPanel.scrollTo(cmp.select.itemsList.items[15]);
            tickAndDetectChanges(fixture);

            const panelItems = el.querySelector('.hc-pick-pane-list-items');
            expect(panelItems.scrollTop).toBe(48);
        }));
    });

    describe('Keyboard events', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let select: HcPickPaneComponent;

        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [loading]="citiesLoading"
                        [selectOnTab]="selectOnTab"
                        [multiple]="multiple"
                        [(ngModel)]="selectedCity">
                </hc-pick-pane>`);
            select = fixture.componentInstance.select;
        });

        describe('arrows', () => {
            it('should select next value on arrow down', fakeAsync(() => {
                selectOption(fixture, KeyCode.ArrowDown, 1);
                const result = [jasmine.objectContaining({
                    value: fixture.componentInstance.cities[1]
                })];
                expect(select.selectedItems).toEqual(result);
            }));

            it('should stop marked loop if all items disabled', fakeAsync(() => {
                fixture.componentInstance.cities[0].disabled = true;
                fixture.componentInstance.cities = [...fixture.componentInstance.cities];
                tickAndDetectChanges(fixture);
                select.filter('vil');
                tickAndDetectChanges(fixture);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowDown);
                expect(select.itemsList.markedItem).toBeUndefined();
            }));

            it('should select first value on arrow down when current value is last', fakeAsync(() => {
                fixture.componentInstance.selectedCity = fixture.componentInstance.cities[2];
                tickAndDetectChanges(fixture);
                selectOption(fixture, KeyCode.ArrowDown, 1);
                tickAndDetectChanges(fixture);
                const result = [jasmine.objectContaining({
                    value: fixture.componentInstance.cities[0]
                })];
                expect(select.selectedItems).toEqual(result);
            }));

            it('should skip disabled option and select next one', fakeAsync(() => {
                const city: any = fixture.componentInstance.cities[0];
                city.disabled = true;
                selectOption(fixture, KeyCode.ArrowDown, 1);
                tickAndDetectChanges(fixture);
                const result = [jasmine.objectContaining({
                    value: fixture.componentInstance.cities[1]
                })];
                expect(select.selectedItems).toEqual(result);
            }));

            it('should select previous value on arrow up', fakeAsync(() => {
                fixture.componentInstance.selectedCity = fixture.componentInstance.cities[1];
                tickAndDetectChanges(fixture);
                selectOption(fixture, KeyCode.ArrowUp, 1);
                tickAndDetectChanges(fixture);
                const result = [jasmine.objectContaining({
                    value: fixture.componentInstance.cities[0]
                })];
                expect(select.selectedItems).toEqual(result);
            }));

            it('should select last value on arrow up', fakeAsync(() => {
                selectOption(fixture, KeyCode.ArrowUp, 1);
                const result = [jasmine.objectContaining({
                    value: fixture.componentInstance.cities[2]
                })];
                expect(select.selectedItems).toEqual(result);
            }));
        });

        describe('tab', () => {
            it('should mark first item on filter when tab', fakeAsync(() => {
                tick(200);
                fixture.componentInstance.select.filter('pab');
                tick(200);

                const result = jasmine.objectContaining({
                    value: fixture.componentInstance.cities[2]
                });
                expect(fixture.componentInstance.select.itemsList.markedItem).toEqual(result);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
                expect(fixture.componentInstance.select.selectedItems).toEqual([result]);
            }));
        });

        describe('key presses', () => {
            beforeEach(() => {
                select.searchable = false;
                select.ngOnInit();
            });

            it('should select item using key while not opened', fakeAsync(() => {
                triggerKeyDownEvent(getNgSelectElement(fixture), 97, 'v');
                tick(200);

                expect(fixture.componentInstance.selectedCity.name).toBe('Vilnius');
            }));

            it('should mark item using key while opened', fakeAsync(() => {
                const findByLabel = spyOn(select.itemsList, 'findByLabel');
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
                triggerKeyDownEvent(getNgSelectElement(fixture), 97, 'v');
                triggerKeyDownEvent(getNgSelectElement(fixture), 97, 'i');
                triggerKeyDownEvent(getNgSelectElement(fixture), 97, 'l');
                tick(200);

                expect(fixture.componentInstance.selectedCity).toBeUndefined();
                expect(select.itemsList.markedItem.label).toBe('Vilnius');
                expect(findByLabel).toHaveBeenCalledWith('vil')
            }));
        });

        describe('enter', () => {
            it('should select first option', () => {
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            });
        });
    });

    describe('Custom templates', () => {
        it('should display custom header template', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
                    <ng-template ng-label-tmp let-item="item">
                        <div class="custom-header">{{item.name}}</div>
                    </ng-template>
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            tickAndDetectChanges(fixture);
            tickAndDetectChanges(fixture);

            const el = fixture.debugElement.query(By.css('.custom-header'));
            expect(el).not.toBeNull();
            expect(el.nativeElement).not.toBeNull();
        }));

        it('should clear item using value', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="city">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.select.selectedItems.length).toBe(1);

            fixture.componentInstance.select.clearItem(fixture.componentInstance.cities[0]);
            expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
            tick();
        }));

        it('should clear item even if there are no items loaded', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            selectOption(fixture, KeyCode.ArrowDown, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.select.selectedItems.length).toBe(1);
            const selected = fixture.componentInstance.selectedCity;
            fixture.componentInstance.cities = [];
            fixture.detectChanges();

            fixture.componentInstance.select.clearItem(selected);
            expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
            tick();
        }));

        it('should display custom dropdown option template', async(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
                    <ng-template hc-pick-option-tmp let-item="item">
                        <div class="custom-option">{{item.name}}</div>
                    </ng-template>
                </hc-pick-pane>`);

            fixture.detectChanges();

            fixture.whenStable().then(() => {
                const el = fixture.debugElement.query(By.css('.custom-option')).nativeElement;
                expect(el).not.toBeNull();
            });
        }));

        it('should display custom multiple label template', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" [multiple]="true" [(ngModel)]="selectedCities">
                    <ng-template ng-multi-label-tmp let-items="items">
                        <div class="custom-multi-label">selected {{items.length}}</div>
                    </ng-template>
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
            tickAndDetectChanges(fixture);
            tickAndDetectChanges(fixture);

            const el = fixture.debugElement.query(By.css('.custom-multi-label')).nativeElement;
            expect(el.innerHTML).toBe('selected 1');
        }));

        it('should display custom footer and header template', async(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
                    <ng-template hc-pane-list-header-tmp>
                        <span class="header-label">header</span>
                    </ng-template>
                    <ng-template hc-pane-footer-tmp>
                        <span class="footer-label">footer</span>
                    </ng-template>
                </hc-pick-pane>`);
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                const header = fixture.debugElement.query(By.css('.header-label')).nativeElement;
                expect(header.innerHTML).toBe('header');

                const footer = fixture.debugElement.query(By.css('.footer-label')).nativeElement;
                expect(footer.innerHTML).toBe('footer');
            });
        }));

        it('should display custom item template', async(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity" [addCustomItem]="true">
                    <ng-template hc-pick-custom-item-tmp let-search="searchTerm">
                        <span class="custom-item-template">{{searchTerm}}</span>
                    </ng-template>
                </hc-pick-pane>`);

            fixture.componentInstance.select.searchTerm = 'custom-item';
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                const template = fixture.debugElement.query(By.css('.custom-item-template')).nativeElement;
                expect(template).toBeDefined();
            });
        }));

        it('should display custom loading and no data found template', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            [loading]="citiesLoading"
                            [(ngModel)]="selectedCity">

                    <ng-template ng-notfound-tmp let-searchTerm="searchTerm">
                        <div class="custom-notfound">
                            No data found for "{{searchTerm}}"
                        </div>
                    </ng-template>
                    <ng-template ng-loadingtext-tmp let-searchTerm="searchTerm">
                        <div class="custom-loading">
                            Fetching Data for "{{searchTerm}}"
                        </div>
                    </ng-template>
                </hc-pick-pane>`);

            fixture.whenStable().then(() => {
                fixture.componentInstance.cities = [];
                fixture.componentInstance.citiesLoading = true;
                tickAndDetectChanges(fixture);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
                tickAndDetectChanges(fixture);
                const loadingOption = fixture.debugElement.queryAll(By.css('.custom-loading'));
                expect(loadingOption.length).toBe(1);


                fixture.componentInstance.citiesLoading = false;
                tickAndDetectChanges(fixture);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
                tickAndDetectChanges(fixture);
                const notFoundOptions = fixture.debugElement.queryAll(By.css('.custom-notfound'));
                expect(notFoundOptions.length).toBe(1);
            });
        }));

        it('should display custom loading spinner template', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            [loading]="true"
                            [(ngModel)]="selectedCity">

                    <ng-template ng-loadingspinner-tmp>
                        <div class="custom-loadingspinner">
                            Custom loading spinner
                        </div>
                    </ng-template>
                </hc-pick-pane>`);

            fixture.whenStable().then(() => {
                tickAndDetectChanges(fixture);
                const spinner = fixture.debugElement.queryAll(By.css('.custom-loadingspinner'));
                expect(spinner.length).toBe(1);
            });
        }));

        it('should update hc-pick-option state', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [(ngModel)]="selectedCity">
                    <hc-pick-pane [disabled]="disabled" [value]="true">Yes</hc-pick-pane>
                    <hc-pick-option [value]="false">No</hc-pick-option>
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const items = fixture.componentInstance.select.itemsList.items;
            expect(items[0].disabled).toBeFalsy();
            fixture.componentInstance.disabled = true;
            tickAndDetectChanges(fixture);
            expect(items[0].disabled).toBeTruthy();
        }));

        it('should update hc-pick-option label', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [(ngModel)]="selectedCity">
                    <hc-pick-pane [disabled]="disabled" [value]="true">{{label}}</hc-pick-pane>
                    <hc-pick-option [value]="false">No</hc-pick-option>
                </hc-pick-pane>`);

            fixture.componentInstance.label = 'Indeed';
            tickAndDetectChanges(fixture);
            const items = fixture.componentInstance.select.itemsList.items;
            expect(items[0].label).toBe('Indeed');
        }));
    });

    describe('Multiple', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let select: HcPickPaneComponent;
        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    placeholder="select value"
                    [(ngModel)]="selectedCities"
                    [multiple]="true">
                </hc-pick-pane>`);
        });

        it('should select several items', fakeAsync(() => {
            selectOption(fixture, KeyCode.ArrowDown, 1);
            selectOption(fixture, KeyCode.ArrowDown, 2);
            tickAndDetectChanges(fixture);
            expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(2);
        }));

        it('should toggle selected item', fakeAsync(() => {
            selectOption(fixture, KeyCode.ArrowDown, 0);
            selectOption(fixture, KeyCode.ArrowDown, 2);
            tickAndDetectChanges(fixture);
            expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(2);

            selectOption(fixture, KeyCode.ArrowDown, 1);
            tickAndDetectChanges(fixture);
            expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(1);
            expect(fixture.componentInstance.select.selectedItems[0]).toEqual(jasmine.objectContaining({
                value: { id: 3, name: 'Pabrade' }
            }));
        }));

        it('should not toggle item on enter when dropdown is closed', fakeAsync(() => {
            selectOption(fixture, KeyCode.ArrowDown, 0);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Esc);
            expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(1);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(1);
        }));

        describe('max selected items', () => {
            let arrowIcon: DebugElement = null;
            beforeEach(() => {
                fixture.componentInstance.select.maxSelectedItems = 2;
                arrowIcon = fixture.debugElement.query(By.css('.ng-arrow-wrapper'));
            });

            it('should be able to select only two elements', fakeAsync(() => {
                selectOption(fixture, KeyCode.ArrowDown, 0);
                selectOption(fixture, KeyCode.ArrowDown, 1);
                selectOption(fixture, KeyCode.ArrowDown, 1);
                tickAndDetectChanges(fixture);
                expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(2);
            }));
        });

        describe('show selected', () => {
            beforeEach(() => {
                select = fixture.componentInstance.select;
            });

            it('should not insert option back to list if it is newly created option', fakeAsync(() => {
                select.addCustomItem = true;
                select.searchTermSubject = new Subject();
                select.searchTermSubject.subscribe();
                fixture.componentInstance.cities = [];
                tickAndDetectChanges(fixture);
                fixture.componentInstance.select.filter('New item');
                tickAndDetectChanges(fixture);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);

                expect(select.selectedItems.length).toBe(1);
                expect(select.items.length).toBe(0);
                select.unselect(select.selectedItems[0]);
                tickAndDetectChanges(fixture);
                expect(select.itemsList.filteredItems.length).toBe(0);
            }));

            it('should remove selected item from items list', fakeAsync(() => {
                fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
                tickAndDetectChanges(fixture);
                expect(select.selectedItems.length).toBe(1);
                expect(select.itemsList.filteredItems.length).toBe(2);
            }));

            it('should put unselected item back to list', fakeAsync(() => {
                fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
                tickAndDetectChanges(fixture);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
                triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Backspace);
                expect(fixture.componentInstance.select.selectedItems.length).toBe(0);
                expect(fixture.componentInstance.select.itemsList.filteredItems.length).toBe(3);
            }));

            it('should keep same ordering while unselecting', fakeAsync(() => {
                fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities.reverse()];
                tickAndDetectChanges(fixture);
                select.unselect(select.selectedItems[0]);
                select.unselect(select.selectedItems[0]);
                select.unselect(select.selectedItems[0]);
                expect(select.selectedItems.length).toBe(0);
                expect(select.itemsList.filteredItems.length).toBe(3);
                expect(select.itemsList.filteredItems[0].label).toBe('Vilnius');
                expect(select.itemsList.filteredItems[1].label).toBe('Kaunas');
                expect(select.itemsList.filteredItems[2].label).toBe('Pabrade');
            }));

            it('should reset list while clearing all selected items', fakeAsync(() => {
                fixture.componentInstance.selectedCities = [...fixture.componentInstance.cities];
                tickAndDetectChanges(fixture);
                select.deselectAll();
                expect(select.selectedItems.length).toBe(0);
                expect(select.itemsList.filteredItems.length).toBe(3);
            }));

            it('should skip selected items while filtering', fakeAsync(() => {
                // todo: idk yet
                fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
                tickAndDetectChanges(fixture);
                select.filter('s');
                tickAndDetectChanges(fixture);
                expect(select.itemsList.filteredItems.length).toBe(1);
                expect(select.itemsList.filteredItems[0].label).toBe('Kaunas');
                select.filter('');
                tickAndDetectChanges(fixture);
                expect(select.itemsList.filteredItems.length).toBe(2);
            }));
        });
    });

    describe('Custom Options', () => {
        it('should select default custom item', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [addCustomItem]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('new custom item');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.selectedCity.name).toBe('new custom item');
        }));

        it('should add custom item as string', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames"
                    [addCustomItem]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('Copenhagen');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.selectedCity).toBe(<any>'Copenhagen');
        }));

        it('should add custom item as string when there are no items', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="[]"
                    [addCustomItem]="true"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('Copenhagen');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.selectedCity).toBe(<any>'Copenhagen');
            expect(fixture.componentInstance.select.itemsList.filteredItems.length).toBe(1);
        }));

        it('should not add custom itemm to list when select is closed', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="[]"
                    [isOpen]="false"
                    [addCustomItem]="true"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('Copenhagen');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.select.itemsList.filteredItems.length).toBe(0);
        }));

        it('should add custom item as string when tab pressed', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames"
                    [addCustomItem]="true"
                    [selectOnTab]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('Copenhagen');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Tab);
            expect(fixture.componentInstance.selectedCity).toBe(<any>'Copenhagen');
        }));

        it('should select custom item even if there are filtered items that matches search term', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [addCustomItem]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('Vil');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowDown);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.selectedCity.name).toBe('Vil');
        }));

        it('should select custom custom item', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [addCustomItem]="customItemFunc"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('custom item');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(<any>fixture.componentInstance.selectedCity).toEqual(jasmine.objectContaining({
                id: 'custom item', name: 'custom item', custom: true
            }));
        }));

        it('should select custom item with promise', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [addCustomItem]="customItemFuncPromise"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('server side custom item');
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            tick();
            expect(<any>fixture.componentInstance.selectedCity).toEqual(jasmine.objectContaining({
                id: 5, name: 'server side custom item', valid: true
            }));
        }));

        describe('show add custom item', () => {
            let select: HcPickPaneComponent;
            let fixture: ComponentFixture<NgSelectTestCmp>;
            beforeEach(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [multiple]="true"
                    [addCustomItem]="true"
                    placeholder="select value"
                    [(ngModel)]="selectedCities">
                </hc-pick-pane>`);
                select = fixture.componentInstance.select;
            });

            it('should be false when there is no search term', () => {
                select.searchTerm = null;
                expect(select.showAddCustomOption).toBeFalsy();
            });

            it('should be false when term is too short', () => {
                select.searchTerm = 'vi';
                select.searchTermMinLength = 3;
                expect(select.showAddCustomOption).toBeFalsy();
            });

            it('should be true when term not exists among items', () => {
                select.searchTerm = 'Vil';
                expect(select.showAddCustomOption).toBeTruthy();
            });

            it('should be false when term exists among items', () => {
                select.searchTerm = 'Vilnius';
                expect(select.showAddCustomOption).toBeFalsy();
            });

            it('should be false when term exists among selected items', fakeAsync(() => {
                fixture.componentInstance.selectedCities = [{ name: 'Palanga', id: 9 }];
                select.searchTerm = 'Palanga';
                tickAndDetectChanges(fixture);
                expect(select.showAddCustomOption).toBeFalsy();
            }));

            it('should be false when there is search term with only empty space', () => {
                select.searchTerm = '   ';
                expect(select.showAddCustomOption).toBeFalsy();
            });
        });
    });

    describe('Placeholder', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    placeholder="select value"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);
        });

        it('should be visible when no value selected', async(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const element = fixture.componentInstance.select.element;
                const placeholder: any = element.querySelector('.ng-placeholder');
                expect(placeholder.innerText).toBe('select value');
                expect(getComputedStyle(placeholder).display).toBe('block');
            });
        }));
    });

    describe('Filter', () => {
        it('should filter using default implementation', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tick(200);
            fixture.componentInstance.select.filter('vilnius');
            tick(200);

            const result = [jasmine.objectContaining({
                value: { id: 1, name: 'Vilnius' }
            })];
            expect(fixture.componentInstance.select.itemsList.filteredItems).toEqual(result);
        }));

        it('should filter using custom searchFn', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [searchFn]="searchFn"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.searchFn = (term: string, item: any) => {
                return item.name.indexOf(term) > -1 || item.id === 2;
            };
            const select = fixture.componentInstance.select;
            tickAndDetectChanges(fixture);
            select.filter('Vilnius');
            tick(200);

            expect(select.itemsList.filteredItems.length).toEqual(2);
            expect(select.itemsList.filteredItems[0]).toEqual(jasmine.objectContaining({
                value: { id: 1, name: 'Vilnius' }
            }));
            expect(select.itemsList.filteredItems[1]).toEqual(jasmine.objectContaining({
                value: { id: 2, name: 'Kaunas' }
            }));
        }));

        it('should not filter when searchable false', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [searchable]="false"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            const select = fixture.componentInstance.select;
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            triggerKeyDownEvent(getNgSelectElement(fixture), 97, 'v');
            tick(200);
            fixture.detectChanges();

            const input: HTMLInputElement = select.element.querySelector('input');
            expect(select.searchTerm).toBeNull();
            expect(input.readOnly).toBeTruthy();
        }));

        it('should mark first item on filter', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tick(200);
            fixture.componentInstance.select.filter('pab');
            tick(200);

            const result = jasmine.objectContaining({
                value: fixture.componentInstance.cities[2]
            });
            expect(fixture.componentInstance.select.itemsList.markedItem).toEqual(result);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.select.selectedItems).toEqual([result]);
        }));

        it('should not mark first item when isOpen is false', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [isOpen]="false"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tick(200);
            fixture.componentInstance.select.filter('pab');
            tick(200);

            expect(fixture.componentInstance.select.itemsList.markedItem).toBeUndefined();
        }));

        it('should mark first item on filter when selected is not among filtered items', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            fixture.componentInstance.selectedCity = fixture.componentInstance.cities[0];
            fixture.detectChanges();
            fixture.componentInstance.select.filter('pab');
            tick();

            const result = jasmine.objectContaining({
                value: fixture.componentInstance.cities[2]
            });
            expect(fixture.componentInstance.select.itemsList.markedItem).toEqual(result);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.select.selectedItems).toEqual([result]);
        }));

        it('should clear filterValue on selected item', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity"
                    [multiple]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            fixture.componentInstance.select.searchTerm = 'Hey! Whats up!?';
            selectOption(fixture, KeyCode.ArrowDown, 1);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.select.searchTerm).toBe(null);
        }));

        it('should not reset items when selecting option', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity"
                    [multiple]="true">
                </hc-pick-pane>`);

            const resetFilteredItemsSpy = spyOn(fixture.componentInstance.select.itemsList, 'resetFilteredItems');
            tickAndDetectChanges(fixture);

            fixture.componentInstance.select.searchTerm = null;
            selectOption(fixture, KeyCode.ArrowDown, 1);
            tickAndDetectChanges(fixture);
            expect(resetFilteredItemsSpy).not.toHaveBeenCalled();
        }));

        it('should filter grouped items', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.filter('adam');
            tickAndDetectChanges(fixture);

            const filteredItems = fixture.componentInstance.select.itemsList.filteredItems;
            expect(filteredItems.length).toBe(2);
            expect(filteredItems[0].children).toBeDefined();
            expect(filteredItems[0].label).toBe('United States');
            expect(filteredItems[1].parent).toBe(filteredItems[0]);
            expect(filteredItems[1].label).toBe('Adam');
        }));

        it('should continue filtering items on update of items', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);
            tickAndDetectChanges(fixture);

            fixture.componentInstance.select.filter('vil');
            tickAndDetectChanges(fixture);

            let result = [jasmine.objectContaining({
                value: { id: 1, name: 'Vilnius' }
            })];
            expect(fixture.componentInstance.select.itemsList.filteredItems).toEqual(result);

            fixture.componentInstance.cities = [
                { id: 1, name: 'Vilnius' },
                { id: 2, name: 'Kaunas' },
                { id: 3, name: 'Pabrade' },
                { id: 4, name: 'Bruchhausen-Vilsen' },
            ];
            tickAndDetectChanges(fixture);

            result = [
                jasmine.objectContaining({
                    value: { id: 1, name: 'Vilnius' }
                }),
                jasmine.objectContaining({
                    value: { id: 4, name: 'Bruchhausen-Vilsen' }
                })
            ];
            expect(fixture.componentInstance.select.itemsList.filteredItems).toEqual(result);
        }));

        describe('with searchTermSubject', () => {
            let fixture: ComponentFixture<NgSelectTestCmp>;
            beforeEach(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                        [searchTermSubject]="filter"
                        [searchTermMinLength]="searchTermMinLength"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [(ngModel)]="selectedCity">
                    </hc-pick-pane>`);
            });

            it('should not show selected city among options if it does not match search term', fakeAsync(() => {
                fixture.componentInstance.selectedCity = { id: 9, name: 'Copenhagen' };
                tickAndDetectChanges(fixture);

                fixture.componentInstance.filter.subscribe();
                fixture.componentInstance.select.filter('new');
                fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.select.itemsList.filteredItems.length).toBe(1);
                expect(fixture.componentInstance.select.itemsList.filteredItems[0]).toEqual(jasmine.objectContaining({
                    value: { id: 4, name: 'New York' }
                }))
            }));

            it('should push term to custom observable', fakeAsync(() => {
                fixture.componentInstance.filter.subscribe();
                const next = spyOn(fixture.componentInstance.filter, 'next');
                fixture.componentInstance.select.filter('vilnius');
                tickAndDetectChanges(fixture);
                expect(next).toHaveBeenCalledWith('vilnius')
            }));

            it('should push term to custom observable', fakeAsync(() => {
                fixture.componentInstance.filter.subscribe();
                const next = spyOn(fixture.componentInstance.filter, 'next');
                fixture.componentInstance.select.filter('');
                tickAndDetectChanges(fixture);
                expect(next).toHaveBeenCalledWith('')
            }));

            it('should not push term to custom observable if length is less than searchTermMinLength', fakeAsync(() => {
                fixture.componentInstance.searchTermMinLength = 2;
                tickAndDetectChanges(fixture);
                fixture.componentInstance.filter.subscribe();
                const next = spyOn(fixture.componentInstance.filter, 'next');
                fixture.componentInstance.select.filter('v');
                tickAndDetectChanges(fixture);
                expect(next).not.toHaveBeenCalledWith('v')
            }));
        });

        describe('edit search query', () => {
            it('should allow edit search if option selected & input focused', fakeAsync(() => {
                const fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                        [searchTermSubject]="filter"
                        [editableSearchTerm]="true"
                        bindValue="id"
                        bindLabel="name"
                        [(ngModel)]="selectedCity">
                    </hc-pick-pane>`);
                const select = fixture.componentInstance.select;
                const input = select.searchInput.nativeElement;
                const selectedCity = fixture.componentInstance.cities[0];
                fixture.componentInstance.selectedCity = selectedCity.id;
                tickAndDetectChanges(fixture);
                input.focus();
                tickAndDetectChanges(fixture);
                expect(select.searchTerm).toEqual(selectedCity.name);
                expect(input.value).toEqual(selectedCity.name);
            }));
        });
    });

    describe('Accessibility', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let select: HcPickPaneComponent;
        let input: HTMLInputElement;

        beforeEach(fakeAsync(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        (change)="onChange($event)"
                        bindLabel="name">
                </hc-pick-pane>`);
            select = fixture.componentInstance.select;
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        }));

        it('should set aria-activedescendant absent at start', fakeAsync(() => {
            expect(input.hasAttribute('aria-activedescendant'))
                .toBe(false);
        }));

        it('should set aria-owns absent at start', fakeAsync(() => {
            expect(input.hasAttribute('aria-owns'))
                .toBe(false);
        }));

        it('should set aria-owns be set to dropdownId on open', fakeAsync(() => {
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);

            expect(input.getAttribute('aria-owns'))
                .toBe(select.dropdownId);
        }));

        it('should set aria-activedecendant equal to chosen item on open', fakeAsync(() => {
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            expect(input.getAttribute('aria-activedescendant'))
                .toBe(select.itemsList.markedItem.htmlId);
        }));

        it('should set aria-activedecendant equal to chosen item on arrow down', fakeAsync(() => {
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowDown);
            tickAndDetectChanges(fixture);
            expect(input.getAttribute('aria-activedescendant'))
                .toBe(select.itemsList.markedItem.htmlId);
        }));

        it('should set aria-activedecendant equal to chosen item on arrow up', fakeAsync(() => {
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.ArrowUp);
            tickAndDetectChanges(fixture);
            expect(input.getAttribute('aria-activedescendant'))
                .toBe(select.itemsList.markedItem.htmlId);
        }));

        it('should set aria-activedescendant absent on dropdown close', fakeAsync(() => {
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            tickAndDetectChanges(fixture);
            expect(input.hasAttribute('aria-activedescendant'))
                .toBe(false);
        }));

        it('should set aria-owns  absent on dropdown close', fakeAsync(() => {
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);
            tickAndDetectChanges(fixture);
            expect(input.hasAttribute('aria-owns'))
                .toBe(false);
        }));
    });

    describe('Output events', () => {
        it('should fire search event', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            (search)="onSearch($event)"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onSearch');

            fixture.componentInstance.select.filter('term');
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.onSearch).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith({ term: 'term', items: [] });
        }));

        it('should fire change when changed', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            bindValue="id"
                            bindLabel="name"
                            (change)="onChange($event)"
                            [(ngModel)]="selectedCityId">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onChange');

            fixture.componentInstance.selectedCityId = fixture.componentInstance.cities[1].id;
            tickAndDetectChanges(fixture);

            const select = fixture.componentInstance.select;
            select.select(select.itemsList.items[0]);
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.onChange).toHaveBeenCalledWith(select.selectedItems[0].value);
            expect(fixture.componentInstance.selectedCityId).toBe(fixture.componentInstance.cities[0].id);
        }));

        it('should not fire change when item not changed', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            (change)="onChange()"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onChange');

            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);

            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space);
            triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter);

            expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
        }));

        it('should fire addEvent when item is added', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            (add)="onAdd($event)"
                            [multiple]="true"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onAdd');

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.select(fixture.componentInstance.select.itemsList.items[0]);

            expect(fixture.componentInstance.onAdd).toHaveBeenCalledWith(fixture.componentInstance.cities[0]);
        }));

        it('should not fire addEvent for single select', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            (add)="onAdd($event)"
                            [multiple]="false"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onAdd');

            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.select(fixture.componentInstance.select.itemsList.items[0]);
            expect(fixture.componentInstance.onAdd).not.toHaveBeenCalled();
        }));

        it('should fire remove when item is removed', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            (remove)="onRemove($event)"
                            [multiple]="true"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onRemove');

            fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
            tickAndDetectChanges(fixture);

            fixture.componentInstance.select.unselect(fixture.componentInstance.cities[0]);

            expect(fixture.componentInstance.onRemove).toHaveBeenCalledWith(fixture.componentInstance.cities[0]);
        }));

        it('should fire clear when model is cleared using clear icon', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            (clear)="onClear($event)"
                            [multiple]="true"
                            [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            spyOn(fixture.componentInstance, 'onClear');

            fixture.componentInstance.selectedCities = [fixture.componentInstance.cities[0]];
            tickAndDetectChanges(fixture);
            fixture.componentInstance.select.deselectAll();
            tickAndDetectChanges(fixture);

            expect(fixture.componentInstance.onClear).toHaveBeenCalled();
        }));
    });

    describe('Auto-focus', () => {
        it('should focus dropdown', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                            autofocus
                            bindLabel="name"
                            [multiple]="true"
                            [(ngModel)]="selectedCities">
                </hc-pick-pane>`);
            const select = fixture.componentInstance.select;
            const focus = spyOn(select, 'focus');
            select.ngAfterViewInit();
            expect(focus).toHaveBeenCalled();
        }));
    });

    describe('Mousedown', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let select: HcPickPaneComponent;
        let triggerMousedown = null;

        describe('input click', () => {
            let event: Event;
            beforeEach(fakeAsync(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [multiple]="true"
                            [(ngModel)]="selectedCities">
                    </hc-pick-pane>`);
                select = fixture.componentInstance.select;

                event = createEvent({ tagName: 'INPUT' }) as any;
                triggerMousedown = () => {
                    const control = fixture.debugElement.query(By.css('.hc-pick-search-outer'));
                    control.triggerEventHandler('mousedown', event);
                };
            }));

            it('should not prevent default', fakeAsync(() => {
                const preventDefault = spyOn(event, 'preventDefault');
                triggerMousedown();
                tickAndDetectChanges(fixture);
                expect(preventDefault).not.toHaveBeenCalled();
            }));
        });

        describe('clear icon click', () => {
            beforeEach(fakeAsync(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                            (change)="onChange($event)"
                            bindLabel="name"
                            [multiple]="true"
                            [disabled]="disabled"
                            [readonly]="readonly"
                            [(ngModel)]="selectedCities">
                    </hc-pick-pane>`);

                spyOn(fixture.componentInstance, 'onChange');
                const disabled = { ...fixture.componentInstance.cities[1], disabled: true };
                fixture.componentInstance.selectedCities = <any>[fixture.componentInstance.cities[0], disabled];
                tickAndDetectChanges(fixture);
                fixture.componentInstance.cities[1].disabled = true;
                fixture.componentInstance.cities = [...fixture.componentInstance.cities];
                tickAndDetectChanges(fixture);
                triggerMousedown = () => {
                    const control = fixture.debugElement.query(By.css('.hc-pick-search-outer'));
                    control.triggerEventHandler('mousedown', createEvent({
                        classList: { contains: (term) => term === 'ng-clear-wrapper' }
                    }));
                };
            }));

            it('should clear model except disabled', fakeAsync(() => {
                triggerMousedown();
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.selectedCities.length).toBe(1);
                expect(fixture.componentInstance.selectedCities[0]).toEqual(jasmine.objectContaining({ id: 2, name: 'Kaunas' }));
                expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
            }));

            it('should clear only search text', fakeAsync(() => {
                fixture.componentInstance.selectedCities = null;
                fixture.componentInstance.select.searchTerm = 'Hey! Whats up!?';
                tickAndDetectChanges(fixture);
                triggerMousedown();
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(0);
                expect(fixture.componentInstance.select.searchTerm).toBe(null);
            }));

            it('clear button should not appear if select is disabled', fakeAsync(() => {
                fixture.componentInstance.disabled = true;
                tickAndDetectChanges(fixture);
                tickAndDetectChanges(fixture);
                const el = fixture.debugElement.query(By.css('.ng-clear-wrapper'));
                expect(el).toBeNull();
            }));

            it('clear button should not appear if select is readonly', fakeAsync(() => {
                fixture.componentInstance.readonly = true;
                tickAndDetectChanges(fixture);
                tickAndDetectChanges(fixture);
                const el = fixture.debugElement.query(By.css('.ng-clear-wrapper'));
                expect(el).toBeNull();
            }));
        });

        describe('select none click', () => {
            beforeEach(fakeAsync(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [multiple]="true"
                            [(ngModel)]="selectedCities">
                    </hc-pick-pane>`);
                select = fixture.componentInstance.select;

                fixture.componentInstance.selectedCities = fixture.componentInstance.cities[0];
                tickAndDetectChanges(fixture);
                tickAndDetectChanges(fixture);
                triggerMousedown = () => {
                    const control = fixture.debugElement.query(By.css('.hc-pick-search-outer'));
                    control.triggerEventHandler('mousedown', createEvent({
                        classList: { contains: (term) => term === 'ng-value-icon' }
                    }));
                };
            }));

            it('should focus dropdown while unselecting', fakeAsync(() => {
                const focus = spyOn(select, 'focus');
                select.unselect(fixture.componentInstance.cities[0]);
                tickAndDetectChanges(fixture);
                expect(focus).toHaveBeenCalled();
            }));
        });
    });

    describe('Grouping', () => {
        it('should group flat items list by group key', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            const items = fixture.componentInstance.select.itemsList.items;

            expect(items.length).toBe(14);
            expect(items[0].children).toBeDefined();
            expect(items[0].index).toBe(0);
            expect(items[0].label).toBe('United States');
            expect(items[0].disabled).toBeTruthy();
            expect(items[0].value).toEqual({ country: 'United States' });

            expect(items[1].children).toBeUndefined();
            expect(items[1].parent).toBe(items[0]);

            expect(items[2].children).toBeUndefined();
            expect(items[2].parent).toBe(items[0]);

            expect(items[3].label).toBe('Argentina');
            expect(items[3].label).toBe('Argentina');

            expect(items[10].label).toBe('Colombia');
            expect(items[11].parent).toBe(items[10]);
        }));

        it('should group items with children array by group key', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="groupedAccounts"
                        groupBy="accounts"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            const items = fixture.componentInstance.select.itemsList.items;

            expect(items.length).toBe(14);
            expect(items[0].children).toBeDefined();
            expect(items[0].index).toBe(0);
            expect(items[0].disabled).toBeTruthy();
            expect(items[0].value).toEqual(jasmine.objectContaining({ country: 'United States' }));

            expect(items[1].children).toBeUndefined();
            expect(items[1].parent).toBe(items[0]);

            expect(items[2].children).toBeUndefined();
            expect(items[2].parent).toBe(items[0]);

            expect(items[3].value).toEqual(jasmine.objectContaining({ country: 'Argentina' }));

            expect(items[10].value).toEqual(jasmine.objectContaining({ country: 'Colombia' }));
            expect(items[11].parent).toBe(items[10]);
        }));

        it('should not group items without key', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            fixture.componentInstance.accounts.push(
                <any>{ name: 'Henry', email: 'henry@email.com', age: 10 },
                <any>{ name: 'Meg', email: 'meg@email.com', age: 7, country: null },
                <any>{ name: 'Meg', email: 'meg@email.com', age: 7, country: '' },
            );
            fixture.componentInstance.accounts = [...fixture.componentInstance.accounts];
            tickAndDetectChanges(fixture);

            const items: HcOption[] = fixture.componentInstance.select.itemsList.items;
            expect(items.length).toBe(18);
            expect(items[0].children).toBeTruthy();
            expect(items[0].parent).toBeNull();
            expect(items[14].children).toBeUndefined();
            expect(items[14].parent).toBeUndefined();
            expect(items[15].children).toBeUndefined();
            expect(items[15].parent).toBeUndefined();
            expect(items[16].children).toBeTruthy();
            expect(items[16].label).toBe('');
            expect(items[17].parent).toBeDefined();
        }));

        it('should group by group fn', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        bindLabel="name"
                        [groupBy]="groupByFn"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            const items = fixture.componentInstance.select.itemsList.items;

            expect(items.length).toBe(12);
            expect(items[0].children).toBeDefined();
            expect(items[0].value['name']).toBe('c1');
            expect(items[6].children).toBeDefined();
            expect(items[6].value['name']).toBe('c2');
        }));

        it('should set group value using custom fn', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        bindLabel="name"
                        [groupBy]="groupByFn"
                        [groupValue]="groupValueFn"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            const items = fixture.componentInstance.select.itemsList.items;

            expect(items.length).toBe(12);
            expect(items[0].children).toBeDefined();
            expect(items[0].value['group']).toBe('c1');
            expect(items[6].children).toBeDefined();
            expect(items[6].value['group']).toBe('c2');
        }));

        it('should not mark optgroup item as marked', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindValue="name"
                        [(ngModel)]="selectedAccountName">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            const select = fixture.componentInstance.select;
            expect(select.itemsList.markedItem).toBeUndefined();
        }));

        it('should filter grouped items', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const select = fixture.componentInstance.select;
            select.filter('aDaM');

            const filteredItems = select.itemsList.filteredItems;
            expect(filteredItems.length).toBe(2);
            expect(filteredItems[0].children).toBeTruthy();
            expect(filteredItems[1].parent).toBe(filteredItems[0]);

            select.filter('not in list');
            expect(select.itemsList.filteredItems.length).toBe(0);
        }));

        it('should allow select optgroup items when [selectableGroup]="true"', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [selectableGroup]="true"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            selectOption(fixture, KeyCode.ArrowDown, 0);
            expect(fixture.componentInstance.selectedAccount).toBe('United States');

            selectOption(fixture, KeyCode.ArrowDown, 1);
            expect(fixture.componentInstance.selectedAccount).toBe('adam@email.com');
        }));

        it('should select group by default when [selectableGroup]="true"', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [selectableGroup]="true"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);


            const select = fixture.componentInstance.select;
            tickAndDetectChanges(fixture);
            select.filter('adam');
            tick(200);

            selectOption(fixture, KeyCode.ArrowDown, 0);
            expect(fixture.componentInstance.selectedAccount).toBe('United States');
        }));
        it('Should have class ng-select', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

                fixture.detectChanges();
                const element = fixture.elementRef.nativeElement;
                const elClasses: DOMTokenList = element.children[0].classList;
                const hasClass = elClasses.contains('ng-select')


            expect(hasClass).toBe(true)
        }));
        it('Should have class ng-select and test', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [(ngModel)]="selectedAccount"
                        [class]="'test'">
                </hc-pick-pane>`);

                fixture.detectChanges();
                const element = fixture.elementRef.nativeElement;
                const elClasses: DOMTokenList = element.children[0].classList;
                const hasClass = elClasses.contains('ng-select') && elClasses.contains('test');


            expect(hasClass).toBe(true);
        }));
    });

    describe('Input method composition', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let select: HcPickPaneComponent;
        const originValue = '';
        const imeInputValue = 'zhangsan';

        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames"
                    [addCustomItem]="true"
                    placeholder="select value"
                    [searchWhileComposing]="false"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);
            select = fixture.componentInstance.select;
        });

        describe('composition start', () => {
            it('should not update search term', fakeAsync(() => {
                select.filter(originValue);
                tickAndDetectChanges(fixture);
                select.onCompositionStart();
                tickAndDetectChanges(fixture);
                select.filter(imeInputValue);

                expect(select.searchTerm).toBe(originValue);
            }));
        });

        describe('composition end', () => {
            it('should update search term', fakeAsync(() => {
                select.filter(originValue);
                tickAndDetectChanges(fixture);
                select.onCompositionEnd(imeInputValue);
                tickAndDetectChanges(fixture);

                expect(select.searchTerm).toBe(imeInputValue);
            }));

            it('should update search term when searchWhileComposing', fakeAsync(() => {
                select.searchWhileComposing = true;
                select.onCompositionStart();
                select.onCompositionEnd(imeInputValue);
                select.filter('new term');

                expect(select.searchTerm).toBe('new term');
            }));
        });
    });
});


function createTestingModule<T>(cmp: Type<T>, template: string, customNgSelectConfig: NgSelectConfig | null = null): ComponentFixture<T> {

    TestBed.configureTestingModule({
        imports: [FormsModule, HcPicklist2Module],
        declarations: [cmp],
        providers: [
            { provide: ErrorHandler, useClass: TestsErrorHandler },
            { provide: NgZone, useFactory: () => new MockNgZone() },
            { provide: ConsoleService, useFactory: () => new MockConsole() }
        ]
    })
        .overrideComponent(cmp, {
            set: {
                template: template
            }
        });

    if (customNgSelectConfig) {
        TestBed.overrideProvider(NgSelectConfig, { useValue: customNgSelectConfig });
    }

    TestBed.compileComponents();

    const fixture = TestBed.createComponent(cmp);
    fixture.detectChanges();
    return fixture;
}

function createEvent(target = {}) {
    return {
        preventDefault: () => {
        },
        target: {
            className: '',
            tagName: '',
            classList: {
                contains: () => {
                }
            },
            ...target
        }
    }
}

@Component({
    template: ``
})
class NgSelectTestCmp {
    @ViewChild(HcPickPaneComponent, { static: false }) select: HcPickPaneComponent;
    multiple = false;
    label = 'Yes';
    clearOnBackspace = false;
    disabled = false;
    readonly = false;
    dropdownPosition = 'bottom';
    visible = true;
    searchTermMinLength = 0;
    filter = new Subject<string>();
    searchFn: (term: string, item: any) => boolean = null;
    selectOnTab = true;
    hideSelected = false;

    citiesLoading = false;
    selectedCityId: number;
    selectedCityIds: number[];
    selectedCity: { id: number; name: string };
    selectedCities: { id: number; name: string }[];
    cities: any[] = [
        { id: 1, name: 'Vilnius' },
        { id: 2, name: 'Kaunas' },
        { id: 3, name: 'Pabrade' },
    ];
    citiesNames = this.cities.map(x => x.name);

    selectedCountry: any;
    countries = [
        { id: 1, description: { name: 'Lithuania', id: 'a' } },
        { id: 2, description: { name: 'USA', id: 'b' } },
        { id: 3, description: { name: 'Australia', id: 'c' } }
    ];

    customItemFunc(term: string) {
        return { id: term, name: term, custom: true }
    }

    customItemFuncPromise(term: string) {
        return Promise.resolve({
            id: 5, name: term, valid: true
        });
    }

    compareWith(a, b) {
        return a.name === b.name && a.district === b.district
    }

    toggleVisible() {
        this.visible = !this.visible;
    }

    onChange(_: any) {
    }

    onFocus(_: Event) {
    }

    onBlur(_: Event) {
    }

    onOpen() {
    }

    onClose() {
    }

    onAdd(_: Event) {
    }

    onRemove(_: Event) {
    }

    onClear() {
    }

    onSearch(_: any) {
    }

    onScroll() {
    }

    onScrollToEnd() {
    }
}

@Component({
    template: ``,
    encapsulation: ViewEncapsulation.ShadowDom,
})
class EncapsulatedTestCmp extends NgSelectTestCmp {
    @ViewChild(HcPickPaneComponent, { static: true }) select: HcPickPaneComponent;
}

@Component({
    template: ``,
})
class NgSelectGroupingTestCmp {
    @ViewChild(HcPickPaneComponent, { static: true }) select: HcPickPaneComponent;
    selectedAccountName = 'Adam';
    selectedAccount = null;
    groupByFn = (item) => item.child.name;
    groupValueFn = (key, _) => ({ group: key });
    accounts = [
        { name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States', child: { name: 'c1' } },
        { name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States', child: { name: 'c1' } },
        { name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina', child: { name: 'c1' } },
        { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina', child: { name: 'c1' } },
        { name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador', child: { name: 'c1' } },
        { name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador', child: { name: 'c2' } },
        { name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador', child: { name: 'c2' } },
        { name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia', child: { name: 'c2' } },
        { name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia', child: { name: 'c2' } },
        { name: 'Nicolás', email: 'nicole@email.com', age: 43, country: 'Colombia', child: { name: 'c2' } }
    ];

    groupedAccounts = [
        {
            country: 'United States',
            accounts: [
                { name: 'Adam', email: 'adam@email.com', age: 12 },
                { name: 'Samantha', email: 'samantha@email.com', age: 30 },
            ]
        },
        {
            country: 'Argentina',
            accounts: [
                { name: 'Amalie', email: 'amalie@email.com', age: 12 },
                { name: 'Estefanía', email: 'estefania@email.com', age: 21 },
            ]
        },
        {
            country: 'Ecuador',
            accounts: [
                { name: 'Adrian', email: 'adrian@email.com', age: 21 },
                { name: 'Wladimir', email: 'wladimir@email.com', age: 30 },
                { name: 'Natasha', email: 'natasha@email.com', age: 54 },
            ]
        },
        {
            country: 'Colombia',
            accounts: [
                { name: 'Nicole', email: 'nicole@email.com', age: 43 },
                { name: 'Michael', email: 'michael@email.com', age: 15 },
                { name: 'Nicolás', email: 'nicole@email.com', age: 43 }
            ]
        }
    ]
}
