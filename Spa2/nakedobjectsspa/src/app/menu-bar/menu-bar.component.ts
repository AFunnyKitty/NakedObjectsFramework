﻿import { Component, Input, QueryList, AfterViewInit, ViewChildren, OnDestroy } from '@angular/core';
import { LinkViewModel } from '../view-models/link-view-model';
import { ActionComponent, IActionHolder } from '../action/action.component';
import { UrlManagerService } from '../url-manager.service';
import map from 'lodash-es/map';
import some from 'lodash-es/some';
import { ISubscription } from 'rxjs/Subscription';
import { safeUnsubscribe } from '../helpers-components';

@Component({
    selector: 'nof-menu-bar',
    template: require('./menu-bar.component.html'),
    styles: [require('./menu-bar.component.css')]
})
export class MenuBarComponent implements AfterViewInit, OnDestroy {

    constructor(private readonly urlManager: UrlManagerService) { }

    @Input()
    set menus(links: LinkViewModel[]) {

        this.actions = map(links,
            link => ({
                value: link.title,
                doClick: () => {
                    const menuId = link.link.rel().parms[0].value;
                    this.urlManager.setMenu(menuId!, link.paneId);
                },
                doRightClick: () => { },
                show: () => true,
                disabled: () => null,
                tempDisabled: () => false,
                title: () => link.title,
                accesskey: null
            }));
    }

    actions: IActionHolder[];

    focusOnFirstMenu(menusList: QueryList<ActionComponent>) {
        if (menusList) {
            // until first element returns true
            some(menusList.toArray(), i => i.focus());
        }
    }

    @ViewChildren(ActionComponent)
    actionComponents: QueryList<ActionComponent>;

    private sub : ISubscription;

    ngAfterViewInit(): void {
        this.focusOnFirstMenu(this.actionComponents);
        this.sub = this.actionComponents.changes.subscribe((ql: QueryList<ActionComponent>) => this.focusOnFirstMenu(ql));
    }

    ngOnDestroy() {
        safeUnsubscribe(this.sub);
    }
}
