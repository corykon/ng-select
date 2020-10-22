import { Directive, ElementRef, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { escapeHTML } from './value-utils';

@Directive({ selector: '[ngItemLabel]' })
export class NgItemLabelDirective implements OnChanges {
    @Input() ngItemLabel: string;
    @Input() escape = true;

    constructor(private element: ElementRef<HTMLElement>) { }

    ngOnChanges(changes: SimpleChanges) {
        this.element.nativeElement.innerHTML = this.escape ?
            escapeHTML(this.ngItemLabel) :
            this.ngItemLabel;
    }
}

@Directive({ selector: '[hc-pane-header-left-tmp]' })
export class HcPaneHeaderLeftTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[ng-pane-header-right-tmp]' })
export class HcPaneHeaderRightTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[ng-option-tmp]' })
export class NgOptionTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[ng-optgroup-tmp]' })
export class NgOptgroupTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[ng-header-tmp]' })
export class NgHeaderTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[ng-footer-tmp]' })
export class NgFooterTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[ng-tag-tmp]' })
export class NgTagTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
