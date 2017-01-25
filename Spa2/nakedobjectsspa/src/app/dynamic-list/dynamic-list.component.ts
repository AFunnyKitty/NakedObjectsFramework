import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ObjectComponent } from '../object/object.component';
import { CustomComponentService } from '../custom-component.service';
import { ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { RouteData, PaneRouteData, ViewType } from "../route-data";
import { UrlManagerService } from "../url-manager.service";
import { PaneComponent } from '../pane/pane';
import { Type } from '@angular/core/src/type';
import { ContextService } from '../context.service';
import { ErrorService } from '../error.service';
import { IButton } from '../button/button.component';
import * as Models from '../models';

@Component({
    selector: 'nof-dynamic-list',
    templateUrl: './dynamic-list.component.html',
    styleUrls: ['./dynamic-list.component.css']
})
export class DynamicListComponent extends PaneComponent {

    @ViewChild('parent', { read: ViewContainerRef })
    parent: ViewContainerRef;

    constructor(
        activatedRoute: ActivatedRoute,
        urlManager: UrlManagerService,
        private readonly context: ContextService,
        private readonly error: ErrorService,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly customComponentService: CustomComponentService) {
        super(activatedRoute, urlManager);
    }

    private lastOid: string;
    title: string = "";
    showPlaceholder: boolean = true;
    private cachedRouteData: PaneRouteData;

    getActionExtensions(routeData: PaneRouteData): Promise<Models.Extensions> {
        return routeData.objectId
            ? this.context.getActionExtensionsFromObject(routeData.paneId, Models.ObjectIdWrapper.fromObjectId(routeData.objectId), routeData.actionId)
            : this.context.getActionExtensionsFromMenu(routeData.menuId, routeData.actionId);
    }

    reload() {

        const recreate = () =>
            this.cachedRouteData.objectId
                ? this.context.getListFromObject(this.cachedRouteData)
                : this.context.getListFromMenu(this.cachedRouteData);

        recreate()
            .then(() => this.setup(this.cachedRouteData))
            .catch((reject: Models.ErrorWrapper) => {
                this.error.handleError(reject);
            });
    }

    private reloadPlaceholderButton: IButton = {
        value: "Reload",
        doClick: () => this.reload(),
        show: () => true,
        disabled: () => null,
        title: () => "",
        accesskey: null
    };

    get buttons() {
        return [this.reloadPlaceholderButton];
    }

    protected setup(routeData: PaneRouteData) {
        this.cachedRouteData = routeData;
        const cachedList = this.context.getCachedList(routeData.paneId, routeData.page, routeData.pageSize);

        if (cachedList) {
            this.showPlaceholder = false;
            const et = cachedList.extensions().elementType();

            if (et !== this.lastOid) {
                this.lastOid = et;
                this.parent.clear();
                this.customComponentService.getCustomComponent(et, ViewType.List).then((c: Type<any>) => {
                    const childComponent = this.componentFactoryResolver.resolveComponentFactory(c);
                    this.parent.createComponent(childComponent);
                });
            }

        } else {
            this.showPlaceholder = true;
            this.parent.clear();
            this.lastOid = null; // so we recreate child after reload
            this.getActionExtensions(routeData)
                .then((ext: Models.Extensions) =>
                    this.title = ext.friendlyName())
                .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));

        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.parent.clear();
    }
}

