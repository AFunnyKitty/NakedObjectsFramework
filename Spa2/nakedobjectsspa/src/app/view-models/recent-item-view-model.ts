﻿import { LinkViewModel } from './link-view-model';
import { TableRowViewModel } from './table-row-view-model';
import { ContextService } from '../context.service';
import { ColorService } from '../color.service';
import { ErrorService } from '../error.service';
import { UrlManagerService } from '../url-manager.service';
import { ClickHandlerService } from '../click-handler.service';
import { ViewModelFactoryService } from '../view-model-factory.service';
import { ItemViewModel } from './item-view-model';
import * as Ro from "../ro-interfaces";
import * as Models from "../models";
import * as Config from "../config";

export class RecentItemViewModel extends ItemViewModel {

    constructor(
        context: ContextService,
        colorService: ColorService,
        error: ErrorService,
        urlManager: UrlManagerService,
        link: Models.Link,
        paneId: number,
        clickHandler: ClickHandlerService,
        viewModelFactory: ViewModelFactoryService,
        index: number,
        isSelected: boolean,
        public friendlyName: string
    ) {
        super(context, colorService, error, urlManager, link, paneId, clickHandler, viewModelFactory, index, isSelected);
    }
}