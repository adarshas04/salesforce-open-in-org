import { execSync } from 'child_process';

// Tooling API metadata objects and their key fields
const TOOLING_OBJECTS: Record<string, { toolingObject: string; nameField: string }> = {
    'ApexClass': { toolingObject: 'ApexClass', nameField: 'Name' },
    'ApexTrigger': { toolingObject: 'ApexTrigger', nameField: 'Name' },
    'ApexPage': { toolingObject: 'ApexPage', nameField: 'Name' },
    'ApexComponent': { toolingObject: 'ApexComponent', nameField: 'Name' },
    'Flow': { toolingObject: 'Flow', nameField: 'MasterLabel' },
    'LightningComponentBundle': { toolingObject: 'LightningComponentBundle', nameField: 'DeveloperName' },
    'AuraDefinitionBundle': { toolingObject: 'AuraDefinitionBundle', nameField: 'DeveloperName' },
    'Layout': { toolingObject: 'Layout', nameField: 'Name' },
    'PermissionSet': { toolingObject: 'PermissionSet', nameField: 'Name' },
    'Profile': { toolingObject: 'Profile', nameField: 'Name' },
    'CustomTab': { toolingObject: 'CustomTab', nameField: 'Name' },
    'CustomApplication': { toolingObject: 'CustomApplication', nameField: 'Name' },
    'CustomField': { toolingObject: 'CustomField', nameField: 'DeveloperName' }
};

/**
 * Get the default Salesforce org alias from the CLI.
 * Throws if no default org is set.
 */
export function getDefaultOrg(): string {
    try {
        const result = execSync('sf org display --json', { encoding: 'utf8', stdio: 'pipe' });
        const orgInfo = JSON.parse(result);
        return orgInfo.result.alias || orgInfo.result.username;
    } catch {
        throw new Error('No default org found. Run: sf org set-default <org>');
    }
}

/**
 * Get the Salesforce instance URL for the given org alias.
 */
export function getInstanceUrl(orgAlias: string): string {
    const result = execSync(`sf org display --json -o ${orgAlias}`, { encoding: 'utf8', stdio: 'pipe' });
    const orgInfo = JSON.parse(result);
    return orgInfo.result.instanceUrl;
}

/**
 * Resolve the 18-char Salesforce metadata ID via Tooling API.
 * Returns null if the metadata type is unsupported or the record is not found.
 */
export async function getMetadataId(orgAlias: string, metadataType: string, metadataName: string): Promise<string | null> {
    try {
        const config = TOOLING_OBJECTS[metadataType];
        if (!config) return null;

        let query: string;

        if (metadataType === 'Flow') {
            const escapedLabel = metadataName.replace(/'/g, "\\'");
            query = `SELECT Id, Status FROM ${config.toolingObject} WHERE ${config.nameField} = '${escapedLabel}'`;
            const result = execSync(
                `sf data query --query "${query}" --target-org ${orgAlias} --json --use-tooling-api`,
                { encoding: 'utf8', stdio: 'pipe' }
            );
            const records = JSON.parse(result).result.records;
            if (!records?.length) throw new Error(`No Flow found with label: ${metadataName}`);
            const active = records.find((r: { Status: string }) => r.Status === 'Active');
            return active ? active.Id : records[0].Id;

        } else if (metadataType === 'CustomField') {
            const [objectName, fieldName] = metadataName.split('.');
            const devField = fieldName.replace(/__c$/, '');
            const devObject = objectName.replace(/__c$/, '');
            const escapedField = devField.replace(/'/g, "\\'");
            const escapedObject = devObject.replace(/'/g, "\\'");

            query = `SELECT Id, DeveloperName FROM ${config.toolingObject} WHERE ${config.nameField} = '${escapedField}' AND EntityDefinition.DeveloperName = '${escapedObject}' LIMIT 1`;
            const result = execSync(
                `sf data query --query "${query}" --target-org ${orgAlias} --json --use-tooling-api`,
                { encoding: 'utf8', stdio: 'pipe' }
            );
            const records = JSON.parse(result).result.records;
            if (!records?.length) throw new Error(`No CustomField found: ${metadataName}`);
            return records[0].Id;

        } else {
            let searchName = metadataName;
            if (metadataType === 'Layout') {
                searchName = decodeURIComponent(metadataName);
            }
            const escapedName = searchName.replace(/'/g, "\\'");
            query = `SELECT Id, ${config.nameField} FROM ${config.toolingObject} WHERE ${config.nameField} = '${escapedName}' LIMIT 1`;
            const result = execSync(
                `sf data query --query "${query}" --target-org ${orgAlias} --json --use-tooling-api`,
                { encoding: 'utf8', stdio: 'pipe' }
            );
            const records = JSON.parse(result).result.records;
            if (!records?.length) throw new Error(`No ${metadataType} found: ${searchName}`);
            return records[0].Id;
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error querying ${metadataType} ID: ${message}`);
        return null;
    }
}
