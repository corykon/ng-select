import {
    Component,
    OnDestroy,
    OnChanges,
    AfterViewInit,
    forwardRef,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter,
    ContentChild,
    TemplateRef,
    ViewEncapsulation,
    HostBinding,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    SimpleChanges,
    ContentChildren,
    QueryList,
    InjectionToken
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, startWith } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';

import {
    NgOptionTemplateDirective,
    NgHeaderTemplateDirective,
    NgFooterTemplateDirective,
    NgOptgroupTemplateDirective,
    NgNotFoundTemplateDirective,
    NgTypeToSearchTemplateDirective,
    NgLoadingTextTemplateDirective,
    NgTagTemplateDirective
} from './ng-templates.directive';

import { isDefined, isFunction, isObject } from './value-utils';
import { SelectionModelFactory } from './selection-model';
import { NgDropdownPanelService } from './ng-dropdown-panel.service';
import { ItemsList } from './items-list';
import { HcOption } from './ng-select.types';
import { newId } from './id';
import { NgOptionComponent } from './ng-option.component';
import { ConsoleService } from './console.service';
import { NgSelectComponent } from './ng-select.component';

export const SELECTION_MODEL_FACTORY = new InjectionToken<SelectionModelFactory>('ng-select-selection-model');
export type AddTagFn = ((term: string) => any | Promise<any>);
export type CompareWithFn = (a: any, b: any) => boolean;
export type GroupValueFn = (key: string | object, children: any[]) => string | object;

