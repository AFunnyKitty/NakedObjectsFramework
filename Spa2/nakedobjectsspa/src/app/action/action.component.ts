import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ActionViewModel } from '../view-models/action-view-model';
import { ContextService} from '../context.service';
import { ISubscription } from 'rxjs/Subscription';

@Component({
    selector: 'action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.css']
})
export class ActionComponent {

    constructor(private myElement: ElementRef,
        private context: ContextService) {
    }

    @Input()
    action: ActionViewModel;

    get description() {
        return this.action.description;
    }

    get friendlyName() {
        return this.action.title;
    }

    disabled() {
        return this.action.disabled() ? true : null;
    }

    tempDisabled(): boolean {
        return this.action.invokableActionRep &&
            this.action.invokableActionRep.isPotent() &&
            this.context.isPendingPotentActionOrReload(this.action.paneId);
    }

    doInvoke(right?: boolean) {
        if (this.action.disabled() || this.tempDisabled()) {
            return;
        }
        this.action.doInvoke(right);
    }

    focus() {
        this.myElement.nativeElement.children[0].focus();
    }

}