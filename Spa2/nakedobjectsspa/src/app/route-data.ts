import * as Models from "./models";
import * as Config from "./config";
import * as _ from "lodash";

export enum ViewType {
    Home,
    Object,
    List
}

export enum CollectionViewState {
    Summary,
    List,
    Table
}

export enum ApplicationMode {
    Gemini,
    Cicero
}

export enum InteractionMode {
    View,
    Edit,
    Transient,
    Form,
    NotPersistent
}

export class RouteData {
    constructor() {
        this.pane1 = new PaneRouteData(1);
        this.pane2 = new PaneRouteData(2);
    }

    pane1: PaneRouteData;
    pane2: PaneRouteData;

    pane = () => [, this.pane1, this.pane2];
}

interface ICondition {
    condition: (val: any) => boolean,
    name: string;
}

export class PaneRouteData {
    constructor(public paneId: number) { }

    location : ViewType; 
    objectId: string;
    menuId: string;
    collections: _.Dictionary<CollectionViewState>;
    selectedCollectionItems: _.Dictionary<boolean[]>;
    actionsOpen: string;
    actionId: string;
    // Note that actionParams applies to executed actions. For dialogs see dialogFields
    // we have both because of contributed actions where we have to distinguish the action parms that 
    // created the current list and the the parms for the contributed action

    actionParams: _.Dictionary<Models.Value>;
    state: CollectionViewState;
    dialogId: string;
    dialogFields: _.Dictionary<Models.Value>;
    page: number;
    pageSize: number;
    interactionMode: InteractionMode;
    errorCategory: Models.ErrorCategory;
    attachmentId: string;

    private validatingUrl: string;

    isValid(name: string) {
        if (!this.hasOwnProperty(name)) {
            throw new Error(`${name} is not a valid property on PaneRouteData`);
        }
    }

    private isNull = {
        condition: (val: any) => !val,
        name: "is null"
    };

    private isNotNull = {
        condition: (val: any) => val,
        name: "is not null"
    };

    private isLength0 = {
        condition: (val: any) => val && val.length === 0,
        name: "is length 0"
    };

    private isEmptyMap = {
        condition: (val: any) => _.keys(val).length === 0,
        name: "is an empty map"
    };

    private assertMustBe(context: string, name: string, contextCondition: ICondition, valueCondition: ICondition) {
        // make sure context and name are valid
        this.isValid(context);
        this.isValid(name);

        if (contextCondition.condition((<any>this)[context])) {
            if (!valueCondition.condition((<any>this)[name])) {
                throw new Error(`Expect that ${name} ${valueCondition.name} when ${context} ${contextCondition.name} within url "${this.validatingUrl}"`);
            }
        }
    }

    assertMustBeEmptyOutsideContext(context: string, name: string) {
        this.assertMustBe(context, name, this.isNull, this.isEmptyMap);
    }

    assertMustBeNullOutsideContext(context: string, name: string) {
        this.assertMustBe(context, name, this.isNull, this.isNull);
    }

    assertMustBeNullInContext(context: string, name: string) {
        this.assertMustBe(context, name, this.isNotNull, this.isNull);
    }

    assertMustBeZeroLengthInContext(context: string, name: string) {
        this.assertMustBe(context, name, this.isNotNull, this.isLength0);
    }

    validate(url: string) {

        this.validatingUrl = url;

        if (Config.doUrlValidation) {
            // Can add more conditions here 
            this.assertMustBeNullInContext("objectId", "menuId");
            this.assertMustBeNullInContext("menuId", "objectId");
        }
    }

    isEqual(other : PaneRouteData) {
        return _.isEqual(this, other);
    }
}

