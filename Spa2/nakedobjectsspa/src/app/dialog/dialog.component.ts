﻿import { Component, Input, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { ViewModelFactoryService } from '../view-model-factory.service';
import { UrlManagerService } from '../url-manager.service';
import * as Models from '../models';
import { ActivatedRoute } from '@angular/router';
import { ContextService } from '../context.service';
import { ErrorService } from '../error.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ParameterViewModel } from '../view-models/parameter-view-model';
import { ActionViewModel } from '../view-models/action-view-model';
import { DialogViewModel } from '../view-models/dialog-view-model';
import { ListViewModel } from '../view-models/list-view-model';
import { MenuViewModel } from '../view-models/menu-view-model';
import { DomainObjectViewModel } from '../view-models/domain-object-view-model';
import { CollectionViewModel } from '../view-models/collection-view-model';
import { ConfigService } from '../config.service';
import { ParametersComponent } from '../parameters/parameters.component';
import * as Helpers from '../view-models/helpers-view-models';
import { Dictionary } from 'lodash';
import filter from 'lodash/filter';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import some from 'lodash/some';

@Component({
    selector: 'nof-dialog',
    template: require('./dialog.component.html'),
    styles: [require('./dialog.component.css')]
})
export class DialogComponent implements AfterViewInit {

    constructor(
        private readonly viewModelFactory: ViewModelFactoryService,
        private readonly urlManager: UrlManagerService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly error: ErrorService,
        private readonly context: ContextService,
        private readonly configService: ConfigService,
        private readonly formBuilder: FormBuilder) {
    }

    private parentViewModel: MenuViewModel | DomainObjectViewModel | ListViewModel | CollectionViewModel;

    @Input()
    set parent(parent: MenuViewModel | DomainObjectViewModel | ListViewModel | CollectionViewModel) {
        this.parentViewModel = parent;
    }

    get parent(): MenuViewModel | DomainObjectViewModel | ListViewModel | CollectionViewModel {
        return this.parentViewModel;
    }

    private currentDialogId: string;

    @Input()
    set selectedDialogId(id: string) {
        this.currentDialogId = id;
        this.getDialog();
    }

    get selectedDialogId(): string {
        return this.currentDialogId;
    }

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

    onSubmit(right?: boolean) {
        if (this.dialog) {
            forEach(this.parms,
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

    private parms: Dictionary<ParameterViewModel>;

    private createForm(dialog: DialogViewModel) {
        ({ form: this.form, dialog: this.dialog, parms: this.parms } = Helpers.createForm(dialog, this.formBuilder));
        this.form.valueChanges.subscribe((data) => this.onValueChanged());
    }

    onValueChanged() {
        if (this.dialog) {
            // clear messages if dialog changes 
            this.dialog.resetMessage();
            this.context.clearMessages();
            this.context.clearWarnings();
        }
    }

    closeExistingDialog() {
        if (this.dialog) {
            this.dialog.doCloseKeepHistory();
            this.dialog = null;
        }
    }

    getDialog() {

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

            if (p instanceof DomainObjectViewModel && p.domainObject.hasActionMember(this.currentDialogId)) {
                action = p.domainObject.actionMember(this.currentDialogId);
            }

            if (p instanceof ListViewModel) {
                action = p.actionMember(this.currentDialogId) !;
                actionViewModel = find(p.actions, a => a.actionRep.actionId() === this.currentDialogId) || null;
            }

            if (p instanceof CollectionViewModel && p.hasMatchingLocallyContributedAction(this.currentDialogId)) {
                action = p.actionMember(this.currentDialogId) !;
                actionViewModel = find(p.actions, a => a.actionRep.actionId() === this.currentDialogId) || null;
            }

            if (action) {
                this.context.getInvokableAction(action)
                    .then(details => {
                        // only if we still have a dialog (may have beenn removed while getting invokable action)

                        if (this.currentDialogId) {
                            // must be a change 
                            this.closeExistingDialog();

                            const dialogViewModel = this.viewModelFactory.dialogViewModel(this.parent.routeData, details, actionViewModel, false);
                            this.createForm(dialogViewModel);
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

    @ViewChildren(ParametersComponent)
    parmComponents: QueryList<ParametersComponent>;

    focus(parms: QueryList<ParametersComponent>) {
        if (parms && parms.length > 0) {
            some(parms.toArray(), p => p.focus());
        }
    }

    ngAfterViewInit(): void {
        this.parmComponents.changes.subscribe(ql => this.focus(ql));
    }
}