"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSalesforceURL = exports.getMetadataId = exports.getInstanceUrl = exports.getDefaultOrg = exports.getLayoutObjectName = exports.getFlowLabel = exports.getMetadataTypeAndName = void 0;
var metadata_detector_1 = require("./metadata-detector");
Object.defineProperty(exports, "getMetadataTypeAndName", { enumerable: true, get: function () { return metadata_detector_1.getMetadataTypeAndName; } });
Object.defineProperty(exports, "getFlowLabel", { enumerable: true, get: function () { return metadata_detector_1.getFlowLabel; } });
Object.defineProperty(exports, "getLayoutObjectName", { enumerable: true, get: function () { return metadata_detector_1.getLayoutObjectName; } });
var tooling_api_1 = require("./tooling-api");
Object.defineProperty(exports, "getDefaultOrg", { enumerable: true, get: function () { return tooling_api_1.getDefaultOrg; } });
Object.defineProperty(exports, "getInstanceUrl", { enumerable: true, get: function () { return tooling_api_1.getInstanceUrl; } });
Object.defineProperty(exports, "getMetadataId", { enumerable: true, get: function () { return tooling_api_1.getMetadataId; } });
var url_builder_1 = require("./url-builder");
Object.defineProperty(exports, "buildSalesforceURL", { enumerable: true, get: function () { return url_builder_1.buildSalesforceURL; } });
//# sourceMappingURL=index.js.map