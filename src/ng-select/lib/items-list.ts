import { newId } from './id';
import { NgSelectComponent } from './ng-select.component';
import { HcOption } from './ng-select.types';
import * as searchHelper from './search-helper';
import { SelectionModel } from './selection-model';
import { isDefined, isFunction, isObject } from './value-utils';

type OptionGroups = Map<string | HcOption, HcOption[]>;

export class ItemsList {
    private _groups: OptionGroups;

    constructor(
        private _ngSelect: NgSelectComponent,
        private _selectionModel: SelectionModel) {
    }

    private _items: HcOption[] = [];

    get items(): HcOption[] {
        return this._items;
    }

    private _filteredItems: HcOption[] = [];

    get filteredItems(): HcOption[] {
        return this._filteredItems;
    }

    private _markedIndex = -1;

    get markedIndex(): number {
        return this._markedIndex;
    }

    get selectedItems() {
        return this._selectionModel.value;
    }

    get markedItem(): HcOption {
        return this._filteredItems[this._markedIndex];
    }

    get maxItemsSelected(): boolean {
        return this._ngSelect.maxSelectedItems <= this.selectedItems.length;
    }

    get lastSelectedItem() {
        let i = this.selectedItems.length - 1;
        for (; i >= 0; i--) {
            let item = this.selectedItems[i];
            if (!item.disabled) {
                return item;
            }
        }
        return null;
    }

    clearList() {
        this._items.length = 0;
        this._filteredItems.length = 0;
    }

    setItems(items: any[]) {
        this._items = items.map((item, index) => this.mapItem(item, index));
        if (this._ngSelect.groupBy) {
            this._groups = this._groupBy(this._items, this._ngSelect.groupBy);
            this._items = this._flatten(this._groups);
        } else {
            this._groups = new Map();
            this._groups.set(undefined, this._items)
        }
        this._filteredItems = [...this._items];
    }

    reIndex() {
        this._items.forEach((o, index) => o.index = index);
    }

    select(item: HcOption) {
        if (item.selected) { return; }
        this._selectionModel.select(item, this._ngSelect.selectableGroupAsModel);
    }

    unselect(item: HcOption) {
        if (!item.selected) {
            return;
        }
        this._selectionModel.unselect(item);
    }

    findOption(value: any): HcOption {
        let findBy: (item: HcOption) => boolean;
        if (this._ngSelect.compareWith) {
            findBy = item => this._ngSelect.compareWith(item.value, value)
        } else if (this._ngSelect.bindValue) {
            findBy = item => !item.children && this.resolveNested(item.value, this._ngSelect.bindValue) === value
        } else {
            findBy = item => item.value === value ||
                !item.children && item.label && item.label === this.resolveNested(value, this._ngSelect.bindLabel)
        }
        return this._items.find(item => findBy(item));
    }

    /**
     * Adds a new option, transforming the given raw value into an HcOption
     */
    addNewOption(item: any): HcOption {
        const option = this.mapItem(item, this._items.length);
        this._items.push(option);
        this._filteredItems.push(option);
        return option;
    }

    addOption(option: HcOption) {
        option.index = this._items.length;
        this._items.push(option);
    }

    removeOption(item: HcOption) {
        const indexToRemove = this._items.findIndex(i => i.index === item.index);
        if (indexToRemove > -1) {
            this._items.splice(indexToRemove, 1);
        } else {
            console.error(`Couldn't find the item to remove: ${item}`);
        }
    }

    clearSelected(keepDisabled = false) {
        this._selectionModel.clear(keepDisabled);
        this._items.forEach(item => {
            item.selected = keepDisabled && item.selected && item.disabled;
            item.marked = false;
        });
    }

    selectAll() {
        this._selectionModel.selectAll(this._items, this._ngSelect.selectableGroup);
    }

    findByLabel(term: string) {
        term = searchHelper.stripSpecialChars(term).toLocaleLowerCase();
        return this.filteredItems.find(item => {
            const label = searchHelper.stripSpecialChars(item.label).toLocaleLowerCase();
            return label.substr(0, term.length) === term;
        });
    }

    filter(term: string): void {
        if (!term) {
            this.resetFilteredItems();
            return;
        }

        this._filteredItems = [];
        term = this._ngSelect.searchFn ? term : searchHelper.stripSpecialChars(term).toLocaleLowerCase();
        const match = this._ngSelect.searchFn || this._defaultSearchFn;

        for (const key of Array.from(this._groups.keys())) {
            const matchedItems = [];
            for (const item of this._groups.get(key)) {
                const searchItem = this._ngSelect.searchFn ? item.value : item;
                if (match(term, searchItem)) {
                    matchedItems.push(item);
                }
            }
            if (matchedItems.length > 0) {
                const [last] = matchedItems.slice(-1);
                if (last.parent) {
                    const head = this._items.find(x => x === last.parent);
                    this._filteredItems.push(head);
                }
                this._filteredItems.push(...matchedItems);
            }
        }
    }

    resetFilteredItems() {
        if (this._filteredItems.length === this._items.length) { return; }
        this._filteredItems = this._items;
    }

    unmarkItem() {
        this._markedIndex = -1;
    }

