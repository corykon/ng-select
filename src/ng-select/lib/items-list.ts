import { HcPickPaneComponent } from './hc-pick-pane.component';
import { HcOption } from './hc-pick.types';
import { HcPickSelectionModel } from './selection-model';
import { isDefined, isFunction, isObject, newId } from './value-utils';

type OptionGroups = Map<string | HcOption, HcOption[]>;

/** Helps manage the state of the list */
export class ItemsList {
    constructor(private _ngSelect: HcPickPaneComponent, private _selectionModel: HcPickSelectionModel) {}

    get itemsShownCount(): string { return this._itemsShownCount; }
    private _itemsShownCount = '';
    
    get itemsTotalCount(): string { return this._itemsTotalCount; }
    private _itemsTotalCount = '';

    get items(): HcOption[] { return this._items; }
    private _items: HcOption[] = [];

    get filteredItems(): HcOption[] { return this._filteredItems; }
    private _filteredItems: HcOption[] = [];

    private _groups: OptionGroups;
    private _markedIndex = -1;

    /** Represents the "focused" item */
    get markedIndex(): number { return this._markedIndex; }
    /** Return true if some item in the list should have focus. -1 means nothing is focused. */
    get hasMarkedItem(): boolean { return this._markedIndex !== -1; }
    /** The highlighted options in this list */
    get selectedItems(): Array<HcOption> { return this._selectionModel.value; }
    /** The HcOption that currently has focus */
    get markedItem(): HcOption { return this._filteredItems[this._markedIndex]; }
    /** The last option in the list to be highlighted */
    get lastSelectedItem(): HcOption {
        let i = this.selectedItems.length - 1;
        for (; i >= 0; i--) {
            let item = this.selectedItems[i];
            if (!item.disabled) {
                return item;
            }
        }
        return null;
    }

    /** Remove all options from the list */
    clearList() {
        this._items.length = 0;
        this._filteredItems.length = 0;
    }

    /** Converts an array of raw values into HcOptions and set them on the list */
    setItems(items: any[]) {
        this._items = items.map((item, index) => this.mapItem(item, index));
        this._groupItems();
    }

    /** Reset the indexes on each HcOption */
    reIndex() {
        this._items.forEach((o, index) => o.index = index);
    }

    /** Highlight a given option in the list */
    select(item: HcOption) {
        if (item.selected) { return; }
        this._selectionModel.select(item);
    }

    /** Remove highlight from a given option in the list */
    unselect(item: HcOption) {
        if (!item.selected) { return; }
        this._selectionModel.unselect(item);
    }

    /**
     * Find the option in this list for a given value
     * @param value the value we are searching for in this list
     * @param favorBindValueSetting if true, favor the bindValue matching strategy. This will be the case
     * when the value we are searching for is the bound value instead of the entire object.
     */
    findOption(value: any, favorBindValueStrategy: boolean = false): HcOption {
        let findBy: (item: HcOption) => boolean;
        if (this._ngSelect.compareWith && !(favorBindValueStrategy && this._ngSelect.bindValue)) {
            findBy = item => this._ngSelect.compareWith(item.value, value)
        } else if (this._ngSelect.bindValue) {
            findBy = item => !item.children && this.resolveNested(item.value, this._ngSelect.bindValue) === value
        } else {
            findBy = item => item.value === value ||
                !item.children && item.label && item.label === this.resolveNested(value, this._ngSelect.bindLabel)
        }
        return this._items.find(item => findBy(item));
    }

    /** Adds a new option, transforming a given raw value into an HcOption */
    addNewOption(item: any): HcOption {
        const option = this.mapItem(item, this._items.length);
        this._items.push(option);
        this._reGroup();
        return option;
    }

    /** Adds an exisiting HcOption to the list. */
    addOption(option: HcOption) {
        option.index = this._items.length;
        this._items.push(option);
        this._reGroup();
    }

    /** Removes an exisiting HcOption from the list */
    removeOption(item: HcOption) {
        const indexToRemove = this._items.findIndex(i => i.index === item.index);
        if (indexToRemove > -1) {
            this._items.splice(indexToRemove, 1);
            this._reGroup();
        } else {
            console.error(`Couldn't find the item to remove: ${item}`);
        }
    }

    /** Remove parent options from the list and then regroup the child items. */
    private _reGroup() {
        this._items = this._items.filter(i => !i.children);
        this._groupItems();
    }

    /** Create item groups */
    private _groupItems() {
        if (this._ngSelect.groupBy) {
            this._groups = this._groupBy(this._items, this._ngSelect.groupBy);
            this._items = this._flatten(this._groups);
        } else {
            // if the picklist is configured not to do grouping, put all the items in one unnamed group
            this._groups = new Map();
            this._groups.set(undefined, this._items)
            this._sortChildrenWithinGroups();
        }
        this._filteredItems = [...this._items];
        this._updateCounts();
    }

    /** If a sort function was provided, sort the child items within their groups */
    private _sortChildrenWithinGroups() {
        if (!this._ngSelect.sortFn) { return; }
        for (let values of this._groups.values()) {
            values.sort(this._ngSelect.sortFn)
        }
    }

    /**
     * Removed highlight from all items in the list.
     * @param keepDisabled if true, don't deselect any options that are currently disabled
    */
    clearSelected(keepDisabled = false) {
        this._selectionModel.clear(keepDisabled);
        this._items.forEach(item => {
            item.selected = keepDisabled && item.selected && item.disabled;
            item.marked = false;
        });
    }

    /** Highlight all the items in the list */
    selectAll() {
        this._selectionModel.selectAll(this._items, this._ngSelect.selectableGroup);
    }

