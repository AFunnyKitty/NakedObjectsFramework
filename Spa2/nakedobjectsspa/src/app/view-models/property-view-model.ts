﻿import { FieldViewModel } from './field-view-model';
import { ColorService } from '../color.service';
import { ErrorService } from '../error.service';
import { AttachmentViewModel } from './attachment-view-model';
import { ViewModelFactoryService } from '../view-model-factory.service';
import { ContextService } from '../context.service';
import { ChoiceViewModel } from './choice-view-model';
import { MaskService } from '../mask.service';
import { ClickHandlerService } from '../click-handler.service';
import { UrlManagerService } from '../url-manager.service';
import { MomentWrapperService } from '../moment-wrapper.service';
import { IDraggableViewModel } from './idraggable-view-model';
import * as _ from "lodash";
import * as Msg from "../user-messages";
import * as Models from '../models';
import * as Helpers from './helpers-view-models';

export class PropertyViewModel extends FieldViewModel implements IDraggableViewModel {

    constructor(
        public propertyRep: Models.PropertyMember,
        color: ColorService,
        error: ErrorService,
        private readonly viewModelfactory: ViewModelFactoryService,
        context: ContextService,
        private readonly maskService: MaskService,
        private readonly urlManager: UrlManagerService,
        private readonly clickHandler: ClickHandlerService,
        momentWrapperService: MomentWrapperService,
        id: string,
        private readonly previousValue: Models.Value,
        onPaneId: number,
        parentValues: () => _.Dictionary<Models.Value>
    ) {

        super(propertyRep,
            color,
            error,
            context,
            momentWrapperService,
            onPaneId,
            propertyRep.isScalar(),
            id,
            propertyRep.isCollectionContributed(),
            propertyRep.entryType());

        this.draggableType = propertyRep.extensions().returnType();
        this.isEditable = !propertyRep.disabledReason();
   
        if (propertyRep.attachmentLink() != null) {
            this.attachment = this.viewModelfactory.attachmentViewModel(propertyRep, onPaneId);
        }

        const fieldEntryType = this.entryType;

        if (fieldEntryType === Models.EntryType.AutoComplete) {
            this.setupPropertyAutocomplete(parentValues);
        }

        if (fieldEntryType === Models.EntryType.ConditionalChoices) {
            this.setupPropertyConditionalChoices();
        }

        if (propertyRep.isScalar()) {
            this.setupScalarPropertyValue();
        } else {
            // is reference
            this.setupReferencePropertyValue();
        }

        this.refresh(previousValue);

        if (!previousValue) {
            this.originalValue = this.getValue();
        }

        this.description = this.getRequiredIndicator() + this.description;
    }


    private getDigest(propertyRep: Models.PropertyMember) {
        const parent = propertyRep.parent;
        if (parent instanceof Models.DomainObjectRepresentation) {
            if (parent.isTransient()) {
                return parent.etagDigest;
            }
        }
        return null;
    }

    private setupPropertyAutocomplete(parentValues: () => _.Dictionary<Models.Value>) {
        const propertyRep = this.propertyRep;
        this.setupAutocomplete(propertyRep, parentValues, this.getDigest(propertyRep));
    }

    private setupPropertyConditionalChoices() {
        const propertyRep = this.propertyRep;
        this.setupConditionalChoices(propertyRep, this.getDigest(propertyRep));
    }

    private callIfChanged(newValue: Models.Value, doRefresh: (newValue: Models.Value) => void) {
        const propertyRep = this.propertyRep;
        const value = newValue || propertyRep.value();

        if (this.currentValue == null || value.toValueString() !== this.currentValue.toValueString()) {
            doRefresh(value);
            this.currentValue = value;
        }
    }

    private setupChoice(newValue: Models.Value) {
        const propertyRep = this.propertyRep;
        if (this.entryType === Models.EntryType.Choices) {

            const choices = propertyRep.choices();

            this.setupChoices(choices);

            if (this.optional) {
                const emptyChoice = new ChoiceViewModel(new Models.Value(""), this.id);
                this.choices = _.concat([emptyChoice], this.choices);
            }

            const currentChoice = new ChoiceViewModel(newValue, this.id);
            this.selectedChoice = _.find(this.choices, c => c.valuesEqual(currentChoice));
        } else if (!propertyRep.isScalar()) {
            this.selectedChoice = new ChoiceViewModel(newValue, this.id);
        }
    }

    private setupReference(value: Models.Value, rep: Models.IHasExtensions) {
        if (value.isNull()) {
            this.reference = "";
            this.value = this.description;
            this.formattedValue = "";
            this.refType = "null";
        } else {
            this.reference = value.link().href();
            this.value = value.toString();
            this.formattedValue = value.toString();
            this.refType = rep.extensions().notNavigable() ? "notNavigable" : "navigable";
        }
        if (this.entryType === Models.EntryType.FreeForm) {
            this.description = this.description || Msg.dropPrompt;
        }
    }

    private setupReferencePropertyValue() {
        const propertyRep = this.propertyRep;
        this.refresh = (newValue: Models.Value) => this.callIfChanged(newValue, (value: Models.Value) => {
            this.setupChoice(value);
            this.setupReference(value, propertyRep);
        });
    }

    private setupScalarPropertyValue() {
        const propertyRep = this.propertyRep;

        const remoteMask = propertyRep.extensions().mask();
        const localFilter = this.maskService.toLocalFilter(remoteMask, propertyRep.extensions().format());
        this.localFilter = localFilter;
        // formatting also happens in in directive - at least for dates - value is now date in that case

        this.refresh = (newValue: Models.Value) => this.callIfChanged(newValue, (value: Models.Value) => {

            this.setupChoice(value);
            Helpers.setScalarValueInView(this, this.propertyRep, value);

            if (propertyRep.entryType() === Models.EntryType.Choices) {
                if (this.selectedChoice) {
                    this.value = this.selectedChoice.name;
                    this.formattedValue = this.selectedChoice.name;
                }
            } else if (this.password) {
                this.formattedValue = Msg.obscuredText;
            } else {
                this.formattedValue = localFilter.filter(this.value);
            }
        });
    }

    readonly isEditable: boolean;
    readonly attachment: AttachmentViewModel;
    refType: "null" | "navigable" | "notNavigable";
    // IDraggableViewModel
    readonly draggableType: string;
    readonly draggableTitle = () => this.formattedValue;

    readonly doClick = (right?: boolean) => this.urlManager.setProperty(this.propertyRep, this.clickHandler.pane(this.onPaneId, right));
    readonly isDirty = () => !!this.previousValue || this.getValue().toValueString() !== this.originalValue.toValueString();
    readonly canDropOn = (targetType: string) => this.context.isSubTypeOf(this.returnType, targetType) as Promise<boolean>;
}