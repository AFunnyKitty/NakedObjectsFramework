import { Component, Input, ViewChildren, QueryList, AfterViewInit, ElementRef } from '@angular/core';
import { RepresentationsService } from "../representations.service";
import { UrlManagerService } from "../url-manager.service";
import { ClickHandlerService } from "../click-handler.service";
import { ContextService } from "../context.service";
import { RepLoaderService } from "../rep-loader.service";
import { ActivatedRoute, Router } from '@angular/router';
import { ColorService } from "../color.service";
import { ErrorService } from "../error.service";
import { PaneRouteData, RouteData, CollectionViewState } from "../route-data";
import { ViewModelFactoryService } from "../view-model-factory.service";
import * as Models from "../models";
import * as Constants from "../constants";
import * as Config from "../config";
import { IDraggableViewModel } from '../view-models/idraggable-view-model';
import { IMessageViewModel } from '../view-models/imessage-view-model';
import { ListViewModel } from '../view-models/list-view-model';
import { PaneComponent } from '../pane/pane';
import { ItemViewModel } from '../view-models/item-view-model';
import { PropertyViewModel} from '../view-models/property-view-model';

@Component({
    selector: 'list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent extends PaneComponent implements  AfterViewInit {

    constructor(activatedRoute: ActivatedRoute,
                urlManager: UrlManagerService,
                private context: ContextService,
                private color: ColorService,
                private viewModelFactory: ViewModelFactoryService,
                private error: ErrorService) {
        super(activatedRoute, urlManager);
    }

    collection: ListViewModel;
   

    toggleActionMenu = () => this.collection.toggleActionMenu();
    reloadList = () => this.collection.reload();
    pageFirst = () => this.collection.pageFirst();
    pagePrevious = () => this.collection.pagePrevious();
    pageNext = ()=> this.collection.pageNext();    
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
    itemHasTableTitle = (item: ItemViewModel) => item.tableRowViewModel.hasTitle;
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

    itemId = (i: number) => `item${this.collection.onPaneId}-${i}`;

    itemColor = (item: ItemViewModel) => item.color;

    itemSelected = (item: ItemViewModel) => item.selected;

    itemTitle = (item: ItemViewModel) => item.title;

    doItemClick = (item: ItemViewModel, right?: boolean) => item.doClick(right);

    title = "";
    state = "list";

    getActionExtensions(routeData: PaneRouteData): Promise<Models.Extensions> {
        return routeData.objectId
            ? this.context.getActionExtensionsFromObject(routeData.paneId, Models.ObjectIdWrapper.fromObjectId(routeData.objectId), routeData.actionId)
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
            this.state = CollectionViewState[routeData.state].toString().toLowerCase();
            this.collection.refresh(routeData);
        } else if (cachedList) {
            this.collection = this.viewModelFactory.listViewModel(cachedList, routeData);
            this.state = CollectionViewState[routeData.state].toString().toLowerCase();
            this.collection.refresh(routeData);
        }
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

    // todo DRY this - and rename - copy not cut
    cut(event: any, item: IDraggableViewModel) {
        const cKeyCode = 67;
        if (event && (event.keyCode === cKeyCode && event.ctrlKey)) {
            this.context.setCutViewModel(item);
            event.preventDefault();
        }
    }

    @ViewChildren("rw")
    row: QueryList<ElementRef>;

    focusOnRow(e: QueryList<ElementRef>) {
        if (e && e.first) {
            e.first.nativeElement.focus();
        }
    }

    ngAfterViewInit(): void {
        this.focusOnRow(this.row);
        this.row.changes.subscribe((ql: QueryList<ElementRef>) => this.focusOnRow(ql));
    }
}