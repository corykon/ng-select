import { ItemsList } from './items-list';
import { HcPickPaneComponent } from './hc-pick-pane.component';
import { DefaultSelectionModel } from './selection-model';
import { HcPickPaneDragService } from './hc-pick-pane-drag.service';
import { HcPicklist2Service } from './hc-picklist2.service';
import { HcOption } from './hc-pick.types';

let list: ItemsList;
let cmp: HcPickPaneComponent;

fdescribe('ItemsList', () => {
    describe('select', () => {
        beforeEach(() => {
            cmp = ngSelectFactory();
            cmp.bindLabel = 'label';
            list = itemsListFactory(cmp);
        });

        it('should add item to selected items', () => {
            list.select(new HcOption({ value: 'val' }));
            expect(list.selectedItems.length).toBe(1);
            expect(list.selectedItems[0].value).toBe('val');

            list.select(new HcOption({ value: 'val2' }));
            expect(list.selectedItems.length).toBe(2);
            expect(list.selectedItems[1].value).toBe('val2');
        });

        it('should skip when item already selected', () => {
            list.select(new HcOption({ selected: true }));
            expect(list.selectedItems.length).toBe(0);
        });

        it('should select all items in group when group is selected', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1' }
            ]);
            list.select(list.items[0]); // G1

            expect(list.selectedItems.length).toBe(2);
            expect(list.selectedItems[0]).toBe(list.items[1]);
        });

        it('should be able to select items from different groups', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                // G1
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1' },
                // G2
                { label: 'K3', val: 'V3', groupKey: 'G2' },
                { label: 'K4', val: 'V4', groupKey: 'G2' }
            ]);

            list.select(list.items[1]); // K1
            list.select(list.items[4]); // K3

            expect(list.selectedItems.length).toBe(2);
        });

        
        it('should not select disabled items when selecting group', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1', disabled: true }
            ]);
            list.select(list.items[0]); // G1

            expect(list.selectedItems.length).toBe(1);
            expect(list.selectedItems[0].label).toBe('K1');
        });

        it('should mark group selected when all child items are selected', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1' }
            ]);
            list.select(list.items[1]) // K1
            list.select(list.items[2]); // K2

            expect(list.selectedItems.length).toBe(2); // only children included in selectedItems array
            expect(list.items[0].label).toBe('G1');
            expect(list.items[0].selected).toBeTruthy();
        });
    });

    describe('unselect', () => {
        beforeEach(() => {
            cmp = ngSelectFactory();
            cmp.bindLabel = 'label';
            list = itemsListFactory(cmp);
        });

        it('should unselect selected items', () => {
            list.setItems([
                { label: 'K1', val: 'V1' },
                { label: 'K2', val: 'V2' },
            ]);

            list.select(list.items[0]);
            list.select(list.items[1]);
            list.unselect(list.items[0]);
            list.unselect(list.items[1]);

            expect(list.selectedItems.length).toBe(0);
        });

        it('should unselect grouped selected item', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1' },
            ]);

            list.select(list.items[1]); // K1
            list.select(list.items[2]); // K2
            list.unselect(list.items[1]);

            expect(list.selectedItems.length).toBe(1);
            expect(list.selectedItems[0]).toBe(list.items[2]);
        });

        it('should unselect grouped selected item after group was selected', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1' },
            ]);

            list.select(list.items[0]); // G1
            list.unselect(list.items[1]); // K1

            expect(list.selectedItems.length).toBe(1);
            expect(list.selectedItems[0].label).toBe(list.items[2].label); // only K2 should be selected
        });

        it('should not unselect disabled items within a group', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1', disabled: true },
                { label: 'K3', val: 'V3', groupKey: 'G2' },
                { label: 'K4', val: 'V4', groupKey: 'G2', disabled: true },
            ]);

            list.selectedItems.push(list.findByLabel('K2'))
            expect(list.selectedItems.length).toBe(1);

            list.unselect(list.findByLabel('G1'));
            expect(list.selectedItems.length).toBe(1);
            expect(list.selectedItems[0].label).toBe('K2');
        });

        it('should not affect disabled items when unselecting a group', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                { label: 'K1', val: 'V1', groupKey: 'G1' },
                { label: 'K2', val: 'V2', groupKey: 'G1' },
                { label: 'K3', val: 'V3', groupKey: 'G1', disabled: true },
            ]);

            list.select(list.items[0]); // G1
            list.unselect(list.items[1]); // K1
            expect(list.selectedItems.length).toBe(1);
            expect(list.selectedItems[0].label).toBe('K2');
        });
    });

    describe('filter', () => {
        // todo: check counts
        beforeEach(() => {
            cmp = ngSelectFactory();
            cmp.bindLabel = 'label';
            list = itemsListFactory(cmp);
        });

        it('should find item from items list', () => {
            list.setItems([
                { label: 'K1 part1 part2', val: 'V1' },
                { label: 'K2 part1 part2', val: 'V2' },
                { label: 'K3 part1 part2.2', val: 'V3' },
                { label: 'K4 part1 part2.2', val: 'V4' },
                { label: 'K5 part1 part2.2 part3', val: 'V5' },
            ]);

            list.filter('part1');
            expect(list.filteredItems.length).toBe(6); // +1 for default group

            list.filter('part2.2');
            expect(list.filteredItems.length).toBe(4); // +1 for default group

            list.filter('part3');
            expect(list.filteredItems.length).toBe(2); // +1 for default group

            list.filter('nope');
            expect(list.filteredItems.length).toBe(0);
        });

        it('should find item from grouped items list', () => {
            cmp.groupBy = 'groupKey';
            list.setItems([
                // G1 group
                { label: 'K1 part1 part2', val: 'V1', groupKey: 'G1' },
                { label: 'K2 part1 part2', val: 'V2', groupKey: 'G1' },
                // G2 group
                { label: 'K3 part1 part2.2', val: 'V3', groupKey: 'G2' },
                { label: 'K4 part1 part2.2', val: 'V4', groupKey: 'G2' },
                { label: 'K5 part1 part2.2 part3', val: 'V5', groupKey: 'G2' },
            ]);

            list.filter('part1');
            expect(list.filteredItems.length).toBe(7); // 5 items + 2 groups

            list.filter('part2.2');
            expect(list.filteredItems.length).toBe(4); // 3 item + 1 group

            list.filter('part3');
            expect(list.filteredItems.length).toBe(2); // 1 item + 1 group

            list.filter('nope');
            expect(list.filteredItems.length).toBe(0);
        });
    });

    describe('markSelectedOrDefault', () => {
        beforeEach(() => {
            cmp = ngSelectFactory();
            list = itemsListFactory(cmp);
            const items = Array.from(Array(30)).map((_, index) => (`item-${index}`));
            list.setItems(items);
        });

        it('should mark first item', () => {
            list.markSelectedOrDefault();
            expect(list.markedIndex).toBe(1); // index 0 is a group, so index 1 should be first selected
        });

        it('should keep marked item if it is above last selected item', () => {
            list.select(list.items[10]);
            list.markSelectedOrDefault();
            expect(list.markedIndex).toBe(10);

            list.markNextItem(true);
            list.markNextItem(true);
            list.markNextItem(true);
            list.markSelectedOrDefault();
            expect(list.markedIndex).toBe(13);
        });

        it('should mark first after last marked item was filtered out', () => {
            list.markSelectedOrDefault();
            list.markNextItem(true);
            list.filter('item-0');
            list.markSelectedOrDefault();
            expect(list.markedIndex).toBe(1); // index 0 is a group, so index 1 should be first selected
            list.markNextItem(true);
            expect(list.markedIndex).toBe(1); // index still 1, because there only 1 items available to be marked
        });
    });

    // todo: write tests
    describe('unmark', () => { });
    describe('markItem', () => { });
    describe('markFirst', () => { });
    describe('findOption', () => { });
    describe('addOption', () => { });
    describe('removeOption', () => { });
    describe('clearSelected', () => { });
    describe('selectAll', () => { });
    describe('resolveNested', () => { });
    describe('createHcOption', () => { });

    function itemsListFactory(pickCmp: HcPickPaneComponent): ItemsList {
        return new ItemsList(pickCmp, new DefaultSelectionModel());
    }

    function ngSelectFactory(): HcPickPaneComponent {
        return new HcPickPaneComponent(
            () => new DefaultSelectionModel(), {} as any, new HcPicklist2Service, null, new HcPickPaneDragService());
    }
});
