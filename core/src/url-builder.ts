import { getMetadataId, getInstanceUrl } from './tooling-api';
import { getLayoutObjectName } from './metadata-detector';

/**
 * Build the Salesforce Setup URL for a given metadata type, name, and optional file path.
 * Resolves IDs via Tooling API when possible; falls back to name-based URLs.
 */
export async function buildSalesforceURL(
    orgAlias: string,
    metadataType: string,
    metadataName: string,
    filePath: string
): Promise<string> {
    const instanceUrl = getInstanceUrl(orgAlias);
    const metadataId = await getMetadataId(orgAlias, metadataType, metadataName);

    switch (metadataType) {
        case 'ApexClass':
            return metadataId
                ? `${instanceUrl}/lightning/setup/ApexClasses/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/ApexClasses/page?address=%2F${metadataName}`;

        case 'ApexTrigger':
            return metadataId
                ? `${instanceUrl}/lightning/setup/ApexTriggers/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/ApexTriggers/page?address=%2F${metadataName}`;

        case 'Flow':
            if (!metadataId) {
                throw new Error(`Could not find Flow ID for: ${metadataName}`);
            }
            return `${instanceUrl}/builder_platform_interaction/flowBuilder.app?flowId=${metadataId}`;

        case 'ApexPage':
            return metadataId
                ? `${instanceUrl}/lightning/setup/ApexPages/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/ApexPages/page?address=%2F${metadataName}`;

        case 'ApexComponent':
            return metadataId
                ? `${instanceUrl}/lightning/setup/ApexComponents/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/ApexComponents/page?address=%2F${metadataName}`;

        case 'CustomObject':
            return `${instanceUrl}/lightning/setup/ObjectManager/${metadataName}/Details/view`;

        case 'CustomField': {
            const [objName, fldName] = metadataName.split('.');
            return metadataId
                ? `${instanceUrl}/lightning/setup/ObjectManager/${objName}/FieldsAndRelationships/${metadataId}/view`
                : `${instanceUrl}/lightning/setup/ObjectManager/${objName}/FieldsAndRelationships/${fldName}/view`;
        }

        case 'Layout': {
            const objectName = getLayoutObjectName(filePath);
            if (metadataId && objectName) {
                return `${instanceUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/${metadataId}/view`;
            } else if (objectName) {
                return `${instanceUrl}/lightning/setup/ObjectManager/${objectName}/PageLayouts/view`;
            }
            return `${instanceUrl}/lightning/setup/Layouts/page`;
        }

        case 'LightningComponentBundle':
            return metadataId
                ? `${instanceUrl}/lightning/setup/LightningComponentBundles/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/LightningComponentBundles/page?address=%2F${metadataName}`;

        case 'AuraDefinitionBundle':
            return metadataId
                ? `${instanceUrl}/lightning/setup/AuraDefinitionBundles/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/AuraDefinitionBundles/page?address=%2F${metadataName}`;

        case 'PermissionSet':
            return metadataId
                ? `${instanceUrl}/lightning/setup/PermSets/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/PermSets/page?address=%2F${metadataName}`;

        case 'Profile':
            return metadataId
                ? `${instanceUrl}/lightning/setup/Profiles/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/Profiles/page?address=%2F${metadataName}`;

        case 'CustomTab':
            return metadataId
                ? `${instanceUrl}/lightning/setup/Tabs/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/Tabs/page?address=%2F${metadataName}`;

        case 'CustomApplication':
            return metadataId
                ? `${instanceUrl}/lightning/setup/AppManager/page?address=%2F${metadataId}`
                : `${instanceUrl}/lightning/setup/AppManager/page?address=%2F${metadataName}`;

        default:
            return `${instanceUrl}/lightning/setup/CustomMetadata/page?address=%2F${metadataName}`;
    }
}
