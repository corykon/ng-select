// it('should display custom dropdown option template', async(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
//             <ng-template hc-pick-option-tmp let-item="item">
//                 <div class="custom-option">{{item.name}}</div>
//             </ng-template>
//         </hc-pick-pane>`);

//     fixture.detectChanges();

//     fixture.whenStable().then(() => {
//         const el = fixture.debugElement.query(By.css('.custom-option')).nativeElement;
//         expect(el).not.toBeNull();
//     });
// }));

// it('should display custom footer and header template', async(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity">
//             <ng-template hc-pane-toolbar-tmp>
//                 <span class="toolbar-label">toolbar</span>
//             </ng-template>
//             <ng-template hc-pane-footer-tmp>
//                 <span class="footer-label">footer</span>
//             </ng-template>
//         </hc-pick-pane>`);
//     fixture.detectChanges();

//     fixture.whenStable().then(() => {
//         const header = fixture.debugElement.query(By.css('.header-label')).nativeElement;
//         expect(header.innerHTML).toBe('header');

//         const footer = fixture.debugElement.query(By.css('.footer-label')).nativeElement;
//         expect(footer.innerHTML).toBe('footer');
//     });
// }));

// it('should display custom item template', async(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities" [(ngModel)]="selectedCity" [addCustomItem]="true">
//             <ng-template hc-pick-custom-item-tmp let-search="searchTerm">
//                 <span class="custom-item-template">{{searchTerm}}</span>
//             </ng-template>
//         </hc-pick-pane>`);

//     fixture.componentInstance.select.searchTerm = 'custom-item';
//     fixture.detectChanges();

//     fixture.whenStable().then(() => {
//         const template = fixture.debugElement.query(By.css('.custom-item-template')).nativeElement;
//         expect(template).toBeDefined();
//     });
// }));

// it('should display custom loading spinner template', fakeAsync(() => {
//     const fixture = createTestingModule(
//         NgSelectTestCmp,
//         `<hc-pick-pane [items]="cities"
//                     [loading]="true"
//                     [(ngModel)]="selectedCity">

//             <ng-template ng-loadingspinner-tmp>
//                 <div class="custom-loadingspinner">
//                     Custom loading spinner
//                 </div>
//             </ng-template>
//         </hc-pick-pane>`);

//     fixture.whenStable().then(() => {
//         tickAndDetectChanges(fixture);
//         const spinner = fixture.debugElement.queryAll(By.css('.custom-loadingspinner'));
//         expect(spinner.length).toBe(1);
//     });
// }));

// describe('max selected items', () => {
//     let arrowIcon: DebugElement = null;
//     beforeEach(() => {
//         fixture.componentInstance.select.maxSelectedItems = 2;
//         arrowIcon = fixture.debugElement.query(By.css('.ng-arrow-wrapper'));
//     });

//     it('should be able to select only two elements', fakeAsync(() => {
//         selectOption(fixture, KeyCode.ArrowDown, 0);
//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         selectOption(fixture, KeyCode.ArrowDown, 1);
//         tickAndDetectChanges(fixture);
//         expect((<HcOption[]>fixture.componentInstance.select.selectedItems).length).toBe(2);
//     }));
// });