    markNextItem() {
        this._stepToItem(+1);
    }

    markPreviousItem() {
        this._stepToItem(-1);
    }

    markItem(item: HcOption) {
        this._markedIndex = this._filteredItems.indexOf(item);
    }

    markSelectedOrDefault() {
        if (this._filteredItems.length === 0) {
            return;
        }

        const lastMarkedIndex = this._getLastMarkedIndex();
        if (lastMarkedIndex > -1) {
            this._markedIndex = lastMarkedIndex;
        } else {
            this._markedIndex = -1;
        }
    }

    /** Obtain a nested value from a given object. It could be a direct property, or a nested property */
    resolveNested(option: any, key: string): any {
        if (!isObject(option)) {
            return option;
        }
        if (key.indexOf('.') === -1) {
            return option[key];
        } else {
            let keys: string[] = key.split('.');
            let value = option;
            for (let i = 0, len = keys.length; i < len; ++i) {
                if (value == null) {
                    return null;
                }
                value = value[keys[i]];
            }
            return value;
        }
    }

    /** Maps the given raw value into an HcOption.
     * todo: refactor this to be a bit simpler to understand
     *  - ngOptionLabel stuff for <ng-options>
    */
    mapItem(item: any, index: number): HcOption {
        const label = isDefined(item.$ngOptionLabel) ? item.$ngOptionLabel : this.resolveNested(item, this._ngSelect.bindLabel);
        const value = isDefined(item.$ngOptionValue) ? item.$ngOptionValue : item;
        return {
            index: index,
            label: isDefined(label) ? label.toString() : '',
            value: value,
            disabled: item.disabled,
            htmlId: `${this._ngSelect.dropdownId}-${index}`,
        };
    }

    private _defaultSearchFn(search: string, opt: HcOption) {
        const label = searchHelper.stripSpecialChars(opt.label).toLocaleLowerCase();
        return label.indexOf(search) > -1
    }

    private _getNextItemIndex(steps: number) {
        if (steps > 0) {
            return (this._markedIndex === this._filteredItems.length - 1) ? 0 : (this._markedIndex + 1);
        }
        return (this._markedIndex <= 0) ? (this._filteredItems.length - 1) : (this._markedIndex - 1);
    }

    private _stepToItem(steps: number) {
        if (this._filteredItems.length === 0 || this._filteredItems.every(x => x.disabled)) {
            return;
        }

        this._markedIndex = this._getNextItemIndex(steps);
        if (this.markedItem.disabled) {
            this._stepToItem(steps);
        }
    }

    private _getLastMarkedIndex() {

        if (this._markedIndex > -1 && this.markedItem === undefined) {
            return -1;
        }

        const selectedIndex = this._filteredItems.indexOf(this.lastSelectedItem);
        if (this.lastSelectedItem && selectedIndex < 0) {
            return -1;
        }

        return Math.max(this.markedIndex, selectedIndex);
    }

    private _groupBy(items: HcOption[], prop: string | Function): OptionGroups {
        const groups = new Map<string | HcOption, HcOption[]>();
        if (items.length === 0) {
            return groups;
        }

        // Check if items are already grouped by given key.
        if (Array.isArray(items[0].value[<string>prop])) {
            for (const item of items) {
                const children = (item.value[<string>prop] || []).map((x, index) => this.mapItem(x, index));
                groups.set(item, children);
            }
            return groups;
        }

        const isFnKey = isFunction(this._ngSelect.groupBy);
        const keyFn = (item: HcOption) => {
            let key = isFnKey ? (<Function>prop)(item.value) : item.value[<string>prop];
            return isDefined(key) ? key : undefined;
        };

        // Group items by key.
        for (const item of items) {
            let key = keyFn(item);
            const group = groups.get(key);
            if (group) {
                group.push(item);
            } else {
                groups.set(key, [item]);
            }
        }
        return groups;
    }

    private _flatten(groups: OptionGroups) {
        const isGroupByFn = isFunction(this._ngSelect.groupBy);
        const items = [];
        for (const key of Array.from(groups.keys())) {
            let i = items.length;
            if (key === undefined) {
                const withoutGroup = groups.get(undefined) || [];
                items.push(...withoutGroup.map(x => ({ ...x, index: i++ })));
                continue;
            }

            const isObjectKey = isObject(key);
            const parent: HcOption = {
                label: isObjectKey ? '' : String(key),
                children: undefined,
                parent: null,
                index: i++,
                disabled: !this._ngSelect.selectableGroup,
                htmlId: newId(),
            };
            const groupKey = isGroupByFn ? this._ngSelect.bindLabel : <string>this._ngSelect.groupBy;
            const groupValue = this._ngSelect.groupValue || (() => {
                if (isObjectKey) {
                    return (<HcOption>key).value;
                }
                return { [groupKey]: key };
            });
            const children = groups.get(key).map(x => {
                x.parent = parent;
                x.children = undefined;
                x.index = i++;
                return x;
            });
            parent.children = children;
            parent.value = groupValue(key, children.map(x => x.value));
            items.push(parent);
            items.push(...children);
        }
        return items;
    }
}