@Component({
    selector: 'hc-picklist2',
    templateUrl: './hc-picklist2.component.html',
    styleUrls: ['./hc-picklist2.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => HcPicklist2Component),
        multi: true
    }, NgDropdownPanelService],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HcPicklist2Component implements OnDestroy, OnChanges, AfterViewInit, ControlValueAccessor {
    @Input() bindLabel: string;
    @Input() bindValue: string;
    @Input() markFirst = true;
    @Input() placeholder: string;
    @Input() notFoundText: string;
    @Input() typeToSearchText: string;
    @Input() addTagText: string;
    @Input() loadingText: string;
    @Input() clearAllText: string;
    @Input() loading = false;
    @Input() maxSelectedItems: number;
    @Input() groupBy: string | Function;
    @Input() groupValue: GroupValueFn;
    @Input() bufferAmount = 4;
    @Input() virtualScroll: boolean;
    @Input() selectableGroup = false;
    @Input() selectableGroupAsModel = true;
    @Input() searchFn = null;
    @Input() trackByFn = null;
    @Input() labelForId = null;
    @Input() inputAttrs: { [key: string]: string } = {};
    @Input() tabIndex: number;
    @Input() readonly = false;
    @Input() searchWhileComposing = true;
    @Input() minTermLength = 0;
    @Input() keyDownFn = (_: KeyboardEvent) => true;

    @Input() @HostBinding('class.ng-select-typeahead') typeahead: Subject<string>;
    @Input() @HostBinding('class.ng-select-taggable') addTag: boolean | AddTagFn = false;
    @Input() @HostBinding('class.ng-select-searchable') searchable = true;

    @Input()
    get items() { return this._items };

    set items(value: any[]) {
        this._itemsAreUsed = true;
        this._items = value;
    };

    @Input()
    get compareWith() { return this._compareWith; }

    set compareWith(fn: CompareWithFn) {
        if (!isFunction(fn)) {
            throw Error('`compareWith` must be a function.');
        }
        this._compareWith = fn;
    }

    @Output('change') changeEvent = new EventEmitter();
    @Output('add') addEvent = new EventEmitter();
    @Output('remove') removeEvent = new EventEmitter();

    // todo - duplicate for each pane?
    @Output('search') searchEvent = new EventEmitter<{ term: string, items: any[] }>();
    @Output('scroll') scroll = new EventEmitter<{ start: number; end: number }>();
    @Output('scrollToEnd') scrollToEnd = new EventEmitter();

    // custom templates
    @ContentChild(NgOptionTemplateDirective, { read: TemplateRef }) optionTemplate: TemplateRef<any>;
    @ContentChild(NgOptgroupTemplateDirective, { read: TemplateRef }) optgroupTemplate: TemplateRef<any>;
    @ContentChild(NgHeaderTemplateDirective, { read: TemplateRef }) headerTemplate: TemplateRef<any>;
    @ContentChild(NgFooterTemplateDirective, { read: TemplateRef }) footerTemplate: TemplateRef<any>;
    @ContentChild(NgNotFoundTemplateDirective, { read: TemplateRef }) notFoundTemplate: TemplateRef<any>;
    @ContentChild(NgTypeToSearchTemplateDirective, { read: TemplateRef }) typeToSearchTemplate: TemplateRef<any>;
    @ContentChild(NgLoadingTextTemplateDirective, { read: TemplateRef }) loadingTextTemplate: TemplateRef<any>;
    @ContentChild(NgTagTemplateDirective, { read: TemplateRef }) tagTemplate: TemplateRef<any>;

    @ContentChildren(NgOptionComponent, { descendants: true }) ngOptions: QueryList<NgOptionComponent>;

    @ViewChild('available', { static: true }) availablePane: NgSelectComponent;
    @ViewChild('selected', { static: true }) selectedPane: NgSelectComponent;

    @HostBinding('class.hc-picklist2-disabled') get disabled() { return this.readonly || this._disabled };

    itemsList: ItemsList;
    viewPortItems: HcOption[] = [];
    searchTerm: string = null;
    dropdownId = newId();
    element: HTMLElement;
    focused: boolean;
    escapeHTML = true;
    useDefaultClass = true;

    private _items = [];
    private _itemsAreUsed: boolean;
    private _defaultLabel = 'label';
    private _disabled: boolean;
    private _compareWith: CompareWithFn;
    private _onChange = (_: any) => { };
    private _onTouched = () => { };
    private readonly _destroy$ = new Subject<void>();

    constructor(_elementRef: ElementRef<HTMLElement>, private _cd: ChangeDetectorRef, private _console: ConsoleService) {
        this.element = _elementRef.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.items) {
            this.availablePane._setItems(changes.items.currentValue || []);
        }
    }

    ngAfterViewInit() {
        if (!this._itemsAreUsed) {
            this.escapeHTML = false;
            this._setItemsFromNgOptions();
        }
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    writeValue(value: any | any[]): void {
        this.selectedPane.itemsList.clearList();
        this._handleWriteValue(value);
        this._cd.markForCheck();
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState(state: boolean): void {
        this._disabled = state;
        this._cd.markForCheck();
    }

    get hasValue() {
        return this.selectedPane.itemsList.items.length > 0;
    }

    moveLeftToRight() {
        this.move(this.availablePane, this.selectedPane);
    }

    moveRightToLeft() {
        this.move(this.selectedPane, this.availablePane);
    }

    /** Move selected (highlighted) options from one pane to the other */
    move(source: NgSelectComponent, destination: NgSelectComponent) {
        source.selectedItems.slice().forEach(i => {
            source.itemsList.removeOption(i);
            destination.itemsList.addOption(i);
        });
        source.itemsList.reIndex();
        this.refreshPanes();
        this.availablePane.itemsList.clearSelected();
        this.selectedPane.itemsList.clearSelected();
        this._updateNgModel();
        this._onTouched();
    }

    detectChanges() {
        if (!(<any>this._cd).destroyed) {
            this._cd.detectChanges();
        }
        this.availablePane.detectChanges();
        this.selectedPane.detectChanges();
    }

    /** Convert <ng-option> components into HcOptions */
    private _setItemsFromNgOptions() {
        const mapNgOptions = (options: QueryList<NgOptionComponent>) => {
            const items = options.map(option => ({
                $ngOptionValue: option.value,
                $ngOptionLabel: option.elementRef.nativeElement.innerHTML,
                disabled: option.disabled
            }));
            this.availablePane.itemsList.setItems(items);
            if (this.hasValue) {
                // todo: what is the point of this? currently, couldn't be working
                this.selectedPane.itemsList.mapSelectedItems();
            }
            this.detectChanges();
        };

        const handleOptionChange = () => {
            const changedOrDestroyed = merge(this.ngOptions.changes, this._destroy$);
            merge(...this.ngOptions.map(option => option.stateChange$))
                .pipe(takeUntil(changedOrDestroyed))
                .subscribe(option => {
                    const item = this.availablePane.itemsList.findOption(option.value);
                    item.disabled = option.disabled;
                    item.label = option.label || item.label;
                    this.detectChanges();
                });
        };

        this.ngOptions.changes
            .pipe(startWith(this.ngOptions), takeUntil(this._destroy$))
            .subscribe(options => {
                this.bindLabel = this._defaultLabel;
                mapNgOptions(options);
                handleOptionChange();
            });
    }

    /** Apply value passed in from ngModel as the current selection in the component */
    private _handleWriteValue(ngModel: any | any[]) {
        if (!this._isValidWriteValue(ngModel)) {
            return
        }

        const select = (val: any) => {
            let alreadySelected = this.selectedPane.itemsList.findOption(val);
            if (alreadySelected) { return; }

            let item = this.availablePane.itemsList.findOption(val);
            if (item) {
                this.availablePane.itemsList.removeOption(item);
                this.selectedPane.itemsList.addOption(item);
            } else {
                const isValObject = isObject(val);
                const isPrimitive = !isValObject && !this.bindValue;
                if ((isValObject || isPrimitive)) {
                    this.selectedPane.itemsList.addOption(this.selectedPane.itemsList.mapItem(val, null));
                } else if (this.bindValue) {
                    // todo: test this code path
                    item = {
                        [this.bindLabel]: null,
                        [this.bindValue]: val
                    };
                    this.selectedPane.itemsList.addOption(this.selectedPane.itemsList.mapItem(item, null));
                }
            }
        };

        (<any[]>ngModel).forEach(item => select(item));
        this.refreshPanes();
    }

    private refreshPanes() {
        this.availablePane.filter();
        this.selectedPane.filter();
        this.detectChanges();
    }

    private _isValidWriteValue(value: any): boolean {
        if (!isDefined(value) || value === '' || Array.isArray(value) && value.length === 0) {
            return false;
        }

        const validateBinding = (item: any): boolean => {
            if (!isDefined(this.compareWith) && isObject(item) && this.bindValue) {
                this._console.warn(
                    `Setting object(${JSON.stringify(item)}) as your model with bindValue is not allowed unless [compareWith] is used.`
                );
                return false;
            }
            return true;
        };

        if (!Array.isArray(value)) {
            this._console.warn('Value must be an ngModel should be array.');
            return false;
        }
        return value.every(item => validateBinding(item));
    }

    private _updateNgModel() {
        const model = [];
        const selectedItems = this.selectedPane.itemsList.items;
        for (const item of selectedItems) {
            if (this.bindValue) {
                let value = null;
                if (item.children) {
                    const groupKey = this.groupValue ? this.bindValue : <string>this.groupBy;
                    value = item.value[groupKey || <string>this.groupBy];
                } else {
                    value = this.selectedPane.itemsList.resolveNested(item.value, this.bindValue);
                }
                model.push(value);
            } else {
                model.push(item.value);
            }
        }

        const selected = selectedItems.map(x => x.value);
        this._onChange(model);
        this.changeEvent.emit(selected);
        this._cd.markForCheck();
    }
}
