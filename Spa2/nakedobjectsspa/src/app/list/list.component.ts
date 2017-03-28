import { Component, Input, ElementRef } from '@angular/core';
import { UrlManagerService } from '../url-manager.service';
import { ClickHandlerService } from '../click-handler.service';
import { ContextService } from '../context.service';
import { RepLoaderService } from '../rep-loader.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColorService } from '../color.service';
import { ErrorService } from '../error.service';
import { PaneRouteData, RouteData, CollectionViewState, ICustomActivatedRouteData } from '../route-data';
import { ViewModelFactoryService } from '../view-model-factory.service';
import * as Models from '../models';
import * as Constants from '../constants';
import { IDraggableViewModel } from '../view-models/idraggable-view-model';
import { IMessageViewModel } from '../view-models/imessage-view-model';
import { ListViewModel } from '../view-models/list-view-model';
import { PaneComponent } from '../pane/pane';
import { ItemViewModel } from '../view-models/item-view-model';
import { PropertyViewModel } from '../view-models/property-view-model';
import { IActionHolder } from '../action/action.component';
import { ConfigService } from '../config.service';
import { LoggerService } from '../logger.service';
import { ISubscription } from 'rxjs/Subscription';
import { TableRowColumnViewModel } from '../view-models/table-row-column-view-model';
import * as Helpers from '../view-models/helpers-view-models';

