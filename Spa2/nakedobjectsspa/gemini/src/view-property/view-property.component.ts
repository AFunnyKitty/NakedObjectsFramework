﻿import { Component, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from '@nakedobjects/services';
import { ContextService } from '@nakedobjects/services';
import { PropertyViewModel } from '@nakedobjects/view-models';
import * as Helpers from '@nakedobjects/view-models';
import { AttachmentViewModel } from '@nakedobjects/view-models';
import { DragAndDropService } from '@nakedobjects/view-models';

@Component({
    selector: 'nof-view-property',
    templateUrl: 'view-property.component.html',
    styleUrls: ['view-property.component.css']
})
export class ViewPropertyComponent {

    constructor(
        private readonly router: Router,
        private readonly error: ErrorService,
        private readonly context: ContextService,
        private readonly dragAndDrop: DragAndDropService
    ) { }

    // template inputs

    @Input()
    property: PropertyViewModel;

    // template listeners

    @HostListener('keydown', ['$event'])
    onEnter(event: KeyboardEvent) {
        this.copy(event);
    }

    @HostListener('keypress', ['$event'])
    onEnter1(event: KeyboardEvent) {
        this.copy(event);
    }

    // template API

    get title() {
        return this.property.title;
    }

    get propertyType() {
        return this.property.type;
    }

    get propertyRefType() {
        return this.property.refType;
    }

    get propertyReturnType() {
        return this.property.returnType;
    }

    get formattedValue() {
        return this.property.formattedValue;
    }

    get value() {
        return this.property.value;
    }

    get format() {
        return this.property.format;
    }

    get isBlob() {
        return this.property.format === 'blob';
    }

    get isMultiline() {
        return !(this.property.multipleLines === 1);
    }

    get multilineHeight() {
        return `${this.property.multipleLines * 20}px`;
    }

    get color() {
        return this.property.color;
    }

    get attachment(): AttachmentViewModel | null {
        return this.property.attachment;
    }

    doClick = (right?: boolean) => this.property.doClick(right);

    copy(event: KeyboardEvent) {
        const prop = this.property;
        if (prop) {
            Helpers.copy(event, prop, this.dragAndDrop);
        }
    }
}