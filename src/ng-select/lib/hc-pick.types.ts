import { InjectionToken } from '@angular/core';
import { SelectionModelFactory } from './selection-model';

export class HcOption {
    [name: string]: any;
    index?: number;
    htmlId?: string;
    selected?: boolean;
    disabled?: boolean;
    marked?: boolean;
    label?: string;
    value?: string | Object;
    parent?: HcOption;
    children?: HcOption[];
    isClosed = false;

    constructor(config: IHcOption) {
        Object.assign(this, config);
    }

    toggleOpenState(event: MouseEvent) {
        event.stopPropagation();
        this.isClosed = !this.isClosed;
    }
}

export type IHcOption = Partial<HcOption>;

// todo - use cashmere keycodes
export enum KeyCode {
    Tab = 9,
    Enter = 13,
    Esc = 27,
    Space = 32,
    ArrowUp = 38,
    ArrowDown = 40,
    Backspace = 8
}

export const SELECTION_MODEL_FACTORY = new InjectionToken<SelectionModelFactory>('ng-select-selection-model');
export type AddCustomItemFn = ((term: string) => any | Promise<any>);
export type CompareWithFn = (a: any, b: any) => boolean;
export type GroupValueFn = (key: string | object, children: any[]) => string | object;
export type SortFn = (a: HcOption, b: HcOption) => number;
export type SearchFn = (term: string, item: any) => boolean;
