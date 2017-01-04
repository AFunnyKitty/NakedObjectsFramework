﻿import { ParameterViewModel } from './parameter-view-model';
import { ContextService } from '../context.service';
import { PaneRouteData, InteractionMode } from '../route-data';
import { UrlManagerService } from '../url-manager.service';
import { ErrorService } from '../error.service';
import { IMessageViewModel } from './imessage-view-model';
import { ClickHandlerService } from '../click-handler.service';
import { ViewModelFactoryService } from '../view-model-factory.service';
import * as Models from '../models';
import * as Msg from "../user-messages";
import * as _ from "lodash";
import * as Helpers from './helpers-view-models';

export class ActionViewModel {

    constructor(
        private readonly viewModelFactory: ViewModelFactoryService,
        private readonly context: ContextService,
        private readonly urlManager: UrlManagerService,
        private readonly error: ErrorService,
        private readonly clickHandler: ClickHandlerService,
        public  readonly actionRep: Models.ActionMember | Models.ActionRepresentation,
        private readonly vm: IMessageViewModel,
        private readonly routeData: PaneRouteData
    ) {

        if (actionRep instanceof Models.ActionRepresentation || actionRep instanceof Models.InvokableActionMember) {
            this.invokableActionRep = actionRep;
        }

        this.paneId = routeData.paneId;
        this.title = actionRep.extensions().friendlyName();
        this.presentationHint = actionRep.extensions().presentationHint();
        this.menuPath = actionRep.extensions().menuPath() || "";
        this.description = this.disabled() ? actionRep.disabledReason() : actionRep.extensions().description();
    }

    readonly paneId: number; 
    readonly menuPath: string;
    readonly title: string;
    readonly description: string;
    readonly presentationHint: string;
    gotoResult = true;
    invokableActionRep: Models.IInvokableAction;

    // form actions should never show dialogs
    private readonly showDialog = () => this.actionRep.extensions().hasParams() && (this.routeData.interactionMode !== InteractionMode.Form);

    private readonly incrementPendingPotentAction = () => {
        Helpers.incrementPendingPotentAction(this.context, this.invokableActionRep, this.paneId);
    }

    private readonly decrementPendingPotentAction = () => {
        Helpers.decrementPendingPotentAction(this.context, this.invokableActionRep, this.paneId);
    }

    // open dialog on current pane always - invoke action goes to pane indicated by click
    // todo this is modified maybe better way of doing ?
    doInvoke = this.showDialog()
        ? (right?: boolean) => {
            // clear any previous dialog so we don't pick up values from it
            this.context.clearDialogValues(this.paneId);
            this.urlManager.setDialogOrMultiLineDialog(this.actionRep, this.paneId);
        }
        : (right?: boolean) => {
            const pps = this.parameters();
            this.incrementPendingPotentAction();
            this.execute(pps, right)
                .then((actionResult: Models.ActionResultRepresentation) => {
                    this.decrementPendingPotentAction();
                    // if expect result and no warning from server generate one here
                    if (actionResult.shouldExpectResult() && !actionResult.warningsOrMessages()) {
                        this.context.broadcastWarning(Msg.noResultMessage);
                    }
                })
                .catch((reject: Models.ErrorWrapper) => {
                    this.decrementPendingPotentAction();
                    const display = (em: Models.ErrorMap) => this.vm.setMessage(em.invalidReason() || em.warningMessage);
                    this.error.handleErrorAndDisplayMessages(reject, display);
                });
        };


    // todo this is modified maybe better way of doing ?
    execute = (pps: ParameterViewModel[], right?: boolean): Promise<Models.ActionResultRepresentation> => {
        const parmMap = _.zipObject(_.map(pps, p => p.id), _.map(pps, p => p.getValue())) as _.Dictionary<Models.Value>;
        _.forEach(pps, p => this.urlManager.setParameterValue(this.actionRep.actionId(), p.parameterRep, p.getValue(), this.paneId));
        // todo is this necessary - should we always be invokable by now ?
        return this.context.getInvokableAction(this.actionRep)
            .then((details: Models.IInvokableAction) => this.context.invokeAction(details, parmMap, this.paneId, this.clickHandler.pane(this.paneId, right), this.gotoResult));
    };


    readonly disabled = () => !!this.actionRep.disabledReason();

    readonly parameters = () => {
        // don't use actionRep directly as it may change and we've closed around the original value
        const parameters = _.pickBy(this.invokableActionRep.parameters(), p => !p.isCollectionContributed()) as _.Dictionary<Models.Parameter>;
        const parms = this.routeData.actionParams;
        return _.map(parameters, parm => this.viewModelFactory.parameterViewModel(parm, parms[parm.id()], this.paneId));
    };

    readonly makeInvokable = (details: Models.IInvokableAction) => this.invokableActionRep = details;
}