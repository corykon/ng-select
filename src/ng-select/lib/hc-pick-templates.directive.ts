import { Directive, TemplateRef } from '@angular/core';

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

@Directive({ selector: '[hc-pane-toolbar-tmp]' })
export class HcPaneToolbarTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pane-footer-tmp]' })
export class HcPaneFooterTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({ selector: '[hc-pick-custom-item-tmp]' })
export class HcPickCustomItemTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
