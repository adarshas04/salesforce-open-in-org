import * as vscode from 'vscode';
import * as fs from 'fs';
import { getMetadataTypeAndName, getDefaultOrg, buildSalesforceURL } from '@salesforce-open-in-org/core';

export function activate(context: vscode.ExtensionContext) {
    console.log('Salesforce Open in Org extension is now active!');

    const disposable = vscode.commands.registerCommand('salesforce-open-in-org.openFile', async (uri: vscode.Uri) => {
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

            const metadataInfo = getMetadataTypeAndName(filePath);
            if (!metadataInfo) {
                vscode.window.showErrorMessage(`Unsupported metadata type for file: ${filePath}`);
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Opening ${metadataInfo.name} in Salesforce org...`,
                cancellable: false
            }, async () => {
                const orgAlias = getDefaultOrg();
                const url = await buildSalesforceURL(orgAlias, metadataInfo.type, metadataInfo.name, filePath);

                await vscode.env.openExternal(vscode.Uri.parse(url));

                vscode.window.showInformationMessage(
                    `Opened ${metadataInfo.name} (${metadataInfo.type}) in org: ${orgAlias}`
                );
            });

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Error: ${message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Salesforce Open in Org extension deactivated');
}
