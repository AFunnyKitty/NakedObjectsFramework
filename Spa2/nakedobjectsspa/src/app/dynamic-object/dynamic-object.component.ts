import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { ObjectComponent } from '../object/object.component';
import { CustomComponentService } from '../custom-component.service';
import { ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { RouteData, PaneRouteData, ViewType } from '../route-data';
import { UrlManagerService } from '../url-manager.service';
import { PaneComponent } from '../pane/pane';
import { Type } from '@angular/core/src/type';
import * as Models from '../models';
import { ConfigService } from '../config.service';

@Component({
    selector: 'nof-dynamic-object',
    templateUrl: './dynamic-object.component.html',
    styleUrls: ['./dynamic-object.component.css']
})
export class DynamicObjectComponent extends PaneComponent {

    @ViewChild('parent', { read: ViewContainerRef })
    parent: ViewContainerRef;

    constructor(
        activatedRoute: ActivatedRoute,
        urlManager: UrlManagerService,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly customComponentService: CustomComponentService,
        private readonly configService: ConfigService) {
        super(activatedRoute, urlManager);
    }

    private lastOid: string;

    protected setup(routeData: PaneRouteData) {
        if (!routeData.objectId) {
            return;
        }
        const oid = Models.ObjectIdWrapper.fromObjectId(routeData.objectId, this.configService.config.keySeparator);

        if (oid.domainType !== this.lastOid) {
            this.lastOid = oid.domainType;
            this.parent.clear();

            this.customComponentService.getCustomComponent(this.lastOid, ViewType.Object).then((c: Type<any>) => {
                const childComponent = this.componentFactoryResolver.resolveComponentFactory(c);
                this.parent.createComponent(childComponent);
            });
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.parent.clear();
    }
}
