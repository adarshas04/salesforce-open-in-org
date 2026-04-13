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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const core_1 = require("@salesforce-open-in-org/core");
function activate(context) {
    console.log('Salesforce Open in Org extension is now active!');
    const disposable = vscode.commands.registerCommand('salesforce-open-in-org.openFile', async (uri) => {
        try {
            const filePath = uri ? uri.fsPath : vscode.window.activeTextEditor?.document.uri.fsPath;
            if (!filePath) {
                vscode.window.showErrorMessage('No file selected. Open a metadata file first.');
                return;
            }
            if (!fs.existsSync(filePath)) {
                vscode.window.showErrorMessage(`File not found: ${filePath}`);
                return;
            }
            const metadataInfo = (0, core_1.getMetadataTypeAndName)(filePath);
            if (!metadataInfo) {
                vscode.window.showErrorMessage(`Unsupported metadata type for file: ${filePath}`);
                return;
            }
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Opening ${metadataInfo.name} in Salesforce org...`,
                cancellable: false
            }, async () => {
                const orgAlias = (0, core_1.getDefaultOrg)();
                const url = await (0, core_1.buildSalesforceURL)(orgAlias, metadataInfo.type, metadataInfo.name, filePath);
                await vscode.env.openExternal(vscode.Uri.parse(url));
                vscode.window.showInformationMessage(`Opened ${metadataInfo.name} (${metadataInfo.type}) in org: ${orgAlias}`);
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Error: ${message}`);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    console.log('Salesforce Open in Org extension deactivated');
}
//# sourceMappingURL=extension.js.map