    /** Find an item in the list by its label */
    findByLabel(term: string): HcOption {
        term = term.toLocaleLowerCase();
        return this.filteredItems.find(item => {
            const label = item.label.toLocaleLowerCase();
            return label.substr(0, term.length) === term;
        });
    }

    /** Filter the options in the list with the given search term */
    filter(term: string): void {
        if (!term) { this.resetFilteredItems(); return; }
        this._filteredItems = [];
        term = this._ngSelect.searchFn ? term : term.toLocaleLowerCase();
        const match = this._ngSelect.searchFn || this._defaultSearchFn;

        if (!this._groups) { return; }
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
        this._updateCounts();
    }

    /** Unfilter the list */
    resetFilteredItems() {
        if (this._filteredItems.length === this._items.length) { return; }
        this._filteredItems = this._items;
        this._updateCounts();
    }

    /** Wipe out selection state and marked state, then mark the first selectable option */
    resetListSelectionState() {
        this.clearSelected();
        this.markFirst();
    }

    /** Remove focus from any of the list options */
    unmark() {
        this._markedIndex = -1;
    }

    /** Move focus up or down in the list */
    markNextItem(stepIsDown: boolean) {
        this._stepToItem(stepIsDown ? 1 : -1);
    }

    /** Focus the given item in the list */
    markItem(item: HcOption) {
        this._markedIndex = this._filteredItems.indexOf(item);
    }

    /** Focus on the last selected item, or the first item in the list */
    markSelectedOrDefault() {
        if (this._filteredItems.length === 0) { return; }
        const lastMarkedIndex = this._getLastMarkedIndex();
        if (lastMarkedIndex > -1) {
            this._markedIndex = lastMarkedIndex;
        } else {
            this.markFirst();
        }
    }

    /** Unmarks what ever is currently marked and then marks the first selectable item */
    markFirst() {
        this.unmark();
        this.markNextItem(true);
    }

    /** Obtain a nested value from a given object. It could be a direct property, or a nested property */
    resolveNested(option: any, key: string): any {
        if (!isObject(option)) { return option; }
        if (!key || key.indexOf(".") === -1) {
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

    /** Maps the given raw value into an HcOption. */
    mapItem(item: any, index: number): HcOption {
        // $hcOptionLabel and $hcOptionValue will be used in the case of <hc-pick-option> components
        const label = isDefined(item.$hcOptionLabel) ? item.$hcOptionLabel : this.resolveNested(item, this._ngSelect.bindLabel);
        const value = isDefined(item.$hcOptionValue) ? item.$hcOptionValue : item;
        return {
            index: index,
            label: isDefined(label) ? label.toString() : '',
            value: value,
            disabled: item.disabled,
            htmlId: `${this._ngSelect.paneId}-${index}`,
        };
    }

    /** Update the 'Showing x of y' counts */
    private _updateCounts() {
        this._itemsShownCount = this.filteredItems.filter(i => !i.children).length.toLocaleString();
        this._itemsTotalCount = this.items.filter(i => !i.children).length.toLocaleString();
    }

    /** If picklist is not configured with a search function, use this one. */
    private _defaultSearchFn(search: string, opt: HcOption) {
        const label = opt.label.toLocaleLowerCase();
        return label.indexOf(search) > -1
    }

    /** Get index of an item a given number of steps above or below the current focus item */
    private _getNextItemIndex(steps: number) {
        if (steps > 0) {
            return (this._markedIndex === this._filteredItems.length - 1) ? 0 : (this._markedIndex + 1);
        }
        return (this._markedIndex <= 0) ? (this._filteredItems.length - 1) : (this._markedIndex - 1);
    }

    /** Move focus a certain number of steps above or below the current focused item */
    private _stepToItem(steps: number) {
        if (this._filteredItems.every(x => x.disabled)) { return; }
        this._markedIndex = this._getNextItemIndex(steps);
        if (this.markedItem.disabled) { this._stepToItem(steps); }
    }

    /** Figure out which item in the list was marked most recently */
    private _getLastMarkedIndex() {
        if (this._markedIndex > -1 && this.markedItem === undefined) { return -1; }

        const selectedIndex = this._filteredItems.indexOf(this.lastSelectedItem);
        if (this.lastSelectedItem && selectedIndex < 0) { return -1; }
        return Math.max(this.markedIndex, selectedIndex);
    }

    /** Group the items in the list as configured */
    private _groupBy(items: HcOption[], prop: string | Function): OptionGroups {
        const groups = new Map<string | HcOption, HcOption[]>();
        if (items.length === 0) { return groups; }

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

    /** Flatten the groups such that the parent is just above it children in a flattened array */
    private _flatten(groups: OptionGroups) {
        const isGroupByFn = isFunction(this._ngSelect.groupBy);
        this._sortChildrenWithinGroups();
        const flattenedSortedItems = new Array<HcOption>()
        const groupItems = new Array<HcOption>();
        for (const key of Array.from(groups.keys())) {
            if (key === undefined) {
                const withoutGroup = groups.get(undefined) || [];
                flattenedSortedItems.push(...withoutGroup.map((item, index) => ({ ...item, index: index })));
                continue;
            }

            const isObjectKey = isObject(key);
            const parent: HcOption = {
                label: isObjectKey ? '' : String(key),
                children: undefined,
                parent: null,
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
                return x;
            });
            parent.children = children;
            parent.value = groupValue(key, children.map(x => x.value));
            groupItems.push(parent)
        }
        if (this._ngSelect.sortFn) { groupItems.sort(this._ngSelect.sortFn); }

        groupItems.forEach(groupItem => {
            let i = flattenedSortedItems.length;
            groupItem.index = i++;
            flattenedSortedItems.push(groupItem)
            groupItem.children.forEach(childItem => {
                childItem.index = i++;
                flattenedSortedItems.push(childItem);
            });
        });
        return flattenedSortedItems;
    }
}