@Component({
    selector: 'nof-list',
    template: require('./list.component.html'),
    styles: [require('./list.component.css')]
})
export class ListComponent {
  
    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly urlManager: UrlManagerService,
        private readonly context: ContextService,
        private readonly color: ColorService,
        private readonly viewModelFactory: ViewModelFactoryService,
        private readonly error: ErrorService,
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService
    ) {     
    }

    collection: ListViewModel;

    toggleActionMenu = () => this.collection.toggleActionMenu();
    reloadList = () => this.collection.reload();
    pageFirst = () => this.collection.pageFirst();
    pagePrevious = () => this.collection.pagePrevious();
    pageNext = () => this.collection.pageNext();
    pageLast = () => this.collection.pageLast();

    disableActions = () => this.collection.disableActions() ? true : null;
    hideAllCheckbox = () => this.collection.disableActions() || this.collection.items.length === 0;


    pageFirstDisabled = () => this.collection.pageFirstDisabled() ? true : null;
    pagePreviousDisabled = () => this.collection.pagePreviousDisabled() ? true : null;
    pageNextDisabled = () => this.collection.pageNextDisabled() ? true : null;
    pageLastDisabled = () => this.collection.pageLastDisabled() ? true : null;

    showActions = () => this.collection.showActions();

    doTable = () => this.collection.doTable();
    doList = () => this.collection.doList();
    doSummary = () => this.collection.doSummary();

    selectAll = () => this.collection.selectAll();
    allSelected = () => this.collection.allSelected();
    hasTableData = () => this.collection.hasTableData();

    itemTableTitle = (item: ItemViewModel) => item.tableRowViewModel.title;
    itemHasTableTitle = (item: ItemViewModel) => item.tableRowViewModel.showTitle;
    itemTableProperties = (item: ItemViewModel) => item.tableRowViewModel.properties;

    propertyType = (property: PropertyViewModel) => property.type;
    propertyValue = (property: PropertyViewModel) => property.value;
    propertyFormattedValue = (property: PropertyViewModel) => property.formattedValue;
    propertyReturnType = (property: PropertyViewModel) => property.returnType;


    get actionsTooltip() {
        return this.collection.actionsTooltip();
    }

    get message() {
        return this.collection.getMessage();
    }

    get description() {
        return this.collection.description();
    }

    get size() {
        return this.collection.size;
    }

    get items() {
        return this.collection.items;
    }

    get header() {
        return this.collection.header;
    }

    private actionButton: IActionHolder = {
        value: "Actions",
        doClick: () => this.toggleActionMenu(),
        show: () => true,
        disabled: () => this.disableActions(),
        tempDisabled: () => null,
        title: () => this.actionsTooltip,
        accesskey: "a"
    };

    private reloadButton: IActionHolder = {
        value: "Reload",
        doClick: () => this.reloadList(),
        show: () => true,
        disabled: () => null,
        tempDisabled: () => null,
        title: () => "",
        accesskey: null
    };

    private firstButton: IActionHolder = {
        value: "First",
        doClick: () => this.pageFirst(),
        show: () => true,
        disabled: () => this.pageFirstDisabled(),
        tempDisabled: () => null,
        title: () => "",
        accesskey: null
    };

    private previousButton: IActionHolder = {
        value: "Previous",
        doClick: () => this.pagePrevious(),
        show: () => true,
        disabled: () => this.pagePreviousDisabled(),
        tempDisabled: () => null,
        title: () => "",
        accesskey: null
    };

    private nextButton: IActionHolder = {
        value: "Next",
        doClick: () => this.pageNext(),
        show: () => true,
        disabled: () => this.pageNextDisabled(),
        tempDisabled: () => null,
        title: () => "",
        accesskey: null
    };

    private lastButton: IActionHolder = {
        value: "Last",
        doClick: () => this.pageLast(),
        show: () => true,
        disabled: () => this.pageLastDisabled(),
        tempDisabled: () => null,
        title: () => "",
        accesskey: null
    };

    get actionHolders() {
        return [this.actionButton, this.reloadButton, this.firstButton, this.previousButton, this.nextButton, this.lastButton];
    }

    itemId = (i: number | string) => `item${this.collection.onPaneId}-${i}`;

    itemColor = (item: ItemViewModel) => item.color;

    itemSelected = (item: ItemViewModel) => item.selected;

    itemTitle = (item: ItemViewModel) => item.title;

    doItemClick = (item: ItemViewModel, right?: boolean) => item.doClick(right);

    title = "";
    state = "list";

    getActionExtensions(routeData: PaneRouteData): Promise<Models.Extensions> {
        return routeData.objectId
            ? this.context.getActionExtensionsFromObject(routeData.paneId, Models.ObjectIdWrapper.fromObjectId(routeData.objectId, this.configService.config.keySeparator), routeData.actionId)
            : this.context.getActionExtensionsFromMenu(routeData.menuId, routeData.actionId);
    }

    private cachedRouteData: PaneRouteData;

    protected setup(routeData: PaneRouteData) {
        this.cachedRouteData = routeData;
        const cachedList = this.context.getCachedList(routeData.paneId, routeData.page, routeData.pageSize);

        this.getActionExtensions(routeData)
            .then((ext: Models.Extensions) =>
                this.title = ext.friendlyName())
            .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));

        const listKey = this.urlManager.getListCacheIndex(routeData.paneId, routeData.page, routeData.pageSize);

        if (this.collection && this.collection.id === listKey) {
            // same collection/page
            this.state = CollectionViewState[routeData.state].toString().toLowerCase();
            this.collection.refresh(routeData);
        } else if (this.collection && cachedList) {
            // same collection different page
            this.state = CollectionViewState[routeData.state].toString().toLowerCase();
            this.collection.reset(cachedList, routeData);
        } else if (cachedList) {
            // new collection 
            this.collection = this.viewModelFactory.listViewModel(cachedList, routeData);
            this.state = CollectionViewState[routeData.state].toString().toLowerCase();
            this.collection.refresh(routeData);
        } else {
            // should never get here 
            this.loggerService.throw("ListComponent:setup Missing cachedList");
        }

        if (this.collection) {
            // if any previous messages clear them
            this.collection.resetMessage();
        }

        this.selectedDialogId = routeData.dialogId;
    }

    // todo check we still need this after new row component
    copy(event: KeyboardEvent, item: IDraggableViewModel) {
        Helpers.copy(event, item, this.context);
    }

    private activatedRouteDataSub: ISubscription;
    private paneRouteDataSub: ISubscription;
    private lastPaneRouteData: PaneRouteData;

    // now this is a child investigate reworking so object is passed in from parent 
    ngOnInit(): void {
        this.activatedRouteDataSub = this.activatedRoute.data.subscribe((data: ICustomActivatedRouteData) => {

            const paneId = data.pane;

            if (!this.paneRouteDataSub) {
                this.paneRouteDataSub =
                    this.urlManager.getPaneRouteDataObservable(paneId)
                        .subscribe((paneRouteData: PaneRouteData) => {
                            if (!paneRouteData.isEqual(this.lastPaneRouteData)) {
                                this.lastPaneRouteData = paneRouteData;                              
                                this.setup(paneRouteData);
                            }
                        });
            };
        });
    }

    ngOnDestroy(): void {
        if (this.activatedRouteDataSub) {
            this.activatedRouteDataSub.unsubscribe();
        }
        if (this.paneRouteDataSub) {
            this.paneRouteDataSub.unsubscribe();
        }
    }

    selectedDialogId: string;
}