import { Component, OnInit } from '@angular/core';
import { ContextService } from "../context.service";
import { ViewModelFactoryService } from "../view-model-factory.service";
import { ActivatedRoute } from '@angular/router';
import { UrlManagerService } from "../url-manager.service";
import { RouteData, PaneRouteData } from "../route-data";
import { ErrorService } from "../error.service";
import { AttachmentViewModel } from '../view-models/attachment-view-model';
import { PaneComponent } from '../pane/pane';
import * as Models from "../models";

@Component({
    selector: 'attachment',
    templateUrl: './attachment.component.html',
    styleUrls: ['./attachment.component.css']
})
export class AttachmentComponent extends PaneComponent {

    constructor(
        activatedRoute: ActivatedRoute,
        urlManager: UrlManagerService,
        private viewModelFactory: ViewModelFactoryService,
        private context: ContextService,
        private error: ErrorService
    ) {
        super(activatedRoute, urlManager);
    }

    // template API 
    image: string;
    title: string;

    protected setup(routeData: PaneRouteData) {

        const oid = Models.ObjectIdWrapper.fromObjectId(routeData.objectId);

        this.context.getObject(routeData.paneId, oid, routeData.interactionMode)
            .then((object: Models.DomainObjectRepresentation) => {

                const attachmentId = routeData.attachmentId;
                const attachment = object.propertyMember(attachmentId);

                if (attachment && attachment.attachmentLink()) {
                    const avm = this.viewModelFactory.attachmentViewModel(attachment, routeData.paneId);

                    this.title = avm.title;

                    avm.downloadFile()
                        .then(blob => {
                            const reader = new FileReader();
                            reader.onloadend = () => this.image = reader.result;
                            reader.readAsDataURL(blob);
                        })
                        .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
                }
            })
            .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
    }
}