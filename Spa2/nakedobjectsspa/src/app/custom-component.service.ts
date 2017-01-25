import { Injectable } from '@angular/core';
import { CustomComponentConfigService } from './custom-component-config.service';
import { ObjectComponent } from './object/object.component';
import * as Models from './models';
import { ViewType } from './route-data';
import { ListComponent } from './list/list.component';
import { Type } from '@angular/core/src/type';
import { TypeResultCache } from './type-result-cache';
import { ContextService } from './context.service';

export interface ICustomComponentConfigurator {
    addType: (type: string, result: Type<any>) => void;

    addMatch: (matcher: RegExp, result: Type<any>) => void;

    addSubtype: (type: string, result: Type<any>) => void;

    setDefault: (def: Type<any>) => void;
}

class CustomComponentCache extends TypeResultCache<Type<any>> implements ICustomComponentConfigurator {

    constructor(context: ContextService, def: Type<any>) {
        super(context);
        this.setDefault(def);
    }
}

@Injectable()
export class CustomComponentService {

    constructor(context: ContextService,
        private readonly config: CustomComponentConfigService) {

        this.customComponentCaches = [];
        this.customComponentCaches[ViewType.Object] = new CustomComponentCache(context, ObjectComponent);
        this.customComponentCaches[ViewType.List] = new CustomComponentCache(context, ListComponent);

        config.configureCustomObjects(this.customComponentCaches[ViewType.Object]);
        config.configureCustomLists(this.customComponentCaches[ViewType.List]);
    }

    private readonly customComponentCaches: CustomComponentCache[] = [];

    getCustomComponent(domainType: string, viewType: ViewType.Object | ViewType.List) {
        return this.customComponentCaches[viewType].getResult(domainType);
    }
}
