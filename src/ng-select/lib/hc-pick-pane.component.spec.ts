import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, ErrorHandler, NgZone, Type, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getPickPaneElement, selectOption, TestsErrorHandler, tickAndDetectChanges, triggerKeyDownEvent } from '../testing/helpers';
import { KeyCode, HcOption } from './hc-pick.types';
import { MockNgZone } from '../testing/mocks';
import { HcPickPaneComponent } from '@ng-select/ng-select';
import { HcPicklist2Module } from './hc-picklist2.module';
import { Subject } from 'rxjs';
import { HcPicklist2Service } from './hc-picklist2.service';

describe('HcPickPaneComponent', () => {
    describe('Data source and bindings', () => {
        let select: HcPickPaneComponent;
        it('should set items from primitive numbers array', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="[0, 30, 60, 90, 120, 180, 240]">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const itemsList = fixture.componentInstance.pickPane.itemsList;
            expect(itemsList.items.length).toBe(8); // 7 given items, plus default group item
            expect(itemsList.items[1]).toEqual(jasmine.objectContaining({
                label: '0',
                value: 0
            }));
        }));

        it('should map label correctly', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name"> </hc-pick-pane>`);

            fixture.componentInstance.cities = [{ label: 'Vilnius city', name: 'Vilnius' }];
            tickAndDetectChanges(fixture);
            select = fixture.componentInstance.pickPane;

            expect(select.itemsList.items[0].label).toBe('Vilnius');
        }));
    });

    describe('Scrollable List', () => {
        it('should set and render items in scrollable list', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name">
                </hc-pick-pane>`);

            const pickPane = fixture.componentInstance.pickPane;

            expect(pickPane.dropdownPanel.items.length).toBe(4); // 3 given items, plus default group item
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
                `<hc-pick-pane [items]="cities" bindLabel="name" [virtualScroll]="false">
                </hc-pick-pane>`);

            const panelItems = document.querySelector('.hc-pick-pane-list-items');
            const firstChild = <HTMLScriptElement>panelItems.firstChild;

            expect(firstChild.offsetHeight).toBe(0);
        }));

        it('should have div #padding with height other than 0 in dropdown panel when virtual scroll is enabled', fakeAsync(() => {

            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name" [virtualScroll]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.detectChanges();

            expect(fixture.componentInstance.pickPane.dropdownPanel.items.length).toBe(4);
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
                `<hc-pick-pane [items]="cities" bindLabel="name" [virtualScroll]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            fixture.detectChanges();

            expect(fixture.componentInstance.pickPane.dropdownPanel.items.length).toBe(4);
            let options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(3);
            expect(options[0].innerText).toBe('Vilnius');
            expect(options[1].innerText).toBe('Kaunas');
            expect(options[2].innerText).toBe('Pabrade');

            fixture.componentInstance.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);
            fixture.detectChanges();
            options = fixture.debugElement.nativeElement.querySelectorAll('.hc-pick-option');
            expect(options.length).toBe(9);
            expect(options[0].innerText).toBe('a');
        }));


        it('should scroll to item and do not change scroll position when scrolled to visible item', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name">
                </hc-pick-pane>`);
            const cmp = fixture.componentInstance;
            const el: HTMLElement = fixture.debugElement.nativeElement;
            tickAndDetectChanges(fixture);

            cmp.cities = Array.from(Array(30).keys()).map((_, i) => ({ id: i, name: String.fromCharCode(97 + i) }));
            tickAndDetectChanges(fixture);

            cmp.pickPane.dropdownPanel.scrollTo(cmp.pickPane.itemsList.items[1]);
            tickAndDetectChanges(fixture);

            const panelItems = el.querySelector('.hc-pick-pane-list-items');
            expect(panelItems.scrollTop).toBe(0);
        }));
    });

    describe('Keyboard events in search box', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let pickPane: HcPickPaneComponent;

        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [loading]="citiesLoading">
                </hc-pick-pane>`);
            pickPane = fixture.componentInstance.pickPane;
        });

        describe('by default', () => {
            it('on arrow down, should mark first value', fakeAsync(() => {
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                pickPane.itemsList.unmark();
                expect(pickPane.itemsList.markedIndex).toEqual(-1);
                triggerKeyDownEvent(searchBox, KeyCode.ArrowDown);
                expect(pickPane.itemsList.markedIndex).toEqual(1);
            }));
            it('on enter keypress, should mark first value', fakeAsync(() => {
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                pickPane.itemsList.unmark();
                expect(pickPane.itemsList.markedIndex).toEqual(-1);
                triggerKeyDownEvent(searchBox, KeyCode.Enter);
                expect(pickPane.itemsList.markedIndex).toEqual(1);
            }));
            it('should move focus from search to listPanel', fakeAsync(() => {
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                const listPanel = fixture.debugElement.query(By.css('.hc-pick-pane-list'));
                searchBox.nativeElement.focus();
                
                expect(searchBox.nativeElement === document.activeElement).toBeTruthy();
                expect(listPanel.nativeElement === document.activeElement).toBeFalsy();
                triggerKeyDownEvent(searchBox, KeyCode.Enter);
                expect(searchBox.nativeElement === document.activeElement).toBeFalsy();
                expect(listPanel.nativeElement === document.activeElement).toBeTruthy();
            }));
        });

        describe('when custom option currently is marked', () => {
            it('on arrow down keypress should add a new custom item', fakeAsync(() => {
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                spyOnProperty(pickPane, 'addCustomOptionIsMarked').and.returnValue(true);
                pickPane.searchTerm = 'test custom';
                triggerKeyDownEvent(searchBox, KeyCode.ArrowDown);
                expect(pickPane.itemsList.markedIndex).toEqual(1);
                expect(pickPane.itemsList.markedItem.label).toEqual('test custom');
            }));
            it('on enter keypress should add a new custom item', fakeAsync(() => {
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                spyOnProperty(pickPane, 'addCustomOptionIsMarked').and.returnValue(true);
                pickPane.searchTerm = 'test custom2';
                triggerKeyDownEvent(searchBox, KeyCode.Enter);
                expect(pickPane.itemsList.markedIndex).toEqual(1);
                expect(pickPane.itemsList.markedItem.label).toEqual('test custom2');
            }));
        });
    });

    describe('Keyboard events in list', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let pickPane: HcPickPaneComponent;
        let listPanel: DebugElement;

        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name" [loading]="citiesLoading">
                </hc-pick-pane>`);
            pickPane = fixture.componentInstance.pickPane;
            listPanel = fixture.debugElement.query(By.css('.hc-pick-pane-list'));
        });

        describe('arrows', () => {
            it('should mark next value on arrow down', fakeAsync(() => {
                expect(pickPane.itemsList.markedIndex).toEqual(1);
                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown);
                expect(pickPane.itemsList.markedIndex).toEqual(2);
            }));

            it('should stop marked loop if all items disabled', fakeAsync(() => {
                fixture.componentInstance.cities[0].disabled = true;
                fixture.componentInstance.cities = [...fixture.componentInstance.cities];
                tickAndDetectChanges(fixture);
                pickPane.filter('vil');
                tickAndDetectChanges(fixture);

                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown);
                expect(pickPane.itemsList.markedItem).toBeUndefined();
            }));

            it('should mark first value on arrow down when current marked item is last', fakeAsync(() => {
                pickPane.itemsList.markItem(pickPane.itemsList.filteredItems[pickPane.itemsList.filteredItems.length - 1])
                expect(pickPane.itemsList.markedIndex).toEqual(3);
                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown);
                expect(pickPane.itemsList.markedIndex).toEqual(1);
            }));

            it('should skip disabled option and mark next one', fakeAsync(() => {
                fixture.componentInstance.cities[1].disabled = true;
                fixture.componentInstance.cities = [...fixture.componentInstance.cities];
                tickAndDetectChanges(fixture);

                expect(pickPane.itemsList.markedIndex).toEqual(1);
                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown);
                expect(pickPane.itemsList.markedIndex).toEqual(3);
            }));

            it('should mark previous value on arrow up', fakeAsync(() => {
                pickPane.itemsList.markItem(pickPane.itemsList.filteredItems[pickPane.itemsList.filteredItems.length - 1])
                expect(pickPane.itemsList.markedIndex).toEqual(3);
                triggerKeyDownEvent(listPanel, KeyCode.ArrowUp);
                expect(pickPane.itemsList.markedIndex).toEqual(2);
            }));

            it('should mark last value on arrow up', fakeAsync(() => {
                expect(pickPane.itemsList.markedIndex).toEqual(1);
                triggerKeyDownEvent(listPanel, KeyCode.ArrowUp);
                expect(pickPane.itemsList.markedIndex).toEqual(3);
            }));

            it('should select next and clear last selected value on arrow', fakeAsync(() => {
                pickPane.itemsList.select(pickPane.itemsList.filteredItems[1]);
                expect(pickPane.selectedItems[0].index).toBe(1);
                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown);
                expect(pickPane.selectedItems.length).toEqual(1);
                expect(pickPane.selectedItems[0].index).toBe(2);
            }));

            it('should retain previous selection and select next value on arrow with shift press', fakeAsync(() => {
                pickPane.itemsList.select(pickPane.itemsList.filteredItems[1]);
                expect(pickPane.selectedItems[0].index).toBe(1);
                const pressedShift = true;
                const pressedCtrl = false;
                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown, '', pressedShift, pressedCtrl);
                expect(pickPane.selectedItems.length).toEqual(2);
                expect(pickPane.selectedItems[0].index).toBe(1);
                expect(pickPane.selectedItems[1].index).toBe(2);
            }));

            it('should retain previous selection and select next value on arrow with ctrl press', fakeAsync(() => {
                pickPane.itemsList.select(pickPane.itemsList.filteredItems[1]);
                expect(pickPane.selectedItems[0].index).toBe(1);
                const pressedShift = false;
                const pressedCtrl = true;
                triggerKeyDownEvent(listPanel, KeyCode.ArrowDown, '', pressedShift, pressedCtrl);
                expect(pickPane.selectedItems.length).toEqual(2);
                expect(pickPane.selectedItems[0].index).toBe(1);
                expect(pickPane.selectedItems[1].index).toBe(2);
            }));
        });

        describe('enter', () => {
            it('should trigger move event', fakeAsync(() => {
                const emitSpy = spyOn(pickPane.triggerMoveEvent, 'emit');
                triggerKeyDownEvent(listPanel, KeyCode.Enter);
                expect(emitSpy).toHaveBeenCalled();
            }));
        });

        describe('escape', () => {
            it('should clear selection', fakeAsync(() => {
                pickPane.itemsList.select(pickPane.itemsList.filteredItems[1]);
                expect(pickPane.itemsList.selectedItems.length).toBe(1);
                triggerKeyDownEvent(listPanel, KeyCode.Esc);
                expect(pickPane.itemsList.selectedItems.length).toBe(0);
            }));
            it('should blur panel', fakeAsync(() => {
                listPanel.nativeElement.focus();
                expect(listPanel.nativeElement === document.activeElement).toBeTruthy();
                triggerKeyDownEvent(listPanel, KeyCode.Esc);
                expect(listPanel.nativeElement === document.activeElement).toBeFalsy();
            }));
        });
    });

    describe('Selects multiple items', () => {
        let fixture: ComponentFixture<NgSelectTestCmp>;
        let pickPane: HcPickPaneComponent;
        beforeEach(() => {
            fixture = createTestingModule(
                NgSelectTestCmp, `<hc-pick-pane [items]="cities" bindLabel="name" placeholder="select value"></hc-pick-pane>`);
            pickPane = fixture.componentInstance.pickPane;
        });

        it('should select several items', fakeAsync(() => {
            pickPane.itemsList.select(pickPane.itemsList.filteredItems[1]);
            pickPane.itemsList.select(pickPane.itemsList.filteredItems[2]);
            pickPane.itemsList.select(pickPane.itemsList.filteredItems[3]);
            tickAndDetectChanges(fixture);
            expect(pickPane.selectedItems.length).toBe(3);
        }));
    });

    describe('Custom Options', () => {
        it('should select default custom item', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name" [addCustomItem]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const pickPane = fixture.componentInstance.pickPane;
            pickPane.filter('new custom item');
            tickAndDetectChanges(fixture);
            const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
            spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
            pickPane.itemsList.unmark();
            triggerKeyDownEvent(searchBox, KeyCode.Enter);
            expect(pickPane.itemsList.selectedItems[0].label).toBe('new custom item');
            expect((pickPane.itemsList.selectedItems[0].value as any).name).toBe('new custom item');
        }));

        it('should add custom item as string', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames" [addCustomItem]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const pickPane = fixture.componentInstance.pickPane;
            pickPane.filter('Copenhagen');
            tickAndDetectChanges(fixture);
            const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
            spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
            pickPane.itemsList.unmark();
            triggerKeyDownEvent(searchBox, KeyCode.Enter);
            expect(pickPane.itemsList.selectedItems[0].value).toBe(<any>'Copenhagen');
        }));

        it('should add custom item as string when there are no items', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="[]" [addCustomItem]="true">
                </hc-pick-pane>`);

                tickAndDetectChanges(fixture);
                const pickPane = fixture.componentInstance.pickPane;
                pickPane.filter('Copenhagen');
                tickAndDetectChanges(fixture);
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
                pickPane.itemsList.unmark();
                triggerKeyDownEvent(searchBox, KeyCode.Enter);
                expect(pickPane.itemsList.selectedItems[0].value).toBe(<any>'Copenhagen');
        }));

        it('should add custom item as string when down arrow pressed', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="citiesNames" [addCustomItem]="true">
                </hc-pick-pane>`);

                tickAndDetectChanges(fixture);
                const pickPane = fixture.componentInstance.pickPane;
                pickPane.filter('Copenhagen');
                tickAndDetectChanges(fixture);
                const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
                spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
                pickPane.itemsList.unmark();
                triggerKeyDownEvent(searchBox, KeyCode.ArrowDown);
                expect(pickPane.itemsList.selectedItems[0].value).toBe(<any>'Copenhagen');
        }));

        it('can select custom item even if there are filtered items that matches search term', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name" [addCustomItem]="true">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const pickPane = fixture.componentInstance.pickPane;
            pickPane.filter('Vil');
            tickAndDetectChanges(fixture);
            const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
            spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
            triggerKeyDownEvent(searchBox, KeyCode.ArrowDown);
            const listPanel = fixture.debugElement.query(By.css('.hc-pick-pane-list'));
            triggerKeyDownEvent(listPanel, KeyCode.ArrowDown);
            triggerKeyDownEvent(listPanel, KeyCode.Enter);
            expect((pickPane.itemsList.selectedItems[0].value as any).name).toBe('Vil');
        }));

        it('should select custom item using given fuction', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name" [addCustomItem]="customItemFunc">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const pickPane = fixture.componentInstance.pickPane;
            pickPane.filter('custom item');
            tickAndDetectChanges(fixture);
            const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
            spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
            triggerKeyDownEvent(searchBox, KeyCode.Enter);
            expect(pickPane.itemsList.selectedItems[0].value).toEqual(jasmine.objectContaining({
                id: 'custom item', name: 'custom item', custom: true
            }));
        }));

        it('should select custom item with given promise-based function', fakeAsync(() => {
            let fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities" bindLabel="name" [addCustomItem]="customItemFuncPromise">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            const pickPane = fixture.componentInstance.pickPane;
            pickPane.filter('server side custom item');
            tickAndDetectChanges(fixture);
            const searchBox = fixture.debugElement.query(By.css('.hc-pick-search-input'));
            spyOnProperty(pickPane, '_companionPane').and.returnValue(pickPane); // faking "companion pane"
            triggerKeyDownEvent(searchBox, KeyCode.Enter);
            tick();
            expect(pickPane.itemsList.selectedItems[0].value).toEqual(jasmine.objectContaining({
                id: 5, name: 'server side custom item', valid: true
            }));
        }));

        describe('show add custom item', () => {
            let pickPane: HcPickPaneComponent;
            let companionPickPane: HcPickPaneComponent;
            let fixture: ComponentFixture<NgSelectTestCmp>;
            beforeEach(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                        bindLabel="name"
                        [addCustomItem]="true"
                        placeholder="select value">
                    </hc-pick-pane>
                    <hc-pick-pane #companionPane [items]="cities"
                        bindLabel="name"
                        [addCustomItem]="true"
                        placeholder="select value">
                    </hc-pick-pane>`
                    );
                pickPane = fixture.componentInstance.pickPane;
                companionPickPane = fixture.componentInstance.companionPickPane
            });

            it('should be false when there is no search term', () => {
                pickPane.searchTerm = null;
                expect(pickPane.showAddCustomOption).toBeFalsy();
            });

            it('should be false when term is too short', () => {
                pickPane.searchTerm = 'vi';
                pickPane.externalSearchTermMinLength = 3;
                expect(pickPane.showAddCustomOption).toBeFalsy();
            });

            it('should be true when term does not exist among items of this pane or companion pane', () => {
                spyOnProperty(pickPane, '_companionPane').and.returnValue(companionPickPane); // faking "companion pane"
                pickPane.searchTerm = 'Vil';
                expect(pickPane.showAddCustomOption).toBeTruthy();
            });

            it('should be false when term exists among items', () => {
                spyOnProperty(pickPane, '_companionPane').and.returnValue(companionPickPane); // faking "companion pane"
                pickPane.searchTerm = 'Vilnius';
                expect(pickPane.showAddCustomOption).toBeFalsy();
            });

            it('should be false when term exists among items of companionPane', () => {
                companionPickPane.itemsList.addNewOption('Vilnius in Companion Pane')
                spyOnProperty(pickPane, '_companionPane').and.returnValue(companionPickPane); // faking "companion pane"
                pickPane.searchTerm = 'Vilnius in Companion Pane';
                expect(pickPane.showAddCustomOption).toBeFalsy();
            });

            it('should be false when there is search term with only empty space', () => {
                pickPane.searchTerm = '   ';
                expect(pickPane.showAddCustomOption).toBeFalsy();
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
                const element = fixture.componentInstance.pickPane.element;
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
            fixture.componentInstance.pickPane.filter('vilnius');
            tick(200);

            const result = [jasmine.objectContaining({
                value: { id: 1, name: 'Vilnius' }
            })];
            expect(fixture.componentInstance.pickPane.itemsList.filteredItems).toEqual(result);
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
            const select = fixture.componentInstance.pickPane;
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

            const select = fixture.componentInstance.pickPane;
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            triggerKeyDownEvent(getPickPaneElement(fixture), 97, 'v');
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
            fixture.componentInstance.pickPane.filter('pab');
            tick(200);

            const result = jasmine.objectContaining({
                value: fixture.componentInstance.cities[2]
            });
            expect(fixture.componentInstance.pickPane.itemsList.markedItem).toEqual(result);
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.pickPane.selectedItems).toEqual([result]);
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
            fixture.componentInstance.pickPane.filter('pab');
            tick();

            const result = jasmine.objectContaining({
                value: fixture.componentInstance.cities[2]
            });
            expect(fixture.componentInstance.pickPane.itemsList.markedItem).toEqual(result);
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Enter);
            expect(fixture.componentInstance.pickPane.selectedItems).toEqual([result]);
        }));

        it('should clear filterValue on selected item', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);

            fixture.componentInstance.pickPane.searchTerm = 'Hey! Whats up!?';
            selectOption(fixture, KeyCode.ArrowDown, 1);
            tickAndDetectChanges(fixture);
            expect(fixture.componentInstance.pickPane.searchTerm).toBe(null);
        }));

        it('should not reset items when selecting option', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectTestCmp,
                `<hc-pick-pane [items]="cities"
                    bindLabel="name"
                    [(ngModel)]="selectedCity">
                </hc-pick-pane>`);

            const resetFilteredItemsSpy = spyOn(fixture.componentInstance.pickPane.itemsList, 'resetFilteredItems');
            tickAndDetectChanges(fixture);

            fixture.componentInstance.pickPane.searchTerm = null;
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

            fixture.componentInstance.pickPane.filter('vil');
            tickAndDetectChanges(fixture);

            let result = [jasmine.objectContaining({
                value: { id: 1, name: 'Vilnius' }
            })];
            expect(fixture.componentInstance.pickPane.itemsList.filteredItems).toEqual(result);

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
            expect(fixture.componentInstance.pickPane.itemsList.filteredItems).toEqual(result);
        }));

        describe('with externalSearchSubject', () => {
            let fixture: ComponentFixture<NgSelectTestCmp>;
            beforeEach(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                        [externalSearchSubject]="filter"
                        [externalSearchTermMinLength]="externalSearchTermMinLength"
                        bindLabel="name"
                        [hideSelected]="hideSelected"
                        [(ngModel)]="selectedCity">
                    </hc-pick-pane>`);
            });

            it('should not show selected city among options if it does not match search term', fakeAsync(() => {
                fixture.componentInstance.selectedCity = { id: 9, name: 'Copenhagen' };
                tickAndDetectChanges(fixture);

                fixture.componentInstance.filter.subscribe();
                fixture.componentInstance.pickPane.filter('new');
                fixture.componentInstance.cities = [{ id: 4, name: 'New York' }];
                tickAndDetectChanges(fixture);
                expect(fixture.componentInstance.pickPane.itemsList.filteredItems.length).toBe(1);
                expect(fixture.componentInstance.pickPane.itemsList.filteredItems[0]).toEqual(jasmine.objectContaining({
                    value: { id: 4, name: 'New York' }
                }))
            }));

            it('should push term to custom observable', fakeAsync(() => {
                fixture.componentInstance.filter.subscribe();
                const next = spyOn(fixture.componentInstance.filter, 'next');
                fixture.componentInstance.pickPane.filter('vilnius');
                tickAndDetectChanges(fixture);
                expect(next).toHaveBeenCalledWith('vilnius')
            }));

            it('should push term to custom observable', fakeAsync(() => {
                fixture.componentInstance.filter.subscribe();
                const next = spyOn(fixture.componentInstance.filter, 'next');
                fixture.componentInstance.pickPane.filter('');
                tickAndDetectChanges(fixture);
                expect(next).toHaveBeenCalledWith('')
            }));

            it('should not push term to custom observable if length is less than externalSearchTermMinLength', fakeAsync(() => {
                fixture.componentInstance.externalSearchTermMinLength = 2;
                tickAndDetectChanges(fixture);
                fixture.componentInstance.filter.subscribe();
                const next = spyOn(fixture.componentInstance.filter, 'next');
                fixture.componentInstance.pickPane.filter('v');
                tickAndDetectChanges(fixture);
                expect(next).not.toHaveBeenCalledWith('v')
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
            select = fixture.componentInstance.pickPane;
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

        it('should set aria-owns be set to paneId on open', fakeAsync(() => {
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);

            expect(input.getAttribute('aria-owns'))
                .toBe(select.paneId);
        }));

        it('should set aria-activedecendant equal to chosen item on open', fakeAsync(() => {
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            expect(input.getAttribute('aria-activedescendant'))
                .toBe(select.itemsList.markedItem.htmlId);
        }));

        it('should set aria-activedecendant equal to chosen item on arrow down', fakeAsync(() => {
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.ArrowDown);
            tickAndDetectChanges(fixture);
            expect(input.getAttribute('aria-activedescendant'))
                .toBe(select.itemsList.markedItem.htmlId);
        }));

        it('should set aria-activedecendant equal to chosen item on arrow up', fakeAsync(() => {
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.ArrowUp);
            tickAndDetectChanges(fixture);
            expect(input.getAttribute('aria-activedescendant'))
                .toBe(select.itemsList.markedItem.htmlId);
        }));

        it('should set aria-activedescendant absent on dropdown close', fakeAsync(() => {
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Enter);
            tickAndDetectChanges(fixture);
            expect(input.hasAttribute('aria-activedescendant'))
                .toBe(false);
        }));

        it('should set aria-owns  absent on dropdown close', fakeAsync(() => {
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space);
            tickAndDetectChanges(fixture);
            triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Enter);
            tickAndDetectChanges(fixture);
            expect(input.hasAttribute('aria-owns'))
                .toBe(false);
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
                            [(ngModel)]="selectedCities">
                    </hc-pick-pane>`);
                select = fixture.componentInstance.pickPane;

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

        describe('select none click', () => {
            beforeEach(fakeAsync(() => {
                fixture = createTestingModule(
                    NgSelectTestCmp,
                    `<hc-pick-pane [items]="cities"
                            bindLabel="name"
                            [(ngModel)]="selectedCities">
                    </hc-pick-pane>`);
                select = fixture.componentInstance.pickPane;

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

        it('should allow select optgroup items when [canSelectGroup]="true"', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [canSelectGroup]="true"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);

            tickAndDetectChanges(fixture);
            selectOption(fixture, KeyCode.ArrowDown, 0);
            expect(fixture.componentInstance.selectedAccount).toBe('United States');

            selectOption(fixture, KeyCode.ArrowDown, 1);
            expect(fixture.componentInstance.selectedAccount).toBe('adam@email.com');
        }));

        it('should select group by default when [canSelectGroup]="true"', fakeAsync(() => {
            const fixture = createTestingModule(
                NgSelectGroupingTestCmp,
                `<hc-pick-pane [items]="accounts"
                        groupBy="country"
                        bindLabel="name"
                        bindValue="email"
                        [canSelectGroup]="true"
                        [(ngModel)]="selectedAccount">
                </hc-pick-pane>`);


            const select = fixture.componentInstance.select;
            tickAndDetectChanges(fixture);
            select.filter('adam');
            tick(200);

            selectOption(fixture, KeyCode.ArrowDown, 0);
            expect(fixture.componentInstance.selectedAccount).toBe('United States');
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
            select = fixture.componentInstance.pickPane;
        });

        describe('composition start', () => {
            it('should not update search term', fakeAsync(() => {
                select.filter(originValue);
                tickAndDetectChanges(fixture);
                select._onCompositionStart();
                tickAndDetectChanges(fixture);
                select.filter(imeInputValue);

                expect(select.searchTerm).toBe(originValue);
            }));
        });

        describe('composition end', () => {
            it('should update search term', fakeAsync(() => {
                select.filter(originValue);
                tickAndDetectChanges(fixture);
                select._onCompositionEnd(imeInputValue);
                tickAndDetectChanges(fixture);

                expect(select.searchTerm).toBe(imeInputValue);
            }));

            it('should update search term when searchWhileComposing', fakeAsync(() => {
                select.searchWhileComposing = true;
                select._onCompositionStart();
                select._onCompositionEnd(imeInputValue);
                select.filter('new term');

                expect(select.searchTerm).toBe('new term');
            }));
        });
    });
});


function createTestingModule<T>(cmp: Type<T>, template: string): ComponentFixture<T> {

    TestBed.configureTestingModule({
        imports: [FormsModule, HcPicklist2Module],
        declarations: [cmp],
        providers: [
            HcPicklist2Service,
            { provide: ErrorHandler, useClass: TestsErrorHandler },
            { provide: NgZone, useFactory: () => new MockNgZone() }
        ]
    })
        .overrideComponent(cmp, {
            set: {
                template: template
            }
        });

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
    @ViewChild(HcPickPaneComponent, { static: false }) pickPane: HcPickPaneComponent;
    @ViewChild('companionPane', { static: false }) companionPickPane: HcPickPaneComponent;
    label = 'Yes';
    clearOnBackspace = false;
    disabled = false;
    readonly = false;
    dropdownPosition = 'bottom';
    visible = true;
    externalSearchTermMinLength = 0;
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
    @ViewChild(HcPickPaneComponent, { static: true }) pickPane: HcPickPaneComponent;
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
