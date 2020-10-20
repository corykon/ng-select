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
    HostListener,
    HostBinding,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    Inject,
    ContentChildren,
    QueryList,
    InjectionToken,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { takeUntil, tap, debounceTime, map, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {
    NgOptionTemplateDirective,
    NgHeaderTemplateDirective,
    NgFooterTemplateDirective,
    NgOptgroupTemplateDirective,
    NgNotFoundTemplateDirective,
    NgLoadingTextTemplateDirective,
    NgTagTemplateDirective
} from './ng-templates.directive';

import { isDefined, isFunction, isPromise, isObject } from './value-utils';
import { ItemsList } from './items-list';
import { HcOption, KeyCode } from './ng-select.types';
import { newId } from './id';
import { NgDropdownPanelComponent } from './ng-dropdown-panel.component';
import { NgOptionComponent } from './ng-option.component';
import { SelectionModelFactory } from './selection-model';
import { NgDropdownPanelService } from './ng-dropdown-panel.service';
import { HcPicklist2Service } from './hc-picklist2.service';

export const SELECTION_MODEL_FACTORY = new InjectionToken<SelectionModelFactory>('ng-select-selection-model');
export type AddTagFn = ((term: string) => any | Promise<any>);
export type CompareWithFn = (a: any, b: any) => boolean;
export type GroupValueFn = (key: string | object, children: any[]) => string | object;

@Component({
    selector: 'ng-select',
    templateUrl: './ng-select.component.html',
    styleUrls: ['./ng-select.component.scss'],
    providers: [NgDropdownPanelService],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'role': 'listbox',
        '[class.ng-select]': 'useDefaultClass'
    }
})
export class NgSelectComponent implements OnDestroy, AfterViewInit, OnChanges {
    @Input() bindLabel: string;
    @Input() bindValue: string;
    @Input() placeholder: string;
    @Input() notFoundText: string;
    @Input() addTag: boolean | AddTagFn = false;
    @Input() addTagText: string;
    @Input() loadingText: string;
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
    @Input() inputAttrs: { [key: string]: string } = {};
    @Input() readonly = false;
    @Input() searchWhileComposing = true;
    @Input() minTermLength = 0;
    @Input() keyDownFn = (_: KeyboardEvent) => true;
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

    // output events - todo: likely wont need
    @Output('change') changeEvent = new EventEmitter();
    @Output('open') openEvent = new EventEmitter();
    @Output('close') closeEvent = new EventEmitter();
    @Output('add') addEvent = new EventEmitter();
    @Output('remove') removeEvent = new EventEmitter();
    
    // todo: probably need
    @Output('search') searchEvent = new EventEmitter<{ term: string, items: any[] }>();
    @Output('scroll') scroll = new EventEmitter<{ start: number; end: number }>();
    @Output('scrollToEnd') scrollToEnd = new EventEmitter();

    // custom templates - todo: these will probably need to be passed in via input or something
    @ContentChild(NgOptionTemplateDirective, { read: TemplateRef }) optionTemplate: TemplateRef<any>;
    @ContentChild(NgOptgroupTemplateDirective, { read: TemplateRef }) optgroupTemplate: TemplateRef<any>;
    @ContentChild(NgHeaderTemplateDirective, { read: TemplateRef }) headerTemplate: TemplateRef<any>;
    @ContentChild(NgFooterTemplateDirective, { read: TemplateRef }) footerTemplate: TemplateRef<any>;
    @ContentChild(NgNotFoundTemplateDirective, { read: TemplateRef }) notFoundTemplate: TemplateRef<any>;
    @ContentChild(NgLoadingTextTemplateDirective, { read: TemplateRef }) loadingTextTemplate: TemplateRef<any>;
    @ContentChild(NgTagTemplateDirective, { read: TemplateRef }) tagTemplate: TemplateRef<any>;

    @ViewChild(forwardRef(() => NgDropdownPanelComponent)) dropdownPanel: NgDropdownPanelComponent;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef<HTMLInputElement>;
    @ContentChildren(NgOptionComponent, { descendants: true }) ngOptions: QueryList<NgOptionComponent>;

    @HostBinding('class.ng-select-disabled') get disabled() { return this.readonly || this._disabled };

    @HostBinding('class.ng-select-filtered') get filtered() { return (!!this.searchTerm && this.searchable || this._isComposing) };

    itemsList: ItemsList;
    viewPortItems: HcOption[] = [];
    searchTerm: string = null;
    dropdownId = newId();
    element: HTMLElement;
    escapeHTML = true;
    useDefaultClass = true;

