import { Component, OnInit } from '@angular/core';
import { ContextService } from "../context.service";
import { ViewModelFactoryService } from "../view-model-factory.service";
import * as Models from '../models';
import * as Config from '../config';
import { ErrorService } from "../error.service";
import { ApplicationPropertiesViewModel } from '../view-models/application-properties-view-model';

@Component({
    selector: 'nof-application-properties',
    templateUrl: './application-properties.component.html',
    styleUrls: ['./application-properties.component.css']
})
export class ApplicationPropertiesComponent implements OnInit {

    constructor(
        private readonly context: ContextService,
        private readonly error: ErrorService) {
    }

    get userName() {
        return this.applicationProperties.user ? this.applicationProperties.user.userName : "";
    }

    get serverUrl() {
        return this.applicationProperties.serverUrl;
    }

    get implVersion() {
        return this.applicationProperties.serverVersion ? this.applicationProperties.serverVersion.implVersion : "";
    }

    get clientVersion() {
        return "todo";
    }

    applicationProperties: ApplicationPropertiesViewModel;

    ngOnInit(): void {

        this.applicationProperties = new ApplicationPropertiesViewModel();

        this.context.getUser().
            then((u: Models.UserRepresentation) => this.applicationProperties.user = u.wrapped()).
            catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));

        this.context.getVersion().
            then((v: Models.VersionRepresentation) => this.applicationProperties.serverVersion = v.wrapped()).
            catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));

        this.applicationProperties.serverUrl = Config.getAppPath();

        // apvm.clientVersion = (NakedObjects as any)["version"] || "Failed to write version";

    }
}