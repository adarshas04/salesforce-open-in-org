import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import * as fs from 'fs';
import * as path from 'path';
import { getMetadataTypeAndName, getDefaultOrg, buildSalesforceURL } from '@salesforce-open-in-org/core';

// Lazy-load 'open' to avoid ESM issues at import time
async function openUrl(url: string): Promise<void> {
    const open = (await import('open')).default;
    await open(url);
}

export class OpenMetadata extends SfCommand<{ url: string; metadataType: string; metadataName: string }> {
    public static readonly summary = 'Open a Salesforce metadata file directly in your org browser';
    public static readonly description =
        'Detects the metadata type from the file path, resolves the metadata ID via Tooling API, ' +
        'and opens the correct Setup URL in your default browser. Supports 15+ metadata types.';
    public static readonly examples = [
        '<%= config.bin %> <%= command.id %> --file force-app/main/default/classes/MyClass.cls',
        '<%= config.bin %> <%= command.id %> --file force-app/main/default/flows/MyFlow.flow-meta.xml',
        '<%= config.bin %> <%= command.id %> --file force-app/main/default/objects/Account/fields/MyField__c.field-meta.xml',
    ];

    public static readonly flags = {
        file: Flags.file({
            char: 'f',
            summary: 'Path to the metadata file to open in the org',
            required: true,
            exists: true,
        }),
        'url-only': Flags.boolean({
            summary: 'Print the URL instead of opening the browser',
            default: false,
        }),
        'target-org': Flags.string({
            char: 'o',
            summary: 'Org alias or username to open the file in (defaults to your default org)',
        }),
    };

    public async run(): Promise<{ url: string; metadataType: string; metadataName: string }> {
        const { flags } = await this.parse(OpenMetadata);

        let filePath = flags.file as string;

        // Resolve to absolute path
        if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(process.cwd(), filePath);
        }

        if (!fs.existsSync(filePath)) {
            this.error(`File not found: ${filePath}`);
        }

        // Detect metadata type
        const metadataInfo = getMetadataTypeAndName(filePath);
        if (!metadataInfo) {
            this.error(`Unsupported metadata type for file: ${filePath}`);
        }

        // Resolve org
        const orgAlias = flags['target-org'] ?? getDefaultOrg();

        this.spinner.start(`Resolving ${metadataInfo.type}: ${metadataInfo.name}`);

        // Build URL
        const url = await buildSalesforceURL(orgAlias, metadataInfo.type, metadataInfo.name, filePath);

        this.spinner.stop();

        if (flags['url-only']) {
            this.log(url);
        } else {
            await openUrl(url);
            this.log(`Opened ${metadataInfo.name} (${metadataInfo.type}) in org: ${orgAlias}`);
        }

        return { url, metadataType: metadataInfo.type, metadataName: metadataInfo.name };
    }
}
