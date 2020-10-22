import {
    Component,
    OnDestroy,
    AfterViewInit,
    forwardRef,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    ViewEncapsulation,
    HostBinding,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    Inject,
    InjectionToken,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { takeUntil, tap, debounceTime, map, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { isDefined, isFunction, isPromise, isObject } from './value-utils';
import { ItemsList } from './items-list';
import { HcOption, KeyCode } from './ng-select.types';
import { newId } from './id';
import { NgDropdownPanelComponent } from './ng-dropdown-panel.component';
import { SelectionModelFactory } from './selection-model';
import { NgDropdownPanelService } from './ng-dropdown-panel.service';
import { HcPicklist2Service } from './hc-picklist2.service';
import { HcPicklistPaneDragService } from './hc-picklist-pane-drag.service';

export const SELECTION_MODEL_FACTORY = new InjectionToken<SelectionModelFactory>('ng-select-selection-model');
export type AddTagFn = ((term: string) => any | Promise<any>);
export type CompareWithFn = (a: any, b: any) => boolean;
export type GroupValueFn = (key: string | object, children: any[]) => string | object;

@Component({
    selector: 'ng-select',
    templateUrl: './ng-select.component.html',
    styleUrls: ['./ng-select.component.scss'],
    providers: [NgDropdownPanelService, HcPicklistPaneDragService],
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
    @Input() typeahead: Subject<string>;
    @Input() searchable = true;
    @Input() _isLeftPane = false;
    @Input() optionTemplate: TemplateRef<any>;
    @Input() optgroupTemplate: TemplateRef<any>;
    @Input() headerTemplate: TemplateRef<any>;
    @Input() footerTemplate: TemplateRef<any>;
    @Input() tagTemplate: TemplateRef<any>;

    @Input() get items() { return this._items };
    set items(value: any[]) {
        this._itemsAreUsed = true;
        this._items = value;
    };

    @Input() get compareWith() { return this._compareWith; }
    set compareWith(fn: CompareWithFn) {
        if (isDefined(fn) && !isFunction(fn)) {
            throw Error('`compareWith` must be a function.');
        }
        this._compareWith = fn;
    }

    // output events
    // todo: likely wont need
    @Output('change') changeEvent = new EventEmitter();
    @Output('open') openEvent = new EventEmitter();
    @Output('close') closeEvent = new EventEmitter();
    @Output('add') addEvent = new EventEmitter();
    @Output('remove') removeEvent = new EventEmitter();
    
    // todo: probably need
    @Output('triggerMove') triggerMoveEvent = new EventEmitter();
    @Output('search') searchEvent = new EventEmitter<{ term: string, items: any[] }>();
    @Output('scroll') scroll = new EventEmitter<{ start: number; end: number }>();
    @Output('scrollToEnd') scrollToEnd = new EventEmitter();

    @ViewChild(forwardRef(() => NgDropdownPanelComponent)) dropdownPanel: NgDropdownPanelComponent;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef<HTMLInputElement>;

    @HostBinding('class.ng-select-disabled') get disabled() { return this.readonly || this._disabled };
    @HostBinding('class.ng-select-filtered') get filtered() { return (!!this.searchTerm && this.searchable || this._isComposing) };

    itemsList: ItemsList;
    viewPortItems: HcOption[] = [];
    searchTerm: string = null;
    dropdownId = newId();
    element: HTMLElement;
    escapeHTML = true;
    useDefaultClass = true;
    _isDragging = false;
    _willAcceptDrop = false;
    _paneIsActive = false;
    public get _companionPane(): NgSelectComponent {
        return this._isLeftPane ? this.picklistService.selectedPane : this.picklistService.availablePane; }

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
        private _cd: ChangeDetectorRef,
        public dragService: HcPicklistPaneDragService
    ) {
        this.itemsList = new ItemsList(this, newSelectionModel());
        this.element = _elementRef.nativeElement;
        this.dragService.reset(this);
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

    onInputKeydown($event: KeyboardEvent) {
        if ($event.which === KeyCode.ArrowDown || $event.which === KeyCode.Enter) {
            $event.preventDefault();
            this.panelFocus();
        } else if ($event.key && $event.key.length === 1 && $event.target === this.searchInput.nativeElement) {
            this._keyPress$.next($event.key.toLocaleLowerCase());
        }
    }

    onPanelKeydown($event: KeyboardEvent) {
        switch ($event.which) {
            case KeyCode.ArrowDown:
                this._handlePanelArrow($event, true);
                break;
            case KeyCode.ArrowUp:
                this._handlePanelArrow($event, false);
                break;
            case KeyCode.Enter:
                this.triggerMoveEvent.emit();
                break;
            case KeyCode.Esc:
                this.itemsList.resetListSelectionState();
                this.dropdownPanel._panel.blur();
                break;
        }
    }

    panelFocus() {
        this.dropdownPanel._panel.focus();
        if (!this.hasSelectedItems) {
            this._jumpFocusToFirstItem();
        }
    }

    private _jumpFocusToFirstItem() {
        if (this.itemsList.filteredItems.length === 0) { return; }
        this.itemsList.resetListSelectionState();
        this._selectAndScrollToItem(this.itemsList.markedItem);
    }

    private _handlePanelArrow($event: KeyboardEvent, isDown: boolean) {
        if (this._nextItemIsTag(isDown)) {
            this.itemsList.unmark();
            this._scrollToTag();
        } else {
            this.itemsList.markNextItem(isDown);
            if (!$event.shiftKey && !$event.ctrlKey) { this.itemsList.clearSelected(); }
            const nextItem = this.itemsList.markedItem;
            this._selectAndScrollToItem(nextItem);
        }
        $event.preventDefault();
    }

    private _selectAndScrollToItem(item: HcOption) {
        if (!item) { return; }
        this.itemsList.select(item);
        this._scrollToMarked();
    }

    deselectAll() {
        this.itemsList.resetListSelectionState();
        this._onSelectionChanged();
    }

    selectAll() {
        this.itemsList.selectAll();
        this._onSelectionChanged();
    }

    clearModel() {
        this.itemsList.clearSelected();
    }

    /**
     * Shift + click selects a range
     * Ctrl + click adds to current selection
     * Regular click clears current selection and selects anew
     */
    onItemClick($event: MouseEvent, item: HcOption) {
        if (!item) { return; }
        const lastMarkedIndex = this.itemsList.markedIndex;
        if (!$event.ctrlKey) { this.itemsList.clearSelected(true); }
        if (!$event.shiftKey) { this.itemsList.markItem(item); }
        
        
        if ($event.shiftKey) {
            const indexOfItemClicked = this.itemsList.filteredItems.findIndex(i => i === item);
            const start = Math.min(lastMarkedIndex, indexOfItemClicked);
            const end = Math.max(lastMarkedIndex, indexOfItemClicked);
            for (let i = start; i <= end; i++) {
                this.select(this.itemsList.filteredItems[i]);
            }
        } else {
            if ($event.ctrlKey && item.selected) {
                this.unselect(item);
            } else {
                this.select(item);
            }
        }

        this._onSelectionChanged();
    }

    onItemDoubledClicked($event: MouseEvent, item: HcOption) {
        if (!$event.shiftKey) { this.itemsList.clearSelected(true); }
        this.select(item);
        this.triggerMoveEvent.emit();
    }

    select(item: HcOption) {
        if (!item || item.disabled || this.disabled || item.selected) { return; }
        this.itemsList.select(item);
    }

    unselect(item: HcOption) {
        if (!item || item.disabled || this.disabled || !item.selected) { return; }
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
        }
        this.itemsList.markSelectedOrDefault();
        this.searchEvent.emit({ term, items: this.itemsList.filteredItems.map(x => x.value) });
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
        
        this.itemsList.markSelectedOrDefault();
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
            autocomplete: 'off',
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

    private _nextItemIsTag(nextStepIsDown: boolean): boolean {
        const nextStep = nextStepIsDown ? 1 : -1;
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
