﻿// Copyright 2013-2014 Naked Objects Group Ltd
// Licensed under the Apache License, Version 2.0(the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module NakedObjects {

    // custom configuration for a particular implementation 

    // path to Restful Objects server 
    const appPath = "http://localhost:59798/";

    export function getAppPath() {
        if (appPath.charAt(appPath.length - 1) === "/") {
            return appPath.length > 1 ? appPath.substring(0, appPath.length - 1) : "";
        }
        return appPath;
    }


    export const defaultPageSize = 20; // can be overriden by server 
    export const listCacheSize = 5;

    export const shortCutMarker = "___";
    export const urlShortCuts = ["http://nakedobjectsrodemo.azurewebsites.net", "AdventureWorksModel"];

    export const keySeparator = "--";
    export const objectColor = "object-color";
    export const linkColor = "link-color";
}