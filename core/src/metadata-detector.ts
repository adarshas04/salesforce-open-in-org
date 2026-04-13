import * as fs from 'fs';
import * as path from 'path';

export interface MetadataInfo {
    type: string;
    name: string;
}

// Metadata type mappings for Salesforce URLs
const METADATA_URL_MAPPINGS: Record<string, string> = {
    '.cls': 'ApexClass',
    '.trigger': 'ApexTrigger',
    '.page': 'ApexPage',
    '.component': 'ApexComponent',
    '.flow-meta.xml': 'Flow',
    '.flow': 'Flow',
    '.object': 'CustomObject',
    '.field': 'CustomField',
    '.layout': 'Layout',
    '.recordType': 'RecordType',
    '.permissionset': 'PermissionSet',
    '.profile': 'Profile',
    '.app': 'CustomApplication',
    '.tab': 'CustomTab',
    '.LightningComponentBundle': 'LightningComponentBundle',
    '.auracomponent': 'AuraDefinitionBundle'
};

/**
 * Extract the Flow label from its XML file content.
 * Falls back to null if label cannot be extracted.
 */
export function getFlowLabel(filePath: string): string | null {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const labelMatch =
            content.match(/<interviewLabel>[\s\S]*?<\/interviewLabel>[\s\S]*?<label>([^<]+)<\/label>/) ||
            content.match(/<formulas>[\s\S]*?<\/formulas>[\s\S]*?<label>([^<]+)<\/label>/);
        if (labelMatch) {
            return labelMatch[1].replace(/&apos;/g, "'");
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Detect the Salesforce metadata type and API name from a file path
 * inside an SFDX project structure (force-app/main/default/...).
 */
export function getMetadataTypeAndName(filePath: string): MetadataInfo | null {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);

    // --- Flow ---
    if (filePath.includes('flows/') && (ext === '.flow' || ext === '.xml')) {
        if (ext === '.xml') {
            const flowLabel = getFlowLabel(filePath);
            if (flowLabel) {
                return { type: 'Flow', name: flowLabel };
            }
        }
        let flowName = basename;
        if (ext === '.xml' && flowName.endsWith('.flow-meta')) {
            flowName = flowName.replace('.flow-meta', '');
        }
        return { type: 'Flow', name: flowName.replace(/-/g, '_') };
    }

    // --- Custom Field ---
    if (filePath.includes('objects/') && filePath.includes('fields/')) {
        const objectName = filePath.split('/objects/')[1].split('/fields/')[0];
        let fieldName = basename;
        if (fieldName.endsWith('.field-meta')) {
            fieldName = fieldName.replace('.field-meta', '');
        }
        return { type: 'CustomField', name: `${objectName}.${fieldName}` };
    }

    // --- Layout ---
    if (filePath.includes('layouts/')) {
        let layoutName = basename;
        if (layoutName.endsWith('.layout-meta')) {
            layoutName = layoutName.replace('.layout-meta', '');
        }
        const parts = layoutName.split('-');
        if (parts.length > 1) {
            layoutName = parts.slice(1).join('-');
        }
        return { type: 'Layout', name: layoutName };
    }

    // --- LWC ---
    if (filePath.includes('lwc/') || filePath.includes('main/default/lwc/')) {
        return { type: 'LightningComponentBundle', name: basename };
    }

    // --- Aura ---
    if (filePath.includes('aura/')) {
        return { type: 'AuraDefinitionBundle', name: basename };
    }

    // --- Permission Set ---
    if (filePath.includes('permissionsets/') && ext === '.xml') {
        let permissionSetName = basename;
        if (permissionSetName.endsWith('.permissionset-meta')) {
            permissionSetName = permissionSetName.replace('.permissionset-meta', '');
        }
        return { type: 'PermissionSet', name: permissionSetName };
    }

    // --- Profile ---
    if (filePath.includes('profiles/') && ext === '.xml') {
        let profileName = basename;
        if (profileName.endsWith('.profile-meta')) {
            profileName = profileName.replace('.profile-meta', '');
        }
        return { type: 'Profile', name: profileName };
    }

    // --- Standard extension mappings ---
    const metadataType = METADATA_URL_MAPPINGS[ext] || METADATA_URL_MAPPINGS[ext.replace('-meta.xml', '')];
    if (metadataType) {
        return { type: metadataType, name: basename };
    }

    return null;
}

/**
 * Extract the object API name from a layout file path.
 * e.g. ".../layouts/Opportunity-FY'25 Opp Layout.layout-meta.xml" → "Opportunity"
 */
export function getLayoutObjectName(filePath: string): string {
    if (!filePath.includes('/layouts/')) return '';
    const fileName = path.basename(filePath, '.xml');
    const parts = fileName.split('-');
    return parts.length > 1 ? parts[0] : '';
}
