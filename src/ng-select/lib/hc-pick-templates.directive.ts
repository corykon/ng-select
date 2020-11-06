import { Directive, ElementRef, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { escapeHTML } from './value-utils';

@Directive({ selector: '[hcPickItemLabel]' })
export class HcPickItemLabelDirective implements OnChanges {
    @Input() hcPickItemLabel: string;
    @Input() escape = true;

    constructor(private element: ElementRef<HTMLElement>) { }

    ngOnChanges(changes: SimpleChanges) {
        this.element.nativeElement.innerHTML = this.escape ?
            escapeHTML(this.hcPickItemLabel) :
            this.hcPickItemLabel;
    }
}

@Directive({ selector: '[hc-pane-header-left-tmp]' })
export class HcPaneHeaderLeftTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pane-header-right-tmp]' })
export class HcPaneHeaderRightTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pick-option-tmp]' })
export class HcPickOptionTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pick-optgroup-tmp]' })
export class HcPickOptgroupTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pane-list-header-tmp]' })
export class HcPaneListHeaderTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pane-list-footer-tmp]' })
export class HcPaneListFooterTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pick-custom-item-tmp]' })
export class HcPickCustomItemTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
