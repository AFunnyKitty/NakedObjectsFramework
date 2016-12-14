﻿import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { RouteData, PaneRouteData } from "../route-data";
import { UrlManagerService } from "../url-manager.service";

// todo make pane transitions smoother 

export abstract class PaneComponent implements OnInit, OnDestroy {

    constructor(protected activatedRoute: ActivatedRoute,
        protected urlManager: UrlManagerService) {
    }

    // pane API
    paneId: number;
    paneType: string;

    // todo init in ngOnInit and make property not function 
    paneIdName = () => this.paneId === 1 ? "pane1" : "pane2";

    // todo constants for strings ! 
    backgroundColor = "object-color0";

    onChild() {
        this.paneType = "split";
    }

    onChildless() {
        this.paneType = "single";
    }

    private activatedRouteDataSub: ISubscription;
    private paneRouteDataSub: ISubscription;
    private lastPaneRouteData : PaneRouteData; 

    protected abstract setup(routeData: PaneRouteData);

    ngOnInit(): void {
        this.activatedRouteDataSub = this.activatedRoute.data.subscribe((data: any) => {
            this.paneId = data["pane"];
            this.paneType = data["class"];

            if (!this.paneRouteDataSub) {
                this.paneRouteDataSub =
                    this.urlManager.getPaneRouteDataObservable(this.paneId)
                        .subscribe((paneRouteData: PaneRouteData) => {
                            if (!paneRouteData.isEqual(this.lastPaneRouteData)){
                                this.lastPaneRouteData = paneRouteData;
                                this.setup(paneRouteData);
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