    private _itemsAreUsed: boolean;
    private _items = [];
    private _defaultLabel = 'label';
    private _primitive;
    private _disabled: boolean;
    private _pressedKeys: string[] = [];
    private _compareWith: CompareWithFn;
    private _isComposing = false;

    private readonly _destroy$ = new Subject<void>();
    private readonly _keyPress$ = new Subject<string>();

    clearItem = (item: any) => {
        const option = this.selectedItems.find(x => x.value === item);
        this.unselect(option);
    };

    constructor(
        @Inject(SELECTION_MODEL_FACTORY) newSelectionModel: SelectionModelFactory,
        _elementRef: ElementRef<HTMLElement>,
        private picklistService: HcPicklist2Service,
        private _cd: ChangeDetectorRef
    ) {
        this.itemsList = new ItemsList(this, newSelectionModel());
        this.element = _elementRef.nativeElement;
    }

    get selectedItems(): HcOption[] {
        return this.itemsList.selectedItems;
    }

    get selectedValues() {
        return this.selectedItems.map(x => x.value);
    }

    get hasSelectedItems() {
        return this.selectedItems.length > 0;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.items) {
            this._setItems(changes.items.currentValue || []);
            this.picklistService.mapIncomingOptionsToSelected(this.bindValue);
            this.filter();
            this.detectChanges();
        }
    }

    ngOnInit() {
        this._handleKeyPresses();
        this._setInputAttributes();
    }

    ngAfterViewInit() {
        if (!this._itemsAreUsed) {
            this.escapeHTML = false;
        }
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    @HostListener('keydown', ['$event'])
    handleKeyDown($event: KeyboardEvent) {
        const keyCode = KeyCode[$event.which];
        if (keyCode) {
            if (this.keyDownFn($event) === false) {
                return;
            }
            this.handleKeyCode($event)
        } else if ($event.key && $event.key.length === 1) {
            this._keyPress$.next($event.key.toLocaleLowerCase());
        }
    }

    handleKeyCode($event: KeyboardEvent) {
        switch ($event.which) {
            case KeyCode.ArrowDown:
                this._handleArrowDown($event);
                break;
            case KeyCode.ArrowUp:
                this._handleArrowUp($event);
                break;
            case KeyCode.Enter:
                this._handleArrowDown($event);
                break;
            case KeyCode.Tab:
                this._handleArrowDown($event);
                break;
            case KeyCode.Esc:
                this.blur();
                $event.preventDefault();
                break;
        }
    }

    // todo: remove this?
    handleMousedown($event: MouseEvent) {
        const target = $event.target as HTMLElement;
        if (target.tagName !== 'INPUT') {
            $event.preventDefault();
        }
    }

    deselectAll() {
        if (this.hasSelectedItems) {
            this.itemsList.clearSelected(true);
        }
        this._onSelectionChanged();
    }

    selectAll() {
        this.itemsList.selectAll();
        this._onSelectionChanged();
    }

    clearModel() {
        this.itemsList.clearSelected();
    }

    toggleItem(item: HcOption) {
        if (!item || item.disabled || this.disabled) {
            return;
        }

        if (item.selected) {
            this.unselect(item);
        } else {
            this.select(item);
        }

        this._onSelectionChanged();
    }

    select(item: HcOption) {
        if (item.selected) { return; }
        this.itemsList.select(item);
    }

    unselect(item: HcOption) {
        if (!item) { return; }
        this.itemsList.unselect(item);
    }

    focus() {
        this.searchInput.nativeElement.focus();
    }

    blur() {
        this.searchInput.nativeElement.blur();
    }

    selectTag() {
        let tag;
        if (isFunction(this.addTag)) {
            tag = (<AddTagFn>this.addTag)(this.searchTerm);
        } else {
            tag = this._primitive ? this.searchTerm : { [this.bindLabel]: this.searchTerm };
        }

        const handleTag = (item) => this._isTypeahead ? this.itemsList.mapItem(item, null) : this.itemsList.addNewOption(item);
        if (isPromise(tag)) {
            tag.then(item => this.select(handleTag(item))).catch(() => { });
        } else if (tag) {
            this.select(handleTag(tag));
        }
    }

    trackByOption = (_: number, item: HcOption) => {
        if (this.trackByFn) {
            return this.trackByFn(item.value);
        }

        return item;
    };

    get showAddTag() {
        if (!this._validTerm) {
            return false;
        }

        const term = this.searchTerm.toLowerCase().trim();
        return this.addTag &&
            (!this.itemsList.filteredItems.some(x => x.label.toLowerCase() === term) &&
                (!this.selectedItems.some(x => x.label.toLowerCase() === term))) &&
                !this.loading;
    }

    showNoItemsFound() {
        const empty = this.itemsList.filteredItems.length === 0;
        return ((empty && !this._isTypeahead && !this.loading) ||
            (empty && this._isTypeahead && this._validTerm && !this.loading)) &&
            !this.showAddTag;
    }

    onCompositionStart() {
        this._isComposing = true;
    }

    onCompositionEnd(term: string) {
        this._isComposing = false;
        if (this.searchWhileComposing) {
            return;
        }

        this.filter(term);
    }

    filter(term: string = this.searchTerm) {
        if (this._isComposing && !this.searchWhileComposing) {
            return;
        }

        this.searchTerm = term;
        if (this._isTypeahead && (this._validTerm || this.minTermLength === 0)) {
            this.typeahead.next(term);
        }

        if (!this._isTypeahead) {
            this.itemsList.filter(this.searchTerm);
            this.itemsList.markSelectedOrDefault();
        }

        this.searchEvent.emit({ term, items: this.itemsList.filteredItems.map(x => x.value) });
    }

    onItemHover(item: HcOption) {
        if (item.disabled) {
            return;
        }
        this.itemsList.markItem(item);
    }

    detectChanges() {
        if (!(<any>this._cd).destroyed) {
            this._cd.detectChanges();
        }
    }

    _setItems(items: any[]) {
        const firstItem = items[0];
        this.bindLabel = this.bindLabel || this._defaultLabel;
        this._primitive = isDefined(firstItem) ? !isObject(firstItem) : this._primitive || this.bindLabel === this._defaultLabel;
        this.itemsList.setItems(items);
        if (isDefined(this.searchTerm) && !this._isTypeahead) {
            this.itemsList.filter(this.searchTerm);
        }
        if (this._isTypeahead) {
            this.itemsList.markSelectedOrDefault();
        }
    }

    private _handleKeyPresses() {
        if (this.searchable) {
            return;
        }

        this._keyPress$
            .pipe(takeUntil(this._destroy$),
                tap(letter => this._pressedKeys.push(letter)),
                debounceTime(200),
                filter(() => this._pressedKeys.length > 0),
                map(() => this._pressedKeys.join('')))
            .subscribe(term => {
                const item = this.itemsList.findByLabel(term);
                if (item) {
                    this.itemsList.markItem(item);
                    this._cd.markForCheck();
                }
                this._pressedKeys = [];
            });
    }

    private _setInputAttributes() {
        const input = this.searchInput.nativeElement;
        const attributes = {
            type: 'text',
            autocorrect: 'off',
            autocapitalize: 'off',
            ...this.inputAttrs
        };

        for (const key of Object.keys(attributes)) {
            input.setAttribute(key, attributes[key]);
        }
    }

    private _clearSearch() {
        if (!this.searchTerm) { return; }
        this._changeSearch(null);
        this.itemsList.resetFilteredItems();
    }

    private _changeSearch(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (this._isTypeahead) {
            this.typeahead.next(searchTerm);
        }
    }

    private _scrollToMarked() {
        this.dropdownPanel.scrollTo(this.itemsList.markedItem);
    }

    private _scrollToTag() {
        this.dropdownPanel.scrollToTag();
    }

    private _onSelectionChanged() {
        this._cd.detectChanges();
    }

    private _handleArrowDown($event: KeyboardEvent) {
        if (this._nextItemIsTag(+1)) {
            this.itemsList.unmarkItem();
            this._scrollToTag();
        } else {
            this.itemsList.markNextItem();
            this._scrollToMarked();
        }
        $event.preventDefault();
    }

    private _handleArrowUp($event: KeyboardEvent) {
        if (this._nextItemIsTag(-1)) {
            this.itemsList.unmarkItem();
            this._scrollToTag();
        } else {
            this.itemsList.markPreviousItem();
            this._scrollToMarked();
        }
        $event.preventDefault();
    }

    private _nextItemIsTag(nextStep: number): boolean {
        const nextIndex = this.itemsList.markedIndex + nextStep;
        return this.addTag && this.searchTerm
            && this.itemsList.markedItem
            && (nextIndex < 0 || nextIndex === this.itemsList.filteredItems.length)
    }

    private get _isTypeahead() {
        return this.typeahead && this.typeahead.observers.length > 0;
    }

    private get _validTerm() {
        const term = this.searchTerm && this.searchTerm.trim();
        return term && term.length >= this.minTermLength;
    }
}
