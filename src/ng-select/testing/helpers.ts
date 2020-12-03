import { DebugElement } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KeyCode } from '../lib/hc-pick.types';

export class TestsErrorHandler {}

export function tickAndDetectChanges(fixture: ComponentFixture<any>) {
    fixture.detectChanges();
    tick();
}

export function selectOption(fixture, key: KeyCode, index: number) {
    triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Space); // open
    tickAndDetectChanges(fixture); // need to tick and detect changes, since dropdown fully inits after promise is resolved
    for (let i = 0; i < index; i++) {
        triggerKeyDownEvent(getPickPaneElement(fixture), key);
    }
    triggerKeyDownEvent(getPickPaneElement(fixture), KeyCode.Enter); // select
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
