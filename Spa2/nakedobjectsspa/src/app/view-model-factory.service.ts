import * as Models from "./models";
import { PaneRouteData } from "./route-data";
import { ContextService } from "./context.service";
import { UrlManagerService } from "./url-manager.service";
import { ColorService } from "./color.service";
import { ClickHandlerService } from "./click-handler.service";
import { ErrorService } from "./error.service";
import { MaskService } from "./mask.service";
import { Injectable } from '@angular/core';
import { MomentWrapperService } from "./moment-wrapper.service";
import { AttachmentViewModel } from './view-models/attachment-view-model';
import { ErrorViewModel } from './view-models/error-view-model';
import { IMessageViewModel } from './view-models/imessage-view-model';
import { LinkViewModel } from './view-models/link-view-model';
import { ItemViewModel } from './view-models/item-view-model';
import { RecentItemViewModel } from './view-models/recent-item-view-model';
import { TableRowColumnViewModel } from './view-models/table-row-column-view-model';
import { TableRowViewModel } from './view-models/table-row-view-model';
import { CollectionPlaceholderViewModel } from './view-models/collection-placeholder-view-model';
import { RecentItemsViewModel } from './view-models/recent-items-view-model';
import { CiceroViewModel } from './view-models/cicero-view-model';
import { ParameterViewModel } from './view-models/parameter-view-model';
import { ActionViewModel } from './view-models/action-view-model';
import { PropertyViewModel } from './view-models/property-view-model';
import { CollectionViewModel } from './view-models/collection-view-model';
import { MenuViewModel } from './view-models/menu-view-model';
import { MenusViewModel } from './view-models/menus-view-model';

import * as _ from "lodash";
import { ListViewModel } from './view-models/list-view-model';
import { DialogViewModel } from './view-models/dialog-view-model';
import { DomainObjectViewModel } from './view-models/domain-object-view-model';
import { MultiLineDialogViewModel } from './view-models/multi-line-dialog-view-model';

@Injectable()
export class ViewModelFactoryService {

    constructor(private readonly context: ContextService,
        private urlManager: UrlManagerService,
        private color: ColorService,
        private error: ErrorService,
        private clickHandler: ClickHandlerService,
        private mask: MaskService,
        private momentWrapperService: MomentWrapperService
    ) { }

    errorViewModel = (error: Models.ErrorWrapper) => {
        return new ErrorViewModel(error);
    }

    attachmentViewModel = (propertyRep: Models.PropertyMember, paneId: number) => {
        const parent = propertyRep.parent as Models.DomainObjectRepresentation;
        return new AttachmentViewModel(propertyRep.attachmentLink(), parent, this.context, this.urlManager, this.clickHandler, paneId);
    }

    linkViewModel = (linkRep: Models.Link, paneId: number) => {
        return new LinkViewModel(this.context, this.color, this.error, this.urlManager, linkRep, paneId);
    }

    itemViewModel = (linkRep: Models.Link, paneId: number, selected: boolean, index: number, id: string) => {
        return new ItemViewModel(this.context, this.color, this.error, this.urlManager, linkRep, paneId, this.clickHandler, this, index, selected, id);
    }

    recentItemViewModel = (obj: Models.DomainObjectRepresentation, linkRep: Models.Link, paneId: number, selected: boolean, index: number) => {
        return new RecentItemViewModel(this.context, this.color, this.error, this.urlManager, linkRep, paneId, this.clickHandler, this, index, selected, obj.extensions().friendlyName());
    }

    actionViewModel = (actionRep: Models.ActionMember | Models.ActionRepresentation, vm: IMessageViewModel, routeData: PaneRouteData) => {
        return new ActionViewModel(this, this.context, this.urlManager, this.error, this.clickHandler, actionRep, vm, routeData);
    }

    propertyTableViewModel = (id: string, propertyRep?: Models.PropertyMember | Models.CollectionMember) => {
        return propertyRep ? new TableRowColumnViewModel(id, propertyRep, this.mask) : new TableRowColumnViewModel(id);
    }

    propertyViewModel = (propertyRep: Models.PropertyMember, id: string, previousValue: Models.Value, paneId: number, parentValues: () => _.Dictionary<Models.Value>) => {
        return new PropertyViewModel(propertyRep,
            this.color,
            this.error,
            this,
            this.context,
            this.mask,
            this.urlManager,
            this.clickHandler,
            this.momentWrapperService,
            id,
            previousValue,
            paneId,
            parentValues);
    }

    dialogViewModel = (routeData: PaneRouteData, action: Models.IInvokableAction, actionViewModel: ActionViewModel, isRow: boolean) => {

        return new DialogViewModel(this.color,
            this.context,
            this,
            this.urlManager,
            this.error,
            routeData,
            action,
            actionViewModel,
            isRow);
    }

    multiLineDialogViewModel = (routeData: PaneRouteData, action: Models.IInvokableAction, holder: Models.MenuRepresentation | Models.DomainObjectRepresentation | CollectionViewModel) => {

        return new MultiLineDialogViewModel(this.color,
            this.context,
            this,
            this.urlManager,
            this.error,
            routeData,
            action,
            holder);
    }

