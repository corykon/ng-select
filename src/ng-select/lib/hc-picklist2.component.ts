import {
    Component,
    OnDestroy,
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
    ContentChildren,
    QueryList,
    Attribute
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, startWith } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';

import {
    HcPickOptionTemplateDirective,
    HcPaneListHeaderTemplateDirective,
    HcPaneListFooterTemplateDirective,
    HcPickOptgroupTemplateDirective,
    HcPickTagTemplateDirective,
    HcPaneHeaderRightTemplateDirective,
    HcPaneHeaderLeftTemplateDirective
} from './hc-pick-templates.directive';

import { isDefined, isFunction, isObject } from './value-utils';
import { HcPickOptionComponent } from './hc-pick-option.component';
import { ConsoleService } from './console.service';
import { HcPickPaneComponent } from './hc-pick-pane.component';
import { HcPicklist2Service } from './hc-picklist2.service';
import { SortFn, GroupValueFn, CompareWithFn, AddTagFn } from './hc-pick.types';

@Component({
    selector: 'hc-picklist2',
    templateUrl: './hc-picklist2.component.html',
    styleUrls: ['./hc-picklist2.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => HcPicklist2Component),
        multi: true
    }, HcPicklist2Service],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HcPicklist2Component implements OnDestroy, AfterViewInit, ControlValueAccessor {
    @Input() bindLabel: string;
    @Input() bindValue: string;
    @Input() addTagText = 'Add custom option.'; // todo: keep this or no?
    @Input() addTag: boolean | AddTagFn = false; // todo: keep this or no?
    @Input() maxSelectedItems: number;
    @Input() groupBy: string | Function;
    @Input() groupValue: GroupValueFn;
    @Input() bufferAmount = 4;
    @Input() virtualScroll: boolean;
    @Input() selectableGroup = false;
    @Input() selectableGroupAsModel = true;
    @Input() searchFn = null;
    @Input() trackByFn = null;
    @Input() sortFn: SortFn = null;
    @Input() inputAttrs: { [key: string]: string } = {};
    @Input() readonly = false;
    @Input() searchWhileComposing = true;
    @Input() minTermLength = 0;
    @Input() height = '400px';

    // todo: inputs that should be specific per pane (maybe)
    @Input() placeholder = 'Search';
    @Input() notFoundText = 'No options to show.';
    @Input() loadingText = 'Loading'
    @Input() loading = false;
    @Input() typeahead: Subject<string>;
    @Input() searchable = true;

    @Input() get items() { return this._items };
    set items(value: any[]) {
        this._itemsAreUsed = true;
        this._items = value;
    };

    @Input() get compareWith() { return this._compareWith; }
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
    @ContentChild(HcPickOptionTemplateDirective, { read: TemplateRef }) optionTemplate: TemplateRef<any>;
    @ContentChild(HcPickOptgroupTemplateDirective, { read: TemplateRef }) optgroupTemplate: TemplateRef<any>;
    @ContentChild(HcPaneListHeaderTemplateDirective, { read: TemplateRef }) headerTemplate: TemplateRef<any>;
    @ContentChild(HcPaneListFooterTemplateDirective, { read: TemplateRef }) footerTemplate: TemplateRef<any>;
    @ContentChild(HcPickTagTemplateDirective, { read: TemplateRef }) tagTemplate: TemplateRef<any>;
    @ContentChild(HcPaneHeaderRightTemplateDirective, { read: TemplateRef }) paneHeaderRightTemplate: TemplateRef<any>;
    @ContentChild(HcPaneHeaderLeftTemplateDirective, { read: TemplateRef }) paneHeaderLeftTemplate: TemplateRef<any>;

    @ContentChildren(HcPickOptionComponent, { descendants: true }) ngOptions: QueryList<HcPickOptionComponent>;

    @ViewChild('available', { static: true }) availablePane: HcPickPaneComponent;
    @ViewChild('selected', { static: true }) selectedPane: HcPickPaneComponent;

    @HostBinding('class.hc-picklist2-disabled') get disabled() { return this.readonly || this._disabled };

    element: HTMLElement;
    private _items = [];
    private _itemsAreUsed: boolean;
    private _defaultLabel = 'label';
    private _disabled: boolean;
    private _compareWith: CompareWithFn;
    private _onChange = (_: any) => { };
    private _onTouched = () => { };
    private readonly _destroy$ = new Subject<void>();

    constructor(
        _elementRef: ElementRef<HTMLElement>,
        private picklistService: HcPicklist2Service,
        private _cd: ChangeDetectorRef,
        private _console: ConsoleService,
        @Attribute('autofocus') private autoFocus: any) {
            this.element = _elementRef.nativeElement;
    }

    ngAfterViewInit() {
        this.picklistService.reset(this.availablePane, this.selectedPane);
        if (!this._itemsAreUsed) {
            this._setItemsFromNgOptions();
        }

        if (isDefined(this.autoFocus)) {
            this.availablePane.focus();
        }
        this.detectChanges();
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
    move(source: HcPickPaneComponent, destination: HcPickPaneComponent) {
        source.selectedItems.slice().forEach(i => {
            source.itemsList.removeOption(i);
            destination.itemsList.addOption(i);
        });
        source.itemsList.reIndex();
        this.availablePane.itemsList.clearSelected();
        this.selectedPane.itemsList.clearSelected();
        this.refreshPanes();
        this._updateNgModel();
        this._onTouched();
    }

    /** Refreshes the dimensions of the virtual scroll container and the items displayed within. Helpful when using virtual scrolling and
     * the window changes such that the picklist was resized.
     */
    public refreshScrollArea() {
        this.availablePane.refreshScrollArea();
        this.selectedPane.refreshScrollArea();
    }

    detectChanges() {
        if (!(<any>this._cd).destroyed) {
            this._cd.detectChanges();
        }
        this.availablePane.detectChanges();
        this.selectedPane.detectChanges();
    }

    

    /** Convert <hc-pick-option> components into HcOptions */
    private _setItemsFromNgOptions() {
        const mapNgOptions = (options: QueryList<HcPickOptionComponent>) => {
            const items = options.map(option => ({
                $ngOptionValue: option.value,
                $ngOptionLabel: option.elementRef.nativeElement.innerHTML,
                disabled: option.disabled
            }));
            this.availablePane.itemsList.setItems(items);
            if (this.hasValue) {
                // todo: test this code path
                this.picklistService.mapIncomingOptionsToSelected(this.bindValue);
            }
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
                this.detectChanges();
            });
    }

    /** Apply value passed in from ngModel as the current selection in the component */
    private _handleWriteValue(ngModel: any[]) {
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
                this.availablePane.itemsList.reIndex();
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

        ngModel.forEach(item => select(item));
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

        if (!Array.isArray(value)) {
            this._console.warn('Value must be an ngModel should be array.');
            return false;
        }
        return value.every(item => this.validateBinding(item));
    }

    private validateBinding = (item: any): boolean => {
        if (!isDefined(this.compareWith) && isObject(item) && this.bindValue) {
            this._console.warn(
                `Setting object(${JSON.stringify(item)}) as your model with bindValue is not allowed unless [compareWith] is used.`
            );
            return false;
        }
        return true;
    };

    // todo: more testing around this
    // test case:
    //        [items]="accounts"
    //        bindLabel="name"
    //        bindValue="name"
    //        [groupBy]="groupByFn"
    //        [selectableGroup]="true"
    //        [multiple]="true"
    //        [(ngModel)]="selectedAccounts"
    private _updateNgModel() {
        const model = [];
        let selectedItems = this.selectedPane.itemsList.items;

        if (!this.selectableGroup || !this.selectableGroupAsModel) {
            selectedItems = selectedItems.filter(item => !item.children);
        }

        const hasGroupByFn = isFunction(this.groupBy);
        for (const item of selectedItems) {
            if (this.bindValue) {
                let value = null;
                if (item.children) {
                    const groupKey = this.groupValue ? this.bindValue : (hasGroupByFn ? this.bindLabel : <string>this.groupBy);
                    value = groupKey ? item.value[groupKey] : item.value;
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
