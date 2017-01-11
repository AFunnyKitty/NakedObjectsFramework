import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ViewModelFactoryService } from "../view-model-factory.service";
import { UrlManagerService } from "../url-manager.service";
import * as _ from "lodash";
import * as Models from "../models";
import { ActivatedRoute, Data } from '@angular/router';
import "../rxjs-extensions";
import { PaneRouteData, RouteData, ViewType } from '../route-data';
import { ISubscription } from 'rxjs/Subscription';
import { ContextService } from '../context.service';
import { ColorService } from '../color.service';
import { ErrorService } from '../error.service';
import { FormBuilder, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { ParameterViewModel } from '../view-models/parameter-view-model';
import { ActionViewModel } from '../view-models/action-view-model';
import { DialogViewModel } from '../view-models/dialog-view-model';
import { ListViewModel } from '../view-models/list-view-model';
import { MenuViewModel } from '../view-models/menu-view-model';
import { DomainObjectViewModel } from '../view-models/domain-object-view-model';
import { CollectionViewModel } from '../view-models/collection-view-model';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit, OnDestroy {

    constructor(
        private readonly viewModelFactory: ViewModelFactoryService,
        private readonly urlManager: UrlManagerService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly error: ErrorService,
        private readonly context: ContextService,
        private readonly formBuilder: FormBuilder) {
    }

    @Input()
    parent: MenuViewModel | DomainObjectViewModel | ListViewModel | CollectionViewModel;

    dialog: DialogViewModel | null;

    form: FormGroup;

    get title() {
        const dialog = this.dialog;
        return dialog ? dialog.title : "";
    }

    get message() {
        const dialog = this.dialog;
        return dialog ? dialog.getMessage() : "";
    }

    get parameters() {
        const dialog = this.dialog;
        return dialog ? dialog.parameters : "";
    }

    get tooltip(): string {
        const dialog = this.dialog;
        return dialog ? dialog.tooltip() : "";
    }

    paneId: number;

    onSubmit(right?: boolean) {
        if (this.dialog) {
            _.forEach(this.parms,
                (p, k) => {
                    const newValue = this.form.value[p.id];
                    p.setValueFromControl(newValue);
                });
            this.dialog.doInvoke(right);
        }
    }

    close = () => {
        if (this.dialog) {
            this.dialog.doCloseReplaceHistory();
        }
    };

    private currentDialogId: string;

    private parms: _.Dictionary<ParameterViewModel>;

    private createForm(dialog: DialogViewModel) {
        const pps = dialog.parameters;
        this.parms = _.zipObject(_.map(pps, p => p.id), _.map(pps, p => p)) as _.Dictionary<ParameterViewModel>;
        // todo fix types - no any 
        const controls = _.mapValues(this.parms, p => [p.getValueForControl(), (a : AbstractControl) => p.validator(a)]) as _.Dictionary<any>;
        this.form = this.formBuilder.group(controls);

        this.form.valueChanges.subscribe((data: any) => {
            if (this.dialog) {
                // cache parm values
                _.forEach(data,
                    (v, k) => {
                        const parm = this.parms[k!];
                        parm.setValueFromControl(v);
                    });
                this.dialog.setParms();
            }
        });
    }

    closeExistingDialog() {
        if (this.dialog) {
            this.dialog.doCloseKeepHistory();
            this.dialog = null;
        }
    }


    getDialog(routeData: PaneRouteData) {

        // if it's the same dialog just return 

        if (this.parent && this.currentDialogId) {

            if (this.dialog && this.dialog.id === this.currentDialogId) {
                return;
            }

            const p = this.parent;
            let action: Models.ActionMember | Models.ActionRepresentation | null = null;
            let actionViewModel: ActionViewModel | null = null;

            if (p instanceof MenuViewModel) {
                action = p.menuRep.actionMember(this.currentDialogId);
            }

            if (p instanceof DomainObjectViewModel) {
                action = p.domainObject.actionMember(this.currentDialogId);
            }

            if (p instanceof ListViewModel) {
                action = p.actionMember(this.currentDialogId);
                actionViewModel = _.find(p.actions, a => a.actionRep.actionId() === this.currentDialogId) || null;
            }

            if (p instanceof CollectionViewModel) {
                action = p.actionMember(this.currentDialogId);
                if (action) {
                    actionViewModel = _.find(p.actions, a => a.actionRep.actionId() === this.currentDialogId) || null;
                }
            }
            if (action) {
                this.context.getInvokableAction(action)
                    .then(details => {
                        // only if we still have a dialog (may have beenn removed while getting invokable action)

                        if (this.currentDialogId) {

                            // todo fix this it's clunky
                            this.context.clearParmUpdater(routeData.paneId);

                            const dialogViewModel = this.viewModelFactory.dialogViewModel(routeData, details, actionViewModel, false);
                            this.createForm(dialogViewModel);

                            // must be a change 
                            this.closeExistingDialog();
                            this.dialog = dialogViewModel;
                        }
                    })
                    .catch((reject: Models.ErrorWrapper) => this.error.handleError(reject));
            } else {
                this.closeExistingDialog();
            }

        } else {
            this.closeExistingDialog();
        }
    }

    private activatedRouteDataSub: ISubscription;
    private paneRouteDataSub: ISubscription;
    private lastPaneRouteData : PaneRouteData;

    private routeDataMatchesParent(rd: PaneRouteData) {
        if (this.parent instanceof MenuViewModel) {
            return rd.location === ViewType.Home;
        }

        if (this.parent instanceof DomainObjectViewModel) {
            return rd.location === ViewType.Object;
        }

        if (this.parent instanceof ListViewModel) {
            return rd.location === ViewType.List;
        }

        if (this.parent instanceof CollectionViewModel) {
            return rd.location === ViewType.Object;
        }

        return false;
    }


    ngOnInit(): void {

        this.activatedRouteDataSub = this.activatedRoute.data.subscribe((data: any) => {
            this.paneId = data["pane"];

            if (!this.paneRouteDataSub) {
                this.paneRouteDataSub =
                    this.urlManager.getPaneRouteDataObservable(this.paneId)
                        .subscribe((paneRouteData: PaneRouteData) => {
                            if (!paneRouteData.isEqual(this.lastPaneRouteData)) {
                                if (this.routeDataMatchesParent(paneRouteData)) {
                                    this.currentDialogId = paneRouteData.dialogId;
                                    this.getDialog(paneRouteData);
                                }
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
}