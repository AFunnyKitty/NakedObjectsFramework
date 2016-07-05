/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="nakedobjects.models.ts" />
/// <reference path="nakedobjects.app.ts" />
var NakedObjects;
(function (NakedObjects) {
    NakedObjects.app.run(function (mask) {
        // map to convert from mask representation in RO extension to client represention.
        var pound = "\u00A3";
        mask.setCurrencyMaskMapping("C", "decimal", pound, 2);
        mask.setCurrencyMaskMapping("c", "decimal", pound, 2);
        mask.setDateMaskMapping("d", "date-time", "d MMM yyyy", "+0000");
        mask.setDateMaskMapping("D", "date", "d MMM yyyy hh:mm:ss");
        mask.setDateMaskMapping("T", "time", "HH:mm", "+0000");
    });
})(NakedObjects || (NakedObjects = {}));
//# sourceMappingURL=nakedobjects.services.mask.config.js.map