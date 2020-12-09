import { DebugElement } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HcPicklist2Component } from '../lib/hc-picklist2.component';

export class TestsErrorHandler {}

export function tickAndDetectChanges(fixture: ComponentFixture<any>) {
    fixture.detectChanges();
    tick();
}

export function selectOptions(picklist: HcPicklist2Component, indicesToSelect: number[]) {
    indicesToSelect.forEach(i => {
        picklist.availablePane.select(picklist.availablePane.itemsList.items[i]);
    });
    picklist.moveLeftToRight();
}

export function getPickPaneElement(fixture: ComponentFixture<any>): DebugElement {
    return fixture.debugElement.query(By.css('hc-pick-pane'));
}

export function triggerKeyDownEvent(
    element: DebugElement, which: number, key = '', pressedShiftKey: boolean = false, pressedCtrlKey: boolean = false
): void {
    element.triggerEventHandler('keydown', {
        which: which,
        key: key,
        shiftKey: pressedShiftKey,
        ctrlKey: pressedCtrlKey,
        preventDefault: () => { },
    });
}
