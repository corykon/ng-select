import { Injectable } from '@angular/core';
import { ItemsList } from './items-list';
import { NgSelectComponent } from './ng-select.component';
import { HcOption } from './ng-select.types';

@Injectable()
export class HcPicklistPaneDragService {
    private pane: NgSelectComponent;

    public reset(pane: NgSelectComponent) {
        this.pane = pane;
    }

    public drag(event: DragEvent, list: ItemsList, item: HcOption) {
        event.stopPropagation();
        console.log('hey'); 
        if (!item.selected) {
            list.clearSelected(true);
        }
        list.select(item);
        this.pane._isDragging = true;
        
        // const canvas = document.createElement("canvas");
        // canvas.width = canvas.height = 50;

        // const ctx = canvas.getContext("2d");
        // ctx.lineWidth = 4;
        // ctx.moveTo(0, 0);
        // ctx.lineTo(500, 500);
        // ctx.moveTo(0, 500);
        // ctx.lineTo(500, 0);
        // ctx.stroke();

        // const dt = event.dataTransfer;
        // dt.setData('text/plain', 'Data to Drag');
        // dt.setDragImage(canvas, 25, 25);
    }

    public allowDrop(event: DragEvent) {
        if (!this.pane._isDragging) {
            event.preventDefault();
            this.pane._willAcceptDrop = true;
        }
    }

    public drop(event: DragEvent) {
        if (this.pane._willAcceptDrop) {
            event.preventDefault();
            this.pane._companionPane.triggerMoveEvent.emit();
        }

        this.dragLeave();
        this.dragEnd();
    }

    public dragEnd() {
        this.pane._isDragging = false;
        this.pane._companionPane._isDragging = false;
    }

    public dragLeave() {
        this.pane._willAcceptDrop = false;
        this.pane._companionPane._willAcceptDrop = false;
        this.pane.detectChanges();
        this.pane._companionPane.detectChanges();
    }
}
