﻿import { Component, ViewChildren, QueryList } from '@angular/core';
import { PaneComponent } from '../pane/pane';
import { ParametersComponent } from '../parameters/parameters.component';
import { ViewModelFactoryService } from '../view-model-factory.service';
import { ActivatedRoute } from '@angular/router';
import { UrlManagerService } from '../url-manager.service';
import { ContextService } from '../context.service';
import { ErrorService } from '../error.service';
import { PaneRouteData } from '../route-data';
import { ActionViewModel } from '../view-models/action-view-model';
import { CollectionViewModel } from '../view-models/collection-view-model';
import { MultiLineDialogViewModel } from '../view-models/multi-line-dialog-view-model';
import { DialogViewModel } from '../view-models/dialog-view-model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ParameterViewModel } from '../view-models/parameter-view-model';
import { ConfigService } from '../config.service';
import * as Helpers from '../view-models/helpers-view-models';
import * as Msg from '../user-messages';
import * as Models from '../models';
import * as _ from 'lodash';

@Component({
    selector: 'nof-multi-line-dialog',
    template: require('./multi-line-dialog.component.html'),
    styles: [require('./multi-line-dialog.component.css')]
})
export class MultiLineDialogComponent extends PaneComponent {

    constructor(
        activatedRoute: ActivatedRoute,
        urlManager: UrlManagerService,
        private readonly viewModelFactory: ViewModelFactoryService,
        context: ContextService,
        private readonly error: ErrorService,
        private readonly formBuilder: FormBuilder,
        private readonly configService: ConfigService
    ) {
        super(activatedRoute, urlManager, context);
    }

    dialog: MultiLineDialogViewModel;

    rowData: { form: FormGroup, dialog: DialogViewModel, parms: _.Dictionary<ParameterViewModel> }[];

    form = (i: number) => {
        const rowData = this.rowData[i];
        return rowData.form;
    }

    get objectFriendlyName() {
        return this.dialog.objectFriendlyName;
    }

    get objectTitle() {
        return this.dialog.objectTitle;
    }

    get dialogTitle() {
        return this.dialog.title;
    }

    get header() {
        return this.dialog.header();
    }

    get rows() {
        return this.dialog.dialogs;
    }

    parameters = (row: DialogViewModel) => row.parameters;

    rowSubmitted = (row: DialogViewModel) => row.submitted;

    rowTooltip = (row: DialogViewModel) => row.tooltip();

    rowMessage = (row: DialogViewModel) => {
        return row.submitted ? Msg.submittedMessage : row.getMessage();
    }

    rowDisabled = (row: DialogViewModel) => {
        return !row.clientValid() || row.submitted;
    }

    get count() {
        return Msg.submittedCount(this.dialog.submittedCount());
    }

    invokeAndAdd(index: number) {
        const parms = this.rowData[index].parms;

        _.forEach(parms,
            p => {
                const newValue = this.rowData[index].form.value[p.id];
                p.setValueFromControl(newValue);
            });

        const addedIndex = this.dialog.invokeAndAdd(index);

        if (addedIndex) {
            this.rowData.push(this.createForm(this.dialog.dialogs[addedIndex]));
        }
    }

    close = () => {
        this.urlManager.popUrlState();
    }

    private createForm(dialog: DialogViewModel) {
        return Helpers.createForm(dialog, this.formBuilder);
    }

    setMultiLineDialog(holder: Models.MenuRepresentation | Models.DomainObjectRepresentation | CollectionViewModel,
        newDialogId: string,
        routeData: PaneRouteData,
        actionViewModel?: ActionViewModel) {

        const action = holder.actionMember(newDialogId, this.configService.config.keySeparator) !;
        this.context.getInvokableAction(action).
            then(details => {

                if (actionViewModel) {
                    actionViewModel.makeInvokable(details);
                }

                this.dialog = this.viewModelFactory.multiLineDialogViewModel(routeData, details, holder);
                this.rowData = _.map(this.dialog.dialogs, d => this.createForm(d));
            }).
            catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
    }

    protected setup(routeData: PaneRouteData) {
        if (routeData.menuId) {
            this.context.getMenu(routeData.menuId)
                .then((menu: Models.MenuRepresentation) => {
                    this.setMultiLineDialog(menu, routeData.dialogId, routeData);
                })
                .catch((reject: Models.ErrorWrapper) => {
                    this.error.handleError(reject);
                });
        } else if (routeData.objectId) {
            const oid = Models.ObjectIdWrapper.fromObjectId(routeData.objectId, this.configService.config.keySeparator);
            this.context.getObject(routeData.paneId, oid, routeData.interactionMode).
                then((object: Models.DomainObjectRepresentation) => {

                    const ovm = this.viewModelFactory.domainObjectViewModel(object, routeData, false);
                    const newDialogId = routeData.dialogId;

                    const lcaCollection = _.find(ovm.collections, c => c.hasMatchingLocallyContributedAction(newDialogId));

                    if (lcaCollection) {
                        const actionViewModel = _.find(lcaCollection.actions, a => a.actionRep.actionId() === newDialogId);
                        this.setMultiLineDialog(lcaCollection, newDialogId, routeData, actionViewModel);
                    } else {
                        this.setMultiLineDialog(object, newDialogId, routeData);
                    }

                }).
                catch((reject: Models.ErrorWrapper) => {
                    this.error.handleError(reject);
                });
        }
    }

    @ViewChildren(ParametersComponent)
    parmComponents: QueryList<ParametersComponent>;

    focus(parms: QueryList<ParametersComponent>) {
        if (parms && parms.length > 0) {
            _.some(parms.toArray(), p => p.focus());
        }
    }

    ngAfterViewInit(): void {
        this.parmComponents.changes.subscribe(ql => this.focus(ql));
    }
}
