"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenMetadata = void 0;
const sf_plugins_core_1 = require("@salesforce/sf-plugins-core");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const core_1 = require("@salesforce-open-in-org/core");
// Lazy-load 'open' to avoid ESM issues at import time
async function openUrl(url) {
    const open = (await Promise.resolve().then(() => __importStar(require('open')))).default;
    await open(url);
}
class OpenMetadata extends sf_plugins_core_1.SfCommand {
    async run() {
        const { flags } = await this.parse(OpenMetadata);
        let filePath = flags.file;
        // Resolve to absolute path
        if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(process.cwd(), filePath);
        }
        if (!fs.existsSync(filePath)) {
            this.error(`File not found: ${filePath}`);
        }
        // Detect metadata type
        const metadataInfo = (0, core_1.getMetadataTypeAndName)(filePath);
        if (!metadataInfo) {
            this.error(`Unsupported metadata type for file: ${filePath}`);
        }
        // Resolve org
        const orgAlias = flags['target-org'] ?? (0, core_1.getDefaultOrg)();
        this.spinner.start(`Resolving ${metadataInfo.type}: ${metadataInfo.name}`);
        // Build URL
        const url = await (0, core_1.buildSalesforceURL)(orgAlias, metadataInfo.type, metadataInfo.name, filePath);
        this.spinner.stop();
        if (flags['url-only']) {
            this.log(url);
        }
        else {
            await openUrl(url);
            this.log(`Opened ${metadataInfo.name} (${metadataInfo.type}) in org: ${orgAlias}`);
        }
        return { url, metadataType: metadataInfo.type, metadataName: metadataInfo.name };
    }
}
exports.OpenMetadata = OpenMetadata;
OpenMetadata.summary = 'Open a Salesforce metadata file directly in your org browser';
OpenMetadata.description = 'Detects the metadata type from the file path, resolves the metadata ID via Tooling API, ' +
    'and opens the correct Setup URL in your default browser. Supports 15+ metadata types.';
OpenMetadata.examples = [
    '<%= config.bin %> <%= command.id %> --file force-app/main/default/classes/MyClass.cls',
    '<%= config.bin %> <%= command.id %> --file force-app/main/default/flows/MyFlow.flow-meta.xml',
    '<%= config.bin %> <%= command.id %> --file force-app/main/default/objects/Account/fields/MyField__c.field-meta.xml',
];
OpenMetadata.flags = {
    file: sf_plugins_core_1.Flags.file({
        char: 'f',
        summary: 'Path to the metadata file to open in the org',
        required: true,
        exists: true,
    }),
    'url-only': sf_plugins_core_1.Flags.boolean({
        summary: 'Print the URL instead of opening the browser',
        default: false,
    }),
    'target-org': sf_plugins_core_1.Flags.string({
        char: 'o',
        summary: 'Org alias or username to open the file in (defaults to your default org)',
    }),
};
//# sourceMappingURL=metadata.js.map