    domainObjectViewModel = (obj: Models.DomainObjectRepresentation, routeData: PaneRouteData) => {
        return new DomainObjectViewModel(this.color, this.context, this, this.urlManager, this.error, obj, routeData);
    }

    listViewModel = (list: Models.ListRepresentation, routeData: PaneRouteData) => {
        return new ListViewModel(
            this.color,
            this.context,
            this,
            this.urlManager,
            this.error,
            list,
            routeData
        );
    }

    parameterViewModel = (parmRep: Models.Parameter, previousValue: Models.Value, paneId: number) => {
        return new ParameterViewModel(parmRep, paneId, this.color, this.error, this.momentWrapperService, this.mask, previousValue, this, this.context);
    }

    collectionViewModel = (collectionRep: Models.CollectionMember, routeData: PaneRouteData) => {
        return new CollectionViewModel(this, this.color, this.error, this.context, this.urlManager, collectionRep, routeData);
    }

    listPlaceholderViewModel = (routeData: PaneRouteData) => {
        return new CollectionPlaceholderViewModel(this.context, this.error, routeData);
    }

    menuViewModel = (menuRep: Models.MenuRepresentation, routeData: PaneRouteData) => {
        return new MenuViewModel(this, menuRep, routeData);
    }

    menusViewModel = (menusRep: Models.MenusRepresentation, routeData: PaneRouteData) => {
        return new MenusViewModel(this, menusRep, routeData.paneId);
    }

    recentItemsViewModel = (paneId: number) => {
        return new RecentItemsViewModel(this, this.context, this.urlManager, paneId);
    }

    tableRowViewModel = (properties: _.Dictionary<Models.PropertyMember>, paneId: number, title : string): TableRowViewModel => {
        return new TableRowViewModel(this, properties, paneId, title);
    }

    getItems = (links: Models.Link[], tableView: boolean, routeData: PaneRouteData, listViewModel: ListViewModel | CollectionViewModel) => {

        const collection = listViewModel instanceof CollectionViewModel ? listViewModel : null;
        const id = collection ? collection.id : "";
        const selectedItems = routeData.selectedCollectionItems[id];
        const items = _.map(links, (link, i) => this.itemViewModel(link, routeData.paneId, selectedItems && selectedItems[i], i, id));

        if (tableView) {

            const getActionExtensions = routeData.objectId ?
                (): Promise<Models.Extensions> => this.context.getActionExtensionsFromObject(routeData.paneId, Models.ObjectIdWrapper.fromObjectId(routeData.objectId), routeData.actionId) :
                (): Promise<Models.Extensions> => this.context.getActionExtensionsFromMenu(routeData.menuId, routeData.actionId);

            const getExtensions = listViewModel instanceof CollectionViewModel ? () => Promise.resolve(listViewModel.collectionRep.extensions()) : getActionExtensions;

            // clear existing header 
            listViewModel.header = null;

            if (items.length > 0) {
                getExtensions().
                    then((ext: Models.Extensions) => {
                        _.forEach(items, itemViewModel => {
                            itemViewModel.tableRowViewModel.conformColumns(ext.tableViewTitle(), ext.tableViewColumns());
                        });

                        if (!listViewModel.header) {
                            const firstItem = items[0].tableRowViewModel;

                            const propertiesHeader =
                                _.map(firstItem.properties, (p, i) => {
                                    const match = _.find(items, (item : ItemViewModel) => item.tableRowViewModel.properties[i].title);
                                    return match ? match.tableRowViewModel.properties[i].title : firstItem.properties[i].id;
                                });

                            listViewModel.header = firstItem.showTitle ? [""].concat(propertiesHeader) : propertiesHeader;
                        }
                    }).
                    catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
            }
        }

        return items;
    };

    private cvm: CiceroViewModel = null;

    //ciceroViewModel = () => {
    //    if (cvm == null) {
    //        cvm = new Nakedobjectsviewmodels.CiceroViewModel();
    //        commandFactory.initialiseCommands(cvm);
    //        cvm.parseInput = (input: string) => {
    //            commandFactory.parseInput(input, cvm);
    //        };
    //        cvm.executeNextChainedCommandIfAny = () => {
    //            if (cvm.chainedCommands && cvm.chainedCommands.length > 0) {
    //                const next = cvm.popNextCommand();
    //                commandFactory.processSingleCommand(next, cvm, true);
    //            }
    //        };
    //        cvm.autoComplete = (input: string) => {
    //            commandFactory.autoComplete(input, cvm);
    //        };
    //        cvm.renderHome = _.partial(ciceroRenderer.renderHome, cvm) as (routeData: PaneRouteData) => void;
    //        cvm.renderObject = _.partial(ciceroRenderer.renderObject, cvm) as (routeData: PaneRouteData) => void;
    //        cvm.renderList = _.partial(ciceroRenderer.renderList, cvm) as (routeData: PaneRouteData) => void;
    //        cvm.renderError = _.partial(ciceroRenderer.renderError, cvm);
    //    }
    //    return cvm;
    //};

    //private logoff() {
    //    cvm = null;
    //}
}
