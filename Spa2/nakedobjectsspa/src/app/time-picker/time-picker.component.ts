import { Component, ElementRef, OnInit, Input, Output, EventEmitter, ViewChild, Renderer } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { safeUnsubscribe, focus } from '../helpers-components';
import * as Models from '../models';
import 'rxjs/add/operator/debounceTime';

export interface ITimePickerOutputEvent {
    type: "timeChanged" | "timeCleared" | "timeInvalid";
    data : string;
}

export interface ITimePickerInputEvent {
    type: "setTime";
    data: string;
}

@Component({
  selector: 'nof-time-picker',
  templateUrl: 'time-picker.component.html',
  styleUrls: ['time-picker.component.css']
})
export class TimePickerComponent implements OnInit {


    @Input()
    inputEvents: EventEmitter<ITimePickerInputEvent>;

    @Output()
    outputEvents: EventEmitter<ITimePickerOutputEvent>;

    @Input()
    id : string;

    constructor(
        private readonly el: ElementRef,
        private readonly renderer : Renderer) {
        this.outputEvents = new EventEmitter<ITimePickerOutputEvent>();
    }

    private timeValue: moment.Moment | null;
    private modelValue : string;

    set model(s: string) {
        this.modelValue = s;

        if (this.bSubject) {
            this.bSubject.next(s);
        }
    }

    get model(): string {
        return this.modelValue;
    }

    get time(): moment.Moment | null {
        return this.timeValue;
    }

    set time(time: moment.Moment | null) {
        if (time && time.isValid()) {
            this.timeValue = time;
            this.outputEvents.emit({ type: 'timeChanged', data: time.format("HH:mm:ss") });
        }
    }

    private validInputFormats = ["HH:mm:ss", "HH:mm", "HHmm"];

    private validateTime(newValue: string) {
        let dt: moment.Moment = moment();

        for (let f of this.validInputFormats) {
            dt = moment.utc(newValue, f, true);
            if (dt.isValid()) {
                break;
            }
        }

        return dt;
    }

    setTimeIfChanged(newTime: moment.Moment) {
        if (!newTime.isSame(Models.withUndefined(this.time))) {
            this.time = newTime;
            setTimeout(() => this.model = newTime.format("HH:mm"));
        }
    }

    setTime(newValue: string) {

        if (newValue === "" || newValue == null) {
            this.timeValue = null;
            this.outputEvents.emit({ type: 'timeCleared', data: "" });
        }
        else {
            const dt = this.validateTime(newValue);

            if (dt.isValid()) {
                this.setTimeIfChanged(dt);
            }
            else {
                this.timeValue = null;
                this.outputEvents.emit({ type: 'timeInvalid', data: newValue });
            }
        }
    }

    inputChanged(newValue : string) {
        this.setTime(newValue);
    }

    private eventsSub: ISubscription;

    ngOnInit() {

        if (this.inputEvents) {
            this.eventsSub = this.inputEvents.subscribe((e: ITimePickerInputEvent) => {
                if (e.type === 'setTime') {
                    this.setTime(e.data);
                }
            });
        }
    }

    clear() {
        this.modelValue = "";
        this.setTime("");
    }

    private bSubject: BehaviorSubject<string>;
    private sub : ISubscription;

    get subject() {
        if (!this.bSubject) {
            const initialValue = this.model;
            this.bSubject = new BehaviorSubject(initialValue);

            this.sub = this.bSubject.debounceTime(200).subscribe((data : string) => this.inputChanged(data));
        }

        return this.bSubject;
    }

    ngOnDestroy(): void {
        safeUnsubscribe(this.sub);
        safeUnsubscribe(this.eventsSub);
    }

    @ViewChild("focus")
    inputField : ElementRef;

    focus() {
        return focus(this.renderer, this.inputField);
    }
}
