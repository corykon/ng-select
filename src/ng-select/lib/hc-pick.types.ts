import { InjectionToken } from '@angular/core';
import { SelectionModelFactory } from './selection-model';

export interface HcOption {
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
